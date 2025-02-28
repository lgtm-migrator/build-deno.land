// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.ts';

import { hexHasPrefix } from './hasPrefix.ts';

/**
 * @name hexAddPrefix
 * @summary Adds the `0x` prefix to string values.
 * @description
 * Returns a `0x` prefixed string from the input value. If the input is already prefixed, it is returned unchanged.
 * @example
 * <BR>
 *
 * ```javascript
 * import { hexAddPrefix } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * console.log('With prefix', hexAddPrefix('0a0b12')); // => 0x0a0b12
 * ```
 */
export function hexAddPrefix (value?: string | null): HexString {
  return value && hexHasPrefix(value)
    ? value
    : `0x${value && value.length % 2 === 1 ? '0' : ''}${value || ''}`;
}
