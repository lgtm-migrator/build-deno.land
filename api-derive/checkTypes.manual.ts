// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'https://deno.land/x/polkadot@0.0.4-2/api-augment/mod.ts';

import { derive } from './index.ts';

console.log(derive.chain.bestNumber);
