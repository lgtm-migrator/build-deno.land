// Copyright 2017-2022 @polkadot/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, Hash } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';

import { ApiRx, toRxMethod } from 'https://deno.land/x/polkadot@0.2.14/api/mod.ts';

import { Abi } from '../Abi/index.ts';
import { Blueprint, Code, Contract } from '../base/index.ts';

export class BlueprintRx extends Blueprint<'rxjs'> {
  constructor (api: ApiRx, abi: string | Record<string, unknown> | Abi, codeHash: string | Hash) {
    super(api, abi, codeHash, toRxMethod);
  }
}

export class CodeRx extends Code<'rxjs'> {
  constructor (api: ApiRx, abi: string | Record<string, unknown> | Abi, wasm: Uint8Array | string | Buffer | null | undefined) {
    super(api, abi, wasm, toRxMethod);
  }
}

export class ContractRx extends Contract<'rxjs'> {
  constructor (api: ApiRx, abi: string | Record<string, unknown> | Abi, address: string | AccountId) {
    super(api, abi, address, toRxMethod);
  }
}
