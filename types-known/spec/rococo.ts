// Copyright 2017-2022 @polkadot/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import type { OverrideVersionedType } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';

import { mapXcmTypes } from 'https://deno.land/x/polkadot@0.2.14/types-create/mod.ts';
import { objectSpread } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

// structs need to be in order
/* eslint-disable sort-keys */

const sharedTypes = {
  DispatchErrorModule: 'DispatchErrorModuleU8',
  FullIdentification: '()', // No staking, only session (as per config)
  Keys: 'SessionKeys7B',
  Weight: 'WeightV1'
};

const versioned: OverrideVersionedType[] = [
  {
    minmax: [0, 200],
    types: objectSpread({}, sharedTypes, {
      AccountInfo: 'AccountInfoWithDualRefCount',
      Address: 'AccountId',
      LookupSource: 'AccountId'
    })
  },
  {
    minmax: [201, 214],
    types: objectSpread({}, sharedTypes, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  },
  {
    minmax: [215, 228],
    types: objectSpread({}, sharedTypes, {
      Keys: 'SessionKeys6'
    })
  },
  {
    minmax: [229, 9099],
    types: objectSpread({}, sharedTypes, mapXcmTypes('V0'))
  },
  {
    minmax: [9100, 9105],
    types: objectSpread({}, sharedTypes, mapXcmTypes('V1'))
  },
  {
    // metadata v14
    minmax: [9106, undefined],
    types: {
      Weight: 'WeightV1'
    }
  }
  // ,
  // {
  //   // weight v2 introduction
  //   minmax: [9300, undefined],
  //   types: {
  //     Weight: 'WeightV2'
  //   }
  // }
];

export default versioned;
