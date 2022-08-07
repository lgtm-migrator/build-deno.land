// Copyright 2017-2022 @polkadot/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-dupe-class-members */

import type { Observable } from 'https://esm.sh/rxjs@7.5.6';
import type { Address, ApplyExtrinsicResult, Call, Extrinsic, ExtrinsicEra, ExtrinsicStatus, Hash, Header, Index, RuntimeDispatchInfo, SignerPayload } from 'https://deno.land/x/polkadot@0.1.0/types/interfaces/index.ts';
import type { Callback, Codec, Constructor, ISubmittableResult, SignatureOptions } from 'https://deno.land/x/polkadot@0.1.0/types/types/index.ts';
import type { Registry } from 'https://deno.land/x/polkadot@0.1.0/types-codec/types/index.ts';
import type { ApiInterfaceRx, ApiTypes, PromiseOrObs, SignerResult } from '../types/index.ts';
import type { AddressOrPair, SignerOptions, SubmittableDryRunResult, SubmittableExtrinsic, SubmittablePaymentResult, SubmittableResultResult, SubmittableResultSubscription } from './types.ts';

import { catchError, first, map, mapTo, mergeMap, of, switchMap, tap } from 'https://esm.sh/rxjs@7.5.6';

import { isBn, isFunction, isNumber, isString, isU8a, objectSpread } from 'https://deno.land/x/polkadot@0.1.0/util/mod.ts';

import { ApiBase } from '../base/index.ts';
import { filterEvents, isKeyringPair } from '../util/index.ts';
import { SubmittableResult } from './Result.ts';

interface SubmittableOptions<ApiType extends ApiTypes> {
  api: ApiInterfaceRx;
  apiType: ApiTypes;
  blockHash?: Uint8Array;
  decorateMethod: ApiBase<ApiType>['_decorateMethod'];
}

interface UpdateInfo {
  options: SignatureOptions;
  updateId: number;
}

const identity = <T> (input: T): T => input;

function makeEraOptions (api: ApiInterfaceRx, registry: Registry, partialOptions: Partial<SignerOptions>, { header, mortalLength, nonce }: { header: Header | null; mortalLength: number; nonce: Index }): SignatureOptions {
  if (!header) {
    if (partialOptions.era && !partialOptions.blockHash) {
      throw new Error('Expected blockHash to be passed alongside non-immortal era options');
    }

    if (isNumber(partialOptions.era)) {
      // since we have no header, it is immortal, remove any option overrides
      // so we only supply the genesisHash and no era to the construction
      delete partialOptions.era;
      delete partialOptions.blockHash;
    }

    return makeSignOptions(api, partialOptions, { nonce });
  }

  return makeSignOptions(api, partialOptions, {
    blockHash: header.hash,
    era: registry.createTypeUnsafe<ExtrinsicEra>('ExtrinsicEra', [{
      current: header.number,
      period: partialOptions.era || mortalLength
    }]),
    nonce
  });
}

function makeSignAndSendOptions (partialOptions?: Partial<SignerOptions> | Callback<ISubmittableResult>, statusCb?: Callback<ISubmittableResult>): [Partial<SignerOptions>, Callback<ISubmittableResult>?] {
  let options: Partial<SignerOptions> = {};

  if (isFunction(partialOptions)) {
    statusCb = partialOptions;
  } else {
    options = objectSpread({}, partialOptions);
  }

  return [options, statusCb];
}

function makeSignOptions (api: ApiInterfaceRx, partialOptions: Partial<SignerOptions>, extras: { blockHash?: Hash; era?: ExtrinsicEra; nonce?: Index }): SignatureOptions {
  return objectSpread(
    { blockHash: api.genesisHash, genesisHash: api.genesisHash },
    partialOptions,
    extras,
    { runtimeVersion: api.runtimeVersion, signedExtensions: api.registry.signedExtensions, version: api.extrinsicType }
  );
}

function optionsOrNonce (partialOptions: Partial<SignerOptions> = {}): Partial<SignerOptions> {
  return isBn(partialOptions) || isNumber(partialOptions)
    ? { nonce: partialOptions }
    : partialOptions;
}

