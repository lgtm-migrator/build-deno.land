// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name isBigInt
 * @summary Tests for a `BigInt` object instance.
 * @description
 * Checks to see if the input object is an instance of `BigInt`
 * @example
 * <BR>
 *
 * ```javascript
 * import { isBigInt } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * console.log('isBigInt', isBigInt(123_456n)); // => true
 * ```
 */
export function isBigInt (value: unknown): value is bigint {
  return typeof value === 'bigint';
}
