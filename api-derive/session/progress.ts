// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { Option, u64 } from 'https://deno.land/x/polkadot@0.2.14/types/mod.ts';
import type { BlockNumber, SessionIndex } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';
import type { DeriveApi, DeriveSessionInfo, DeriveSessionProgress } from '../types.ts';

import { combineLatest, map, of, switchMap } from 'https://esm.sh/rxjs@7.5.7';

import { objectSpread } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { memo } from '../util/index.ts';

type ResultSlotsNoSession = [u64, u64, u64];
type ResultSlots = [u64, u64, u64, Option<SessionIndex>];
type ResultSlotsFlat = [u64, u64, u64, SessionIndex];

function withProgressField (field: 'eraLength' | 'eraProgress' | 'sessionProgress'): (instanceId: string, api: DeriveApi) => () => Observable<BlockNumber> {
  return (instanceId: string, api: DeriveApi) =>
    memo(instanceId, (): Observable<BlockNumber> =>
      api.derive.session.progress().pipe(
        map((info) => info[field])
      )
    );
}

function createDerive (api: DeriveApi, info: DeriveSessionInfo, [currentSlot, epochIndex, epochOrGenesisStartSlot, activeEraStartSessionIndex]: ResultSlotsFlat): DeriveSessionProgress {
  const epochStartSlot = epochIndex.mul(info.sessionLength).iadd(epochOrGenesisStartSlot);
  const sessionProgress = currentSlot.sub(epochStartSlot);
  const eraProgress = info.currentIndex.sub(activeEraStartSessionIndex).imul(info.sessionLength).iadd(sessionProgress);

  return objectSpread({
    eraProgress: api.registry.createType('BlockNumber', eraProgress),
    sessionProgress: api.registry.createType('BlockNumber', sessionProgress)
  }, info);
}

function queryAura (api: DeriveApi): Observable<DeriveSessionProgress> {
  return api.derive.session.info().pipe(
    map((info): DeriveSessionProgress =>
      objectSpread({
        eraProgress: api.registry.createType('BlockNumber'),
        sessionProgress: api.registry.createType('BlockNumber')
      }, info)
    )
  );
}

function queryBabe (api: DeriveApi): Observable<[DeriveSessionInfo, ResultSlotsFlat]> {
  return api.derive.session.info().pipe(
    switchMap((info): Observable<[DeriveSessionInfo, ResultSlots | ResultSlotsNoSession]> =>
      combineLatest([
        of(info),
        // we may have no staking, but have babe (permissioned)
        api.query.staking?.erasStartSessionIndex
          ? api.queryMulti<ResultSlots>([
            api.query.babe.currentSlot,
            api.query.babe.epochIndex,
            api.query.babe.genesisSlot,
            [api.query.staking.erasStartSessionIndex, info.activeEra]
          ])
          : api.queryMulti<ResultSlotsNoSession>([
            api.query.babe.currentSlot,
            api.query.babe.epochIndex,
            api.query.babe.genesisSlot
          ])
      ])
    ),
    map(([info, [currentSlot, epochIndex, genesisSlot, optStartIndex]]): [DeriveSessionInfo, ResultSlotsFlat] => [
      info, [currentSlot, epochIndex, genesisSlot, optStartIndex && optStartIndex.isSome ? optStartIndex.unwrap() : api.registry.createType('SessionIndex', 1)]
    ])
  );
}

/**
 * @description Retrieves all the session and era query and calculates specific values on it as the length of the session and eras
 */
export function progress (instanceId: string, api: DeriveApi): () => Observable<DeriveSessionProgress> {
  return memo(instanceId, (): Observable<DeriveSessionProgress> =>
    api.query.babe
      ? queryBabe(api).pipe(
        map(([info, slots]: [DeriveSessionInfo, ResultSlotsFlat]): DeriveSessionProgress =>
          createDerive(api, info, slots)
        )
      )
      : queryAura(api)
  );
}

export const eraLength = withProgressField('eraLength');
export const eraProgress = withProgressField('eraProgress');
export const sessionProgress = withProgressField('sessionProgress');
