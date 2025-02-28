// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { Option, u32 } from 'https://deno.land/x/polkadot@0.2.14/types/mod.ts';
import type { ActiveEraInfo, EraIndex, Moment, SessionIndex } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';
import type { DeriveApi, DeriveSessionIndexes } from '../types.ts';

import { map, of } from 'https://esm.sh/rxjs@7.5.7';

import { memo } from '../util/index.ts';

// parse into Indexes
function parse ([currentIndex, activeEra, activeEraStart, currentEra, validatorCount]: [SessionIndex, EraIndex, Option<Moment>, EraIndex, u32]): DeriveSessionIndexes {
  return {
    activeEra,
    activeEraStart,
    currentEra,
    currentIndex,
    validatorCount
  };
}

// query based on latest
function queryStaking (api: DeriveApi): Observable<DeriveSessionIndexes> {
  return api.queryMulti<[SessionIndex, Option<ActiveEraInfo>, Option<EraIndex>, u32]>([
    api.query.session.currentIndex,
    api.query.staking.activeEra,
    api.query.staking.currentEra,
    api.query.staking.validatorCount
  ]).pipe(
    map(([currentIndex, activeOpt, currentEra, validatorCount]): DeriveSessionIndexes => {
      const { index, start } = activeOpt.unwrapOrDefault();

      return parse([
        currentIndex,
        index,
        start,
        currentEra.unwrapOrDefault(),
        validatorCount
      ]);
    })
  );
}

// query based on latest
function querySession (api: DeriveApi): Observable<DeriveSessionIndexes> {
  return api.query.session.currentIndex().pipe(
    map((currentIndex): DeriveSessionIndexes => parse([
      currentIndex,
      api.registry.createType('EraIndex'),
      api.registry.createType('Option<Moment>'),
      api.registry.createType('EraIndex'),
      api.registry.createType('u32')
    ]))
  );
}

// empty set when none is available
function empty (api: DeriveApi): Observable<DeriveSessionIndexes> {
  return of(parse([
    api.registry.createType('SessionIndex', 1),
    api.registry.createType('EraIndex'),
    api.registry.createType('Option<Moment>'),
    api.registry.createType('EraIndex'),
    api.registry.createType('u32')
  ]));
}

export function indexes (instanceId: string, api: DeriveApi): () => Observable<DeriveSessionIndexes> {
  return memo(instanceId, (): Observable<DeriveSessionIndexes> =>
    api.query.session
      ? api.query.staking
        ? queryStaking(api)
        : querySession(api)
      : empty(api)
  );
}
