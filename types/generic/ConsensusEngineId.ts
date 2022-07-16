// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyU8a, Registry } from 'https://deno.land/x/polkadot@0.0.6/types-codec/types/index.ts';
import type { AccountId, RawAuraPreDigest, RawBabePreDigestCompat } from '../interfaces/index.ts';

import { Bytes, U8aFixed, u32 } from 'https://deno.land/x/polkadot@0.0.6/types-codec/mod.ts';
import { BN, bnToU8a, isNumber, stringToU8a, u8aToHex, u8aToString } from 'https://deno.land/x/polkadot@0.0.6/util/mod.ts';

export const CID_AURA = stringToU8a('aura');
export const CID_BABE = stringToU8a('BABE');
export const CID_GRPA = stringToU8a('FRNK');
export const CID_POW = stringToU8a('pow_');

function getAuraAuthor (registry: Registry, bytes: Bytes, sessionValidators: AccountId[]): AccountId {
  return sessionValidators[
    registry.createTypeUnsafe<RawAuraPreDigest>('RawAuraPreDigest', [bytes.toU8a(true)])
      .slotNumber
      .mod(new BN(sessionValidators.length))
      .toNumber()
  ];
}

function getBabeAuthor (registry: Registry, bytes: Bytes, sessionValidators: AccountId[]): AccountId {
  const digest = registry.createTypeUnsafe<RawBabePreDigestCompat>('RawBabePreDigestCompat', [bytes.toU8a(true)]);

  return sessionValidators[
    (digest.value as u32).toNumber()
  ];
}

function getBytesAsAuthor (registry: Registry, bytes: Bytes): AccountId {
  return registry.createTypeUnsafe('AccountId', [bytes]);
}

/**
 * @name GenericConsensusEngineId
 * @description
 * A 4-byte identifier identifying the engine
 */
export class GenericConsensusEngineId extends U8aFixed {
  constructor (registry: Registry, value?: AnyU8a) {
    super(
      registry,
      isNumber(value)
        ? bnToU8a(value, { isLe: false })
        : value,
      32
    );
  }

  /**
   * @description `true` if the engine matches aura
   */
  public get isAura (): boolean {
    return this.eq(CID_AURA);
  }

  /**
   * @description `true` is the engine matches babe
   */
  public get isBabe (): boolean {
    return this.eq(CID_BABE);
  }

  /**
   * @description `true` is the engine matches grandpa
   */
  public get isGrandpa (): boolean {
    return this.eq(CID_GRPA);
  }

  /**
   * @description `true` is the engine matches pow
   */
  public get isPow (): boolean {
    return this.eq(CID_POW);
  }

  /**
   * @description From the input bytes, decode into an author
   */
  public extractAuthor (bytes: Bytes, sessionValidators: AccountId[]): AccountId | undefined {
    if (sessionValidators?.length) {
      if (this.isAura) {
        return getAuraAuthor(this.registry, bytes, sessionValidators);
      } else if (this.isBabe) {
        return getBabeAuthor(this.registry, bytes, sessionValidators);
      }
    }

    // For pow & Moonbeam, the bytes are the actual author
    if (this.isPow || bytes.length === 20) {
      return getBytesAsAuthor(this.registry, bytes);
    }

    return undefined;
  }

  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */
  public override toHuman (): string {
    return this.toString();
  }

  /**
   * @description Returns the base runtime type name for this instance
   */
  public override toRawType (): string {
    return 'ConsensusEngineId';
  }

  /**
   * @description Override the default toString to return a 4-byte string
   */
  public override toString (): string {
    return this.isAscii
      ? u8aToString(this)
      : u8aToHex(this);
  }
}
