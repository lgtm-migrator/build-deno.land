// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraIndex } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';

import { deriveCache } from '../util/index.ts';

export function getEraCache <T> (CACHE_KEY: string, era: EraIndex, withActive?: boolean): [string, T | undefined] {
  const cacheKey = `${CACHE_KEY}-${era.toString()}`;

  return [
    cacheKey,
    withActive
      ? undefined
      : deriveCache.get<T>(cacheKey)
  ];
}

export function getEraMultiCache <T> (CACHE_KEY: string, eras: EraIndex[], withActive?: boolean): T[] {
  const cached: T[] = withActive
    ? []
    : eras
      .map((e) => deriveCache.get<T>(`${CACHE_KEY}-${e.toString()}`))
      .filter((v): v is T => !!v);

  return cached;
}

export function setEraCache <T extends { era: EraIndex }> (cacheKey: string, withActive: boolean, value: T): T {
  !withActive && deriveCache.set(cacheKey, value);

  return value;
}

export function setEraMultiCache <T extends { era: EraIndex }> (CACHE_KEY: string, withActive: boolean, values: T[]): T[] {
  !withActive && values.forEach((v) => deriveCache.set(`${CACHE_KEY}-${v.era.toString()}`, v));

  return values;
}

export function filterCachedEras <T extends { era: EraIndex }> (eras: EraIndex[], cached: T[], query: T[]): T[] {
  return eras.map((e) =>
    cached.find(({ era }) => e.eq(era)) ||
    query.find(({ era }) => e.eq(era)) as T
  );
}
