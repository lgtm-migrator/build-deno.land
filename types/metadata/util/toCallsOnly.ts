// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyJson, Registry } from 'https://deno.land/x/polkadot@0.2.2/types-codec/types/index.ts';
import type { MetadataLatest, PalletCallMetadataLatest } from '../../interfaces/metadata/index.ts';

import { Option, Text, u8 } from 'https://deno.land/x/polkadot@0.2.2/types-codec/mod.ts';
import { objectSpread } from 'https://deno.land/x/polkadot@0.2.2/util/mod.ts';

interface ModuleMetadataTrimmed {
  calls: Option<PalletCallMetadataLatest>;
  index: u8;
  name: Text;
}

function trimDocs (docs: Text[]): string[] {
  const strings = docs.map((d) => d.toString().trim());
  const firstEmpty = strings.findIndex((d) => !d.length);

  return firstEmpty === -1
    ? strings
    : strings.slice(0, firstEmpty);
}

/** @internal */
export function toCallsOnly (registry: Registry, { extrinsic, lookup, pallets }: MetadataLatest): AnyJson {
  return registry.createTypeUnsafe('MetadataLatest', [{
    extrinsic,
    lookup: {
      types: lookup.types.map(({ id, type }) =>
        registry.createTypeUnsafe('PortableType', [{
          id,
          type: objectSpread({}, type, { docs: trimDocs(type.docs) })
        }])
      )
    },
    pallets: pallets.map(({ calls, index, name }): ModuleMetadataTrimmed => ({
      calls: registry.createTypeUnsafe('Option<PalletCallMetadataLatest>', [calls.unwrapOr(null)]),
      index,
      name
    }))
  }]).toJSON();
}
