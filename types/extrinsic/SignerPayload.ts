// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';
import type { Address, Call, ExtrinsicEra, Hash } from '../interfaces/index.ts';
import type { Codec, ICompact, INumber, IRuntimeVersion, ISignerPayload, SignerPayloadJSON, SignerPayloadRaw } from '../types/index.ts';

import { Option, Struct, Text, Vec } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import { objectProperty, objectSpread, u8aToHex } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

export interface SignerPayloadType extends Codec {
  address: Address;
  blockHash: Hash;
  blockNumber: INumber;
  era: ExtrinsicEra;
  genesisHash: Hash;
  method: Call;
  nonce: ICompact<INumber>;
  runtimeVersion: IRuntimeVersion;
  signedExtensions: Vec<Text>;
  tip: ICompact<INumber>;
  version: INumber;
}

const knownTypes: Record<string, string> = {
  address: 'Address',
  blockHash: 'Hash',
  blockNumber: 'BlockNumber',
  era: 'ExtrinsicEra',
  genesisHash: 'Hash',
  method: 'Call',
  nonce: 'Compact<Index>',
  runtimeVersion: 'RuntimeVersion',
  signedExtensions: 'Vec<Text>',
  tip: 'Compact<Balance>',
  version: 'u8'
};

/**
 * @name GenericSignerPayload
 * @description
 * A generic signer payload that can be used for serialization between API and signer
 */
export class GenericSignerPayload extends Struct implements ISignerPayload, SignerPayloadType {
  readonly #extraTypes: Record<string, string>;

  constructor (registry: Registry, value?: HexString | { [x: string]: unknown; } | Map<unknown, unknown> | unknown[]) {
    const extensionTypes = objectSpread<Record<string, string>>({}, registry.getSignedExtensionTypes(), registry.getSignedExtensionExtra());

    super(registry, objectSpread<Record<string, string>>({}, extensionTypes, knownTypes), value);

    this.#extraTypes = {};
    const getter = (key: string) => this.get(key);

    // add all extras that are not in the base types
    for (const [key, type] of Object.entries(extensionTypes)) {
      if (!knownTypes[key]) {
        this.#extraTypes[key] = type;
      }

      objectProperty(this, key, getter);
    }
  }

  get address (): Address {
    return this.getT('address');
  }

  get blockHash (): Hash {
    return this.getT('blockHash');
  }

  get blockNumber (): INumber {
    return this.getT('blockNumber');
  }

  get era (): ExtrinsicEra {
    return this.getT('era');
  }

  get genesisHash (): Hash {
    return this.getT('genesisHash');
  }

  get method (): Call {
    return this.getT('method');
  }

  get nonce (): ICompact<INumber> {
    return this.getT('nonce');
  }

  get runtimeVersion (): IRuntimeVersion {
    return this.getT('runtimeVersion');
  }

  get signedExtensions (): Vec<Text> {
    return this.getT('signedExtensions');
  }

  get tip (): ICompact<INumber> {
    return this.getT('tip');
  }

  get version (): INumber {
    return this.getT('version');
  }

  /**
   * @description Creates an representation of the structure as an ISignerPayload JSON
   */
  public toPayload (): SignerPayloadJSON {
    const result: Record<string, string> = {};
    const keys = Object.keys(this.#extraTypes);

    // add any explicit overrides we may have
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = this.get(key) as Codec;
      const isOption = value instanceof Option;

      // Don't include Option.isNone
      if (!isOption || value.isSome) {
        result[key] = value.toHex();
      }
    }

    return objectSpread(result, {
      // the known defaults as managed explicitly and has different
      // formatting in cases, e.g. we mostly expose a hex format here
      address: this.address.toString(),
      blockHash: this.blockHash.toHex(),
      blockNumber: this.blockNumber.toHex(),
      era: this.era.toHex(),
      genesisHash: this.genesisHash.toHex(),
      method: this.method.toHex(),
      nonce: this.nonce.toHex(),
      signedExtensions: this.signedExtensions.map((e) => e.toString()),
      specVersion: this.runtimeVersion.specVersion.toHex(),
      tip: this.tip.toHex(),
      transactionVersion: this.runtimeVersion.transactionVersion.toHex(),
      version: this.version.toNumber()
    });
  }

  /**
   * @description Creates a representation of the payload in raw Exrinsic form
   */
  public toRaw (): SignerPayloadRaw {
    const payload = this.toPayload();
    const data = u8aToHex(
      this.registry
        .createTypeUnsafe('ExtrinsicPayload', [payload, { version: payload.version }])
        // NOTE Explicitly pass the bare flag so the method is encoded un-prefixed (non-decodable, for signing only)
        .toU8a({ method: true })
    );

    return {
      address: payload.address,
      data,
      type: 'payload'
    };
  }
}
