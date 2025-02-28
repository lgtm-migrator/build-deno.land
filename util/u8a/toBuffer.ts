// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name u8aToBuffer
 * @summary Creates a Buffer object from a hex string.
 * @description
 * `null` inputs returns an empty `Buffer` result. `UInt8Array` input values return the actual bytes value converted to a `Buffer`. Anything that is not a `UInt8Array` throws an error.
 * @example
 * <BR>
 *
 * ```javascript
 * import { u8aToBuffer } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * console.log('Buffer', u8aToBuffer('0x123480001f'));
 * ```
 */
export function u8aToBuffer (value?: Uint8Array | null): Buffer {
  return Buffer.from(value || []);
}