export function createClass <ApiType extends ApiTypes> ({ api, apiType, blockHash, decorateMethod }: SubmittableOptions<ApiType>): Constructor<SubmittableExtrinsic<ApiType>> {
  // an instance of the base extrinsic for us to extend
  const ExtrinsicBase = api.registry.createClass('Extrinsic');

  class Submittable extends ExtrinsicBase implements SubmittableExtrinsic<ApiType> {
    readonly #ignoreStatusCb: boolean;

    #transformResult: (input: ISubmittableResult) => ISubmittableResult = identity;

    constructor (registry: Registry, extrinsic: Call | Extrinsic | Uint8Array | string) {
      super(registry, extrinsic, { version: api.extrinsicType });

      this.#ignoreStatusCb = apiType === 'rxjs';
    }

    // dry run an extrinsic
    public dryRun (account: AddressOrPair, optionsOrHash?: Partial<SignerOptions> | Uint8Array | string): SubmittableDryRunResult<ApiType> {
      if (blockHash || isString(optionsOrHash) || isU8a(optionsOrHash)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return decorateMethod(
          () => api.rpc.system.dryRun(this.toHex(), blockHash || optionsOrHash as string)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return decorateMethod(
        (): Observable<ApplyExtrinsicResult> =>
          this.#observeSign(account, optionsOrHash).pipe(
            switchMap(() => api.rpc.system.dryRun(this.toHex()))
          )
      )();
    }

    // calculate the payment info for this transaction (if signed and submitted)
    public paymentInfo (account: AddressOrPair, optionsOrHash?: Partial<SignerOptions> | Uint8Array | string): SubmittablePaymentResult<ApiType> {
      if (blockHash || isString(optionsOrHash) || isU8a(optionsOrHash)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return decorateMethod(
          (): Observable<RuntimeDispatchInfo> =>
            api.rpc.payment.queryInfo(this.toHex(), blockHash || optionsOrHash as string)
        );
      }

      const [allOptions] = makeSignAndSendOptions(optionsOrHash);
      const address = isKeyringPair(account) ? account.address : account.toString();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return decorateMethod(
        (): Observable<RuntimeDispatchInfo> =>
          api.derive.tx.signingInfo(address, allOptions.nonce, allOptions.era).pipe(
            first(),
            switchMap((signingInfo): Observable<RuntimeDispatchInfo> => {
              // setup our options (same way as in signAndSend)
              const eraOptions = makeEraOptions(api, this.registry, allOptions, signingInfo);
              const signOptions = makeSignOptions(api, eraOptions, {});

              return api.rpc.payment.queryInfo(
                this.isSigned
                  ? api.tx(this).signFake(address, signOptions).toHex()
                  : this.signFake(address, signOptions).toHex()
              );
            })
          )
      )();
    }

    // send with an immediate Hash result
    public send (): SubmittableResultResult<ApiType>;

    // send with a status callback
    public send (statusCb: Callback<ISubmittableResult>): SubmittableResultSubscription<ApiType>;

    // send implementation for both immediate Hash and statusCb variants
    public send (statusCb?: Callback<ISubmittableResult>): SubmittableResultResult<ApiType> | SubmittableResultSubscription<ApiType> {
      const isSubscription = api.hasSubscriptions && (this.#ignoreStatusCb || !!statusCb);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return decorateMethod(
        isSubscription
          ? this.#observeSubscribe
          : this.#observeSend
      )(statusCb);
    }

    /**
     * @description Signs a transaction, returning `this` to allow chaining. E.g.: `signAsync(...).send()`. Like `.signAndSend` this will retrieve the nonce and blockHash to send the tx with.
     */
    public signAsync (account: AddressOrPair, partialOptions?: Partial<SignerOptions>): PromiseOrObs<ApiType, this> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return decorateMethod(
        (): Observable<this> =>
          this.#observeSign(account, partialOptions).pipe(
            mapTo(this)
          )
      )();
    }

    // signAndSend with an immediate Hash result
    public signAndSend (account: AddressOrPair, partialOptions?: Partial<SignerOptions>): SubmittableResultResult<ApiType>;

    // signAndSend with a subscription, i.e. callback provided
    public signAndSend (account: AddressOrPair, statusCb: Callback<ISubmittableResult>): SubmittableResultSubscription<ApiType>;

    // signAndSend with options and a callback
    public signAndSend (account: AddressOrPair, partialOptions: Partial<SignerOptions>, statusCb?: Callback<ISubmittableResult>): SubmittableResultSubscription<ApiType>;

    // signAndSend implementation for all 3 cases above
    public signAndSend (account: AddressOrPair, partialOptions?: Partial<SignerOptions> | Callback<ISubmittableResult>, optionalStatusCb?: Callback<ISubmittableResult>): SubmittableResultResult<ApiType> | SubmittableResultSubscription<ApiType> {
      const [options, statusCb] = makeSignAndSendOptions(partialOptions, optionalStatusCb);
      const isSubscription = api.hasSubscriptions && (this.#ignoreStatusCb || !!statusCb);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return decorateMethod(
        (): Observable<Codec> => (
          this.#observeSign(account, options).pipe(
            switchMap((info): Observable<ISubmittableResult> | Observable<Hash> =>
              isSubscription
                ? this.#observeSubscribe(info)
                : this.#observeSend(info)
            )
          ) as Observable<Codec>) // FIXME This is wrong, SubmittableResult is _not_ a codec
      )(statusCb);
    }

    // adds a transform to the result, applied before result is returned
    withResultTransform (transform: (input: ISubmittableResult) => ISubmittableResult): this {
      this.#transformResult = transform;

      return this;
    }

    #observeSign = (account: AddressOrPair, partialOptions?: Partial<SignerOptions>): Observable<UpdateInfo> => {
      const address = isKeyringPair(account) ? account.address : account.toString();
      const options = optionsOrNonce(partialOptions);

      return api.derive.tx.signingInfo(address, options.nonce, options.era).pipe(
        first(),
        mergeMap(async (signingInfo): Promise<UpdateInfo> => {
          const eraOptions = makeEraOptions(api, this.registry, options, signingInfo);
          let updateId = -1;

          if (isKeyringPair(account)) {
            this.sign(account, eraOptions);
          } else {
            updateId = await this.#signViaSigner(address, eraOptions, signingInfo.header);
          }

          return { options: eraOptions, updateId };
        })
      );
    };

    #observeStatus = (txHash: Hash, status: ExtrinsicStatus): Observable<ISubmittableResult> => {
      if (!status.isFinalized && !status.isInBlock) {
        return of(this.#transformResult(new SubmittableResult({
          status,
          txHash
        })));
      }

      const blockHash = status.isInBlock
        ? status.asInBlock
        : status.asFinalized;

      return api.derive.tx.events(blockHash).pipe(
        map(({ block, events }): ISubmittableResult =>
          this.#transformResult(new SubmittableResult({
            ...filterEvents(txHash, block, events, status),
            status,
            txHash
          }))
        ),
        catchError((internalError: Error) =>
          of(this.#transformResult(new SubmittableResult({
            internalError,
            status,
            txHash
          })))
        )
      );
    };

    #observeSend = (info: UpdateInfo): Observable<Hash> => {
      return api.rpc.author.submitExtrinsic(this).pipe(
        tap((hash): void => {
          this.#updateSigner(hash, info);
        })
      );
    };

    #observeSubscribe = (info: UpdateInfo): Observable<ISubmittableResult> => {
      const txHash = this.hash;

      return api.rpc.author.submitAndWatchExtrinsic(this).pipe(
        switchMap((status): Observable<ISubmittableResult> =>
          this.#observeStatus(txHash, status)
        ),
        tap((status): void => {
          this.#updateSigner(status, info);
        })
      );
    };

    #signViaSigner = async (address: Address | string | Uint8Array, options: SignatureOptions, header: Header | null): Promise<number> => {
      const signer = options.signer || api.signer;

      if (!signer) {
        throw new Error('No signer specified, either via api.setSigner or via sign options. You possibly need to pass through an explicit keypair for the origin so it can be used for signing.');
      }

      const payload = this.registry.createTypeUnsafe<SignerPayload>('SignerPayload', [objectSpread({}, options, {
        address,
        blockNumber: header ? header.number : 0,
        method: this.method
      })]);
      let result: SignerResult;

      if (isFunction(signer.signPayload)) {
        result = await signer.signPayload(payload.toPayload());
      } else if (isFunction(signer.signRaw)) {
        result = await signer.signRaw(payload.toRaw());
      } else {
        throw new Error('Invalid signer interface, it should implement either signPayload or signRaw (or both)');
      }

      // Here we explicitly call `toPayload()` again instead of working with an object
      // (reference) as passed to the signer. This means that we are sure that the
      // payload data is not modified from our inputs, but the signer
      super.addSignature(address, result.signature, payload.toPayload());

      return result.id;
    };

    #updateSigner = (status: Hash | ISubmittableResult, info?: UpdateInfo): void => {
      if (info && (info.updateId !== -1)) {
        const { options, updateId } = info;
        const signer = options.signer || api.signer;

        if (signer && isFunction(signer.update)) {
          signer.update(updateId, status);
        }
      }
    };
  }

  return Submittable;
}
