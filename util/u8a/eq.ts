// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.ts';

import { u8aToU8a } from './toU8a.ts';

/**
 * @name u8aEq
 * @summary Compares two Uint8Arrays for equality.
 * @description
 * For `UInt8Array` (or hex string) input values true if there is a match.
 * @example
 * <BR>
 *
 * ```javascript
 * import { u8aEq } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * u8aEq(new Uint8Array([0x68, 0x65]), new Uint8Array([0x68, 0x65])); // true
 * ```
 */
export function u8aEq (a: HexString | Uint8Array | string, b: HexString | Uint8Array | string): boolean {
  const u8aa = u8aToU8a(a);
  const u8ab = u8aToU8a(b);

  if (u8aa.length === u8ab.length) {
    const dvA = new DataView(u8aa.buffer, u8aa.byteOffset);
    const dvB = new DataView(u8ab.buffer, u8ab.byteOffset);
    const mod = (u8aa.length % 4) | 0;
    const length = (u8aa.length - mod) | 0;

    for (let i = 0; i < length; i += 4) {
      if (dvA.getUint32(i) !== dvB.getUint32(i)) {
        return false;
      }
    }

    for (let i = length; i < u8aa.length; i++) {
      if (u8aa[i] !== u8ab[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}
