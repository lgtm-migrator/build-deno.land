// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { StorageEntry } from '../../../primitive/types.ts';
import type { ManualMetadata } from './util.ts';

import { createRuntimeFunction } from './util.ts';

type Creator = (registry: Registry) => StorageEntry;

const prefix = 'Substrate';
const section = 'substrate';

function createSubstrateFn (method: string, key: string, meta: ManualMetadata): Creator {
  return createRuntimeFunction({ method, prefix, section }, key, meta);
}

export const substrate: Record<string, Creator> = {
  changesTrieConfig: createSubstrateFn('changesTrieConfig', ':changes_trie', {
    docs: 'Changes trie configuration is stored under this key.',
    type: 'u32'
  }),
  childStorageKeyPrefix: createSubstrateFn('childStorageKeyPrefix', ':child_storage:', {
    docs: 'Prefix of child storage keys.',
    type: 'u32'
  }),
  code: createSubstrateFn('code', ':code', {
    docs: 'Wasm code of the runtime.',
    type: 'Bytes'
  }),
  extrinsicIndex: createSubstrateFn('extrinsicIndex', ':extrinsic_index', {
    docs: 'Current extrinsic index (u32) is stored under this key.',
    type: 'u32'
  }),
  heapPages: createSubstrateFn('heapPages', ':heappages', {
    docs: 'Number of wasm linear memory pages required for execution of the runtime.',
    type: 'u64'
  })
};
