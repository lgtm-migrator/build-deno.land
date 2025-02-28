// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { MetadataLatest, MetadataV14 } from '../../interfaces/metadata/index.ts';

/**
 * Convert the Metadata (which is an alias) to latest
 * @internal
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toLatest (registry: Registry, v14: MetadataV14, _metaVersion: number): MetadataLatest {
  return v14;
}
