// Copyright 2017-2022 @polkadot/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import type { OverrideVersionedType } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';

import { mapXcmTypes } from 'https://deno.land/x/polkadot@0.2.14/types-create/mod.ts';
import { objectSpread } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

const sharedTypes = {
  // 16 validators
  CompactAssignments: 'CompactAssignmentsWith16',
  DispatchErrorModule: 'DispatchErrorModuleU8',
  RawSolution: 'RawSolutionWith16',
  // general
  Keys: 'SessionKeys6',
  ProxyType: {
    _enum: ['Any', 'NonTransfer', 'Staking', 'SudoBalances', 'IdentityJudgement', 'CancelProxy']
  },
  Weight: 'WeightV1'
};

const addrAccountIdTypes = {
  AccountInfo: 'AccountInfoWithRefCount',
  Address: 'AccountId',
  CompactAssignments: 'CompactAssignmentsWith16',
  DispatchErrorModule: 'DispatchErrorModuleU8',
  LookupSource: 'AccountId',
  Keys: 'SessionKeys5',
  RawSolution: 'RawSolutionWith16',
  ValidatorPrefs: 'ValidatorPrefsWithCommission'
};

const versioned: OverrideVersionedType[] = [
  {
    minmax: [1, 2],
    types: objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      Weight: 'u32'
    })
  },
  {
    minmax: [3, 22],
    types: objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  },
  {
    minmax: [23, 42],
    types: objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  },
  {
    minmax: [43, 44],
    types: objectSpread({}, sharedTypes, addrAccountIdTypes, {
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  },
  {
    minmax: [45, 47],
    types: objectSpread({}, sharedTypes, addrAccountIdTypes)
  },
  {
    minmax: [48, 49],
    types: objectSpread({}, sharedTypes, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  },
  {
    minmax: [50, 9099],
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
