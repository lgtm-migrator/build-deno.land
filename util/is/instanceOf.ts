// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name isInstanceOf
 * @summary Tests for a instance of a class.
 * @description
 * Checks to see if the input value is an instance of the test class.
 * @example
 * <BR>
 *
 * ```javascript
 * import { isInstanceOf } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
 *
 * console.log('isInstanceOf', isInstanceOf(new Array(0), Array)); // => true
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isInstanceOf (value: unknown, Clazz: Function): boolean {
  return (
    ((value && (value as Record<string, unknown>).constructor) === Clazz) ||
    value instanceof Clazz
  );
}
