// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { Codec } from '../types/index.ts';

import { Json, Option, Text, u32, Vec } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import { isFunction, isNull, isUndefined } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

function createValue (registry: Registry, type: string, value: unknown, asArray = true): Option<Codec> {
  // We detect codec here as well - when found, generally this is constructed from itself
  if (value && isFunction((value as Option<Codec>).unwrapOrDefault)) {
    return value as Option<Codec>;
  }

  return registry.createTypeUnsafe<Option<u32>>(
    type,
    [
      asArray
        ? isNull(value) || isUndefined(value)
          ? null
          : Array.isArray(value)
            ? value
            : [value]
        : value
    ]
  );
}

function decodeValue (registry: Registry, key: string, value: unknown): unknown {
  return key === 'ss58Format'
    ? createValue(registry, 'Option<u32>', value, false)
    : key === 'tokenDecimals'
      ? createValue(registry, 'Option<Vec<u32>>' as 'Vec<u32>', value)
      : key === 'tokenSymbol'
        ? createValue(registry, 'Option<Vec<Text>>' as 'Vec<Text>', value)
        : value;
}

function decode (registry: Registry, value?: Map<string, unknown> | Record<string, unknown> | null): Record<string, unknown> {
  return (
    // allow decoding from a map as well (ourselves)
    value && isFunction((value as Map<string, unknown>).entries)
      ? [...(value as Map<string, unknown>).entries()]
      : Object.entries(value || {})
  ).reduce((all: Record<string, unknown>, [key, value]) => {
    all[key] = decodeValue(registry, key, value);

    return all;
  }, {
    ss58Format: registry.createTypeUnsafe('Option<u32>', []),
    tokenDecimals: registry.createTypeUnsafe('Option<Vec<u32>>', []),
    tokenSymbol: registry.createTypeUnsafe('Option<Vec<Text>>', [])
  });
}

export class GenericChainProperties extends Json {
  constructor (registry: Registry, value?: Map<string, unknown> | Record<string, unknown> | null) {
    super(registry, decode(registry, value));
  }

  /**
   * @description The chain ss58Format
   */
  public get ss58Format (): Option<u32> {
    return this.getT('ss58Format');
  }

  /**
   * @description The decimals for each of the tokens
   */
  public get tokenDecimals (): Option<Vec<u32>> {
    return this.getT('tokenDecimals');
  }

  /**
   * @description The symbols for the tokens
   */
  public get tokenSymbol (): Option<Vec<Text>> {
    return this.getT('tokenSymbol');
  }
}
