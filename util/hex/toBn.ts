// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToBnOptions } from '../types.ts';

import { BN } from '../bn/bn.ts';
import { hexStripPrefix } from './stripPrefix.ts';

/**
 * @name hexToBn
 * @summary Creates a BN.js object from a hex string.
 * @description
 * `null` inputs returns a `BN(0)` result. Hex input values return the actual value converted to a BN. Anything that is not a hex string (including the `0x` prefix) throws an error.
 * @param _value The value to convert
 * @param _options Options to pass while converting
 * @param _options.isLe Convert using Little Endian
 * @param _options.isNegative Convert using two's complement
 * @example
 * <BR>
 *
 * ```javascript
 * import { hexToBn } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * hexToBn('0x123480001f'); // => BN(0x123480001f)
 * ```
 */
export function hexToBn (value?: string | null, { isLe = false, isNegative = false }: ToBnOptions = {}): BN {
  if (!value || value === '0x') {
    return new BN(0);
  }

  const stripped = hexStripPrefix(value);
  const bn = new BN(stripped, 16, isLe ? 'le' : 'be');

  // fromTwos takes as parameter the number of bits, which is the hex length
  // multiplied by 4 (2 bytes being 8 bits)
  return isNegative
    ? bn.fromTwos(stripped.length * 4)
    : bn;
}
