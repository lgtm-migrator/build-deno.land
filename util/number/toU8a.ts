// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { hexToU8a } from '../hex/toU8a.ts';
import { numberToHex } from './toHex.ts';

/**
 * @name numberToU8a
 * @summary Creates a Uint8Array object from a number.
 * @description
 * `null`/`undefined`/`NaN` inputs returns an empty `Uint8Array` result. `number` input values return the actual bytes value converted to a `Uint8Array`. With `bitLength`, it converts the value to the equivalent size.
 * @example
 * <BR>
 *
 * ```javascript
 * import { numberToU8a } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * numberToU8a(0x1234); // => [0x12, 0x34]
 * ```
 */
export function numberToU8a (value?: number | null, bitLength = -1): Uint8Array {
  return hexToU8a(
    numberToHex(value, bitLength)
  );
}
