// Copyright 2017-2022 @polkadot/api-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { AccountId, Address, ApplyExtrinsicResult, Call, DispatchError, DispatchInfo, EventRecord, Extrinsic, ExtrinsicStatus, Hash, RuntimeDispatchInfo } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';
import type { AnyFunction, AnyNumber, AnyTuple, Callback, CallBase, Codec, IExtrinsicEra, IKeyringPair, ISubmittableResult, Signer } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';
import type { ApiTypes, PromiseOrObs } from './base.ts';

export type AugmentedSubmittable<T extends AnyFunction, A extends AnyTuple = AnyTuple> = T & CallBase<A>;

export type AddressOrPair = IKeyringPair | string | AccountId | Address;

export interface SignerOptions {
  blockHash: Uint8Array | string;
  era?: IExtrinsicEra | number;
  nonce: AnyNumber | Codec;
  signer?: Signer;
  tip?: AnyNumber;
  assetId?: AnyNumber;
}

export type SubmittableDryRunResult<ApiType extends ApiTypes> =
  ApiType extends 'rxjs'
    ? Observable<ApplyExtrinsicResult>
    : Promise<ApplyExtrinsicResult>;

export type SubmittableResultResult<ApiType extends ApiTypes, R extends ISubmittableResult = ISubmittableResult> =
  ApiType extends 'rxjs'
    ? Observable<R>
    : Promise<Hash>;

export type SubmittableResultSubscription<ApiType extends ApiTypes, R extends ISubmittableResult = ISubmittableResult> =
  ApiType extends 'rxjs'
    ? Observable<R>
    : Promise<() => void>;

export type SubmittablePaymentResult<ApiType extends ApiTypes> =
  ApiType extends 'rxjs'
    ? Observable<RuntimeDispatchInfo>
    : Promise<RuntimeDispatchInfo>;

export interface SubmittableResultValue {
  dispatchError?: DispatchError;
  dispatchInfo?: DispatchInfo;
  events?: EventRecord[];
  internalError?: Error;
  status: ExtrinsicStatus;
  txHash: Hash;
  txIndex?: number;
}

export interface SubmittableExtrinsic<ApiType extends ApiTypes, R extends ISubmittableResult = ISubmittableResult> extends Extrinsic {
  dryRun (account: AddressOrPair, options?: Partial<SignerOptions>): SubmittableDryRunResult<ApiType>;

  paymentInfo (account: AddressOrPair, options?: Partial<SignerOptions>): SubmittablePaymentResult<ApiType>;

  send (): SubmittableResultResult<ApiType>;

  send (statusCb: Callback<R>): SubmittableResultSubscription<ApiType, R>;

  signAsync (account: AddressOrPair, _options?: Partial<SignerOptions>): PromiseOrObs<ApiType, this>;

  signAndSend (account: AddressOrPair, options?: Partial<SignerOptions>): SubmittableResultResult<ApiType, R>;

  signAndSend (account: AddressOrPair, statusCb: Callback<R>): SubmittableResultSubscription<ApiType>;

  signAndSend (account: AddressOrPair, options: Partial<SignerOptions>, statusCb?: Callback<R>): SubmittableResultSubscription<ApiType, R>;

  withResultTransform (transform: (input: ISubmittableResult) => ISubmittableResult): this;
}

export interface SubmittableExtrinsicFunction<ApiType extends ApiTypes, A extends AnyTuple = AnyTuple> extends CallBase<A> {
  (...params: any[]): SubmittableExtrinsic<ApiType>;
}

// augmented interfaces

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-interface
export interface AugmentedSubmittables<ApiType extends ApiTypes> {
  // augmented
}

export interface SubmittableExtrinsics<ApiType extends ApiTypes> extends AugmentedSubmittables<ApiType> {
  (extrinsic: Call | Extrinsic | Uint8Array | string): SubmittableExtrinsic<ApiType>;
  // when non-augmented, we need to at least have Codec results
  [key: string]: SubmittableModuleExtrinsics<ApiType>;
}

export interface SubmittableModuleExtrinsics<ApiType extends ApiTypes> {
  // only with is<Type> augmentation
  [key: string]: SubmittableExtrinsicFunction<ApiType>;
}
