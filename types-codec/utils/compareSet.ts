// Copyright 2017-2022 @polkadot/types-codec authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isObject } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

function compareSetArray (a: Set<unknown>, b: any[]): boolean {
  // equal number of entries and each entry in the array should match
  return (a.size === b.length) && !b.some((e) => !a.has(e));
}

// NOTE These are used internally and when comparing objects, expects that
// when the second is an Set<string, Codec> that the first has to be as well
export function compareSet (a: Set<unknown>, b?: unknown): boolean {
  if (Array.isArray(b)) {
    return compareSetArray(a, b);
  } else if (b instanceof Set) {
    return compareSetArray(a, [...b.values()]);
  } else if (isObject(b)) {
    return compareSetArray(a, Object.values(b));
  }

  return false;
}
