// Copyright 2017-2022 @polkadot/types-create authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { objectSpread } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

export const XCM_MAPPINGS = ['AssetInstance', 'Fungibility', 'Junction', 'Junctions', 'MultiAsset', 'MultiAssetFilter', 'MultiLocation', 'Response', 'WildFungibility', 'WildMultiAsset', 'Xcm', 'XcmError', 'XcmOrder'];

export function mapXcmTypes (version: 'V0' | 'V1' | 'V2'): Record<string, string> {
  return XCM_MAPPINGS.reduce<Record<string, string>>((all, key) =>
    objectSpread(all, { [key]: `${key}${version}` }), {}
  );
}
