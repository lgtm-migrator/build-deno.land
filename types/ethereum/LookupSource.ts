// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { BN } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';

import { AbstractBase } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import { isBigInt, isBn, isHex, isNumber, isU8a, u8aConcat, u8aToBn, u8aToHex, u8aToU8a } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
import { decodeAddress } from 'https://deno.land/x/polkadot@0.2.14/util-crypto/mod.ts';

import { GenericAccountIndex } from '../generic/AccountIndex.ts';
import { GenericEthereumAccountId } from './AccountId.ts';

// eslint-disable-next-line no-use-before-define
type AnyAddress = bigint | BN | GenericEthereumLookupSource | GenericEthereumAccountId | GenericAccountIndex | number[] | Uint8Array | number | string;

export const ACCOUNT_ID_PREFIX = new Uint8Array([0xff]);

/** @internal */
function decodeString (registry: Registry, value: string): GenericEthereumAccountId | GenericAccountIndex {
  const decoded = decodeAddress(value);

  return decoded.length === 20
    ? registry.createTypeUnsafe('EthereumAccountId', [decoded])
    : registry.createTypeUnsafe('AccountIndex', [u8aToBn(decoded)]);
}

/** @internal */
function decodeU8a (registry: Registry, value: Uint8Array): GenericEthereumAccountId | GenericAccountIndex {
  // This allows us to instantiate an address with a raw publicKey. Do this first before
  // we checking the first byte, otherwise we may split an already-existent valid address
  if (value.length === 20) {
    return registry.createTypeUnsafe('EthereumAccountId', [value]);
  } else if (value[0] === 0xff) {
    return registry.createTypeUnsafe('EthereumAccountId', [value.subarray(1)]);
  }

  const [offset, length] = GenericAccountIndex.readLength(value);

  return registry.createTypeUnsafe('AccountIndex', [u8aToBn(value.subarray(offset, offset + length))]);
}

function decodeAddressOrIndex (registry: Registry, value: AnyAddress): GenericEthereumAccountId | GenericAccountIndex {
  return value instanceof GenericEthereumLookupSource
    ? value.inner
    : value instanceof GenericEthereumAccountId || value instanceof GenericAccountIndex
      ? value
      : isU8a(value) || Array.isArray(value) || isHex(value)
        ? decodeU8a(registry, u8aToU8a(value))
        : isBn(value) || isNumber(value) || isBigInt(value)
          ? registry.createTypeUnsafe('AccountIndex', [value])
          : decodeString(registry, value);
}

/**
 * @name GenericEthereumLookupSource
 * @description
 * A wrapper around an EthereumAccountId and/or AccountIndex that is encoded with a prefix.
 * Since we are dealing with underlying publicKeys (or shorter encoded addresses),
 * we extend from Base with an AccountId/AccountIndex wrapper. Basically the Address
 * is encoded as `[ <prefix-byte>, ...publicKey/...bytes ]` as per spec
 */
export class GenericEthereumLookupSource extends AbstractBase<GenericEthereumAccountId | GenericAccountIndex> {
  constructor (registry: Registry, value: AnyAddress = new Uint8Array()) {
    super(registry, decodeAddressOrIndex(registry, value));
  }

  /**
   * @description The length of the value when encoded as a Uint8Array
   */
  public override get encodedLength (): number {
    const rawLength = this._rawLength;

    return rawLength + (
      // for 1 byte AccountIndexes, we are not adding a specific prefix
      rawLength > 1
        ? 1
        : 0
    );
  }

  /**
   * @description The length of the raw value, either AccountIndex or AccountId
   */
  protected get _rawLength (): number {
    return this.inner instanceof GenericAccountIndex
      ? GenericAccountIndex.calcLength(this.inner)
      : this.inner.encodedLength;
  }

  /**
   * @description Returns a hex string representation of the value
   */
  public override toHex (): HexString {
    return u8aToHex(this.toU8a());
  }

  /**
   * @description Returns the base runtime type name for this instance
   */
  public override toRawType (): string {
    return 'Address';
  }

  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */
  public override toU8a (isBare?: boolean): Uint8Array {
    const encoded = this.inner.toU8a().subarray(0, this._rawLength);

    return isBare
      ? encoded
      : u8aConcat(
        this.inner instanceof GenericAccountIndex
          ? GenericAccountIndex.writeLength(encoded)
          : ACCOUNT_ID_PREFIX,
        encoded
      );
  }
}
