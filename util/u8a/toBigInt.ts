// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToBnOptions } from '../types.ts';

import { BigInt } from 'https://deno.land/x/polkadot@0.2.14/x-bigint/mod.ts';

import { _1n } from '../bi/consts.ts';

const U8_MAX = BigInt(256);
const U16_MAX = BigInt(256 * 256);

/**
 * @name u8aToBigInt
 * @summary Creates a BigInt from a Uint8Array object.
 */
export function u8aToBigInt (value: Uint8Array, { isLe = true, isNegative = false }: ToBnOptions = {}): bigint {
  if (!value || !value.length) {
    return BigInt(0);
  }

  const u8a = isLe
    ? value
    : value.reverse();

  const dvI = new DataView(u8a.buffer, u8a.byteOffset);
  const mod = u8a.length % 2;
  let result = BigInt(0);

  // This is mostly written for readability (with the single isNegative shortcut),
  // as opposed to performance, e.g. `u8aToBn` does loop unrolling, etc.
  if (isNegative) {
    for (let i = u8a.length - 2; i >= mod; i -= 2) {
      result = (result * U16_MAX) + BigInt(dvI.getUint16(i, true) ^ 0xffff);
    }

    if (mod) {
      result = (result * U8_MAX) + BigInt(dvI.getUint8(0) ^ 0xff);
    }
  } else {
    for (let i = u8a.length - 2; i >= mod; i -= 2) {
      result = (result * U16_MAX) + BigInt(dvI.getUint16(i, true));
    }

    if (mod) {
      result = (result * U8_MAX) + BigInt(dvI.getUint8(0));
    }
  }

  return isNegative
    ? ((result * -_1n) - _1n)
    : result;
}
