// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { BN } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
import type { DeriveApi, DeriveOwnContributions } from '../types.ts';

import { combineLatest, EMPTY, map, of, startWith, switchMap } from 'https://esm.sh/rxjs@7.5.7';

import { objectSpread } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { memo } from '../util/index.ts';
import { extractContributed } from './util.ts';

function _getValues (api: DeriveApi, childKey: string, keys: string[]): Observable<DeriveOwnContributions> {
  // We actually would love to use multi-keys https://github.com/paritytech/substrate/issues/9203
  return combineLatest(keys.map((k) => api.rpc.childstate.getStorage(childKey, k))).pipe(
    map((values) =>
      values
        .map((v) => api.registry.createType('Option<StorageData>', v))
        .map((o) =>
          o.isSome
            ? api.registry.createType('Balance', o.unwrap())
            : api.registry.createType('Balance')
        )
        .reduce((all: DeriveOwnContributions, b, index): DeriveOwnContributions =>
          objectSpread(all, { [keys[index]]: b }), {})
    )
  );
}

function _watchOwnChanges (api: DeriveApi, paraId: string | number | BN, childkey: string, keys: string[]): Observable<DeriveOwnContributions> {
  return api.query.system.events().pipe(
    switchMap((events): Observable<DeriveOwnContributions> => {
      const changes = extractContributed(paraId, events);
      const filtered = keys.filter((k) =>
        changes.added.includes(k) ||
        changes.removed.includes(k)
      );

      return filtered.length
        ? _getValues(api, childkey, filtered)
        : EMPTY;
    }),
    startWith({})
  );
}

function _contributions (api: DeriveApi, paraId: string | number | BN, childKey: string, keys: string[]): Observable<DeriveOwnContributions> {
  return combineLatest([
    _getValues(api, childKey, keys),
    _watchOwnChanges(api, paraId, childKey, keys)
  ]).pipe(
    map(([all, latest]) =>
      objectSpread({}, all, latest)
    )
  );
}

export function ownContributions (instanceId: string, api: DeriveApi): (paraId: string | number | BN, keys: string[]) => Observable<DeriveOwnContributions> {
  return memo(instanceId, (paraId: string | number | BN, keys: string[]): Observable<DeriveOwnContributions> =>
    api.derive.crowdloan.childKey(paraId).pipe(
      switchMap((childKey) =>
        childKey && keys.length
          ? _contributions(api, paraId, childKey, keys)
          : of({})
      )
    )
  );
}
