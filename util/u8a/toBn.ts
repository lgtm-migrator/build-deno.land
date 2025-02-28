// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToBnOptions } from '../types.ts';

import { BN } from '../bn/bn.ts';

/**
 * @name u8aToBn
 * @summary Creates a BN from a Uint8Array object.
 * @description
 * `UInt8Array` input values return the actual BN. `null` or `undefined` values returns an `0x0` value.
 * @param value The value to convert
 * @param options Options to pass while converting
 * @param options.isLe Convert using Little Endian (default)
 * @param options.isNegative Convert using two's complement
 * @example
 * <BR>
 *
 * ```javascript
 * import { u8aToBn } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * u8aToHex(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0xf])); // 0x68656c0f
 * ```
 */
export function u8aToBn (value: Uint8Array, { isLe = true, isNegative = false }: ToBnOptions = {}): BN {
  const count = value.length;

  // shortcut for <= u48 values - in this case the manual conversion
  // here seems to be more efficient than passing the full array
  if (count <= 6) {
    if (isNegative) {
      let result = 0;

      if (isLe) {
        // Most common case i{8, 16, 32} default LE SCALE-encoded
        // For <= 32, we also optimize the xor to a single op
        // (see the comments around unrolling in the next section)
        switch (count) {
          case 0:
            return new BN(0);

          case 1:
            result = value[0] ^ 0x0000_00ff;
            break;

          case 2:
            result = (value[0] + (value[1] << 8)) ^ 0x0000_ffff;
            break;

          case 3:
            result = (value[0] + (value[1] << 8) + (value[2] << 16)) ^ 0x00ff_ffff;
            break;

          case 4:
            // for the 3rd byte, we don't << 24 - since JS converts all bitwise operators to
            // 32-bit, in the case where the top-most bit is set this yields a negative value
            result = (value[0] + (value[1] << 8) + (value[2] << 16) + (value[3] * 0x1_00_00_00)) ^ 0xffff_ffff;
            break;

          case 5:
            result = ((value[0] + (value[1] << 8) + (value[2] << 16) + (value[3] * 0x1_00_00_00)) ^ 0xffff_ffff) + ((value[4] ^ 0xff) * 0x1_00_00_00_00);
            break;

          default: // 6
            result = ((value[0] + (value[1] << 8) + (value[2] << 16) + (value[3] * 0x1_00_00_00)) ^ 0xffff_ffff) + (((value[4] + (value[5] << 8)) ^ 0x0000_ffff) * 0x1_00_00_00_00);
            break;
        }
      } else {
        for (let i = 0; i < count; i++) {
          result = (result * 0x1_00) + (value[i] ^ 0xff);
        }
      }

      return count
        ? new BN((result * -1) - 1)
        : new BN(0);
    } else if (isLe) {
      // Most common case - u{8, 16, 32} default LE SCALE-encoded
      //
      // There are some slight benefits in unrolling this specific loop,
      // however it comes with diminishing returns since here the actual
      // `new BN` does seem to take up the bulk of the time
      switch (count) {
        case 0:
          return new BN(0);

        case 1:
          return new BN(value[0]);

        case 2:
          return new BN(value[0] + (value[1] << 8));

        case 3:
          return new BN(value[0] + (value[1] << 8) + (value[2] << 16));

        case 4:
          // for the 3rd byte, we don't << 24 - since JS converts all bitwise operators to
          // 32-bit, in the case where the top-most bit is set this yields a negative value
          return new BN(value[0] + (value[1] << 8) + (value[2] << 16) + (value[3] * 0x1_00_00_00));

        case 5:
          return new BN(value[0] + (value[1] << 8) + (value[2] << 16) + ((value[3] + (value[4] << 8)) * 0x1_00_00_00));

        default: // 6
          return new BN(value[0] + (value[1] << 8) + (value[2] << 16) + ((value[3] + (value[4] << 8) + (value[5] << 16)) * 0x1_00_00_00));
      }
    } else {
      let result = 0;

      for (let i = 0; i < count; i++) {
        result = (result * 0x1_00) + value[i];
      }

      return new BN(result);
    }
  }

  return isNegative
    ? new BN(value, isLe ? 'le' : 'be').fromTwos(value.length * 8)
    : new BN(value, isLe ? 'le' : 'be');
}
