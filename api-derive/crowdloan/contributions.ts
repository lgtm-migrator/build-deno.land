// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { StorageKey } from 'https://deno.land/x/polkadot@0.2.13/types/mod.ts';
import type { BN } from 'https://deno.land/x/polkadot@0.2.13/util/mod.ts';
import type { DeriveApi, DeriveContributions } from '../types.ts';

import { BehaviorSubject, combineLatest, EMPTY, map, of, startWith, switchMap, tap, toArray } from 'https://esm.sh/rxjs@7.5.7';

import { arrayFlatten, isFunction, nextTick } from 'https://deno.land/x/polkadot@0.2.13/util/mod.ts';

import { memo } from '../util/index.ts';
import { extractContributed } from './util.ts';

interface Changes {
  added: string[];
  blockHash: string;
  removed: string[];
}

const PAGE_SIZE_K = 1000; // limit aligned with the 1k on the node (trie lookups are heavy)

function _getUpdates (api: DeriveApi, paraId: string | number | BN): Observable<Changes> {
  let added: string[] = [];
  let removed: string[] = [];

  return api.query.system.events().pipe(
    switchMap((events): Observable<Changes> => {
      const changes = extractContributed(paraId, events);

      if (changes.added.length || changes.removed.length) {
        added = added.concat(...changes.added);
        removed = removed.concat(...changes.removed);

        return of({ added, addedDelta: changes.added, blockHash: events.createdAtHash?.toHex() || '-', removed, removedDelta: changes.removed });
      }

      return EMPTY;
    }),
    startWith({ added, addedDelta: [], blockHash: '-', removed, removedDelta: [] })
  );
}

function _eventTriggerAll (api: DeriveApi, paraId: string | number | BN): Observable<string> {
  return api.query.system.events().pipe(
    switchMap((events): Observable<string> => {
      const items = events.filter(({ event: { data: [eventParaId], method, section } }) =>
        section === 'crowdloan' &&
        ['AllRefunded', 'Dissolved', 'PartiallyRefunded'].includes(method) &&
        eventParaId.eq(paraId)
      );

      return items.length
        ? of(events.createdAtHash?.toHex() || '-')
        : EMPTY;
    }),
    startWith('-')
  );
}

function _getKeysPaged (api: DeriveApi, childKey: string): Observable<StorageKey[]> {
  const subject = new BehaviorSubject<string | undefined>(undefined);

  return subject.pipe(
    switchMap((startKey) =>
      api.rpc.childstate.getKeysPaged(childKey, '0x', PAGE_SIZE_K, startKey)
    ),
    tap((keys): void => {
      nextTick((): void => {
        keys.length === PAGE_SIZE_K
          ? subject.next(keys[PAGE_SIZE_K - 1].toHex())
          : subject.complete();
      });
    }),
    toArray(), // toArray since we want to startSubject to be completed
    map((keyArr: StorageKey[][]) => arrayFlatten(keyArr))
  );
}

function _getAll (api: DeriveApi, paraId: string | number | BN, childKey: string): Observable<string[]> {
  return _eventTriggerAll(api, paraId).pipe(
    switchMap(() =>
      isFunction(api.rpc.childstate.getKeysPaged)
        ? _getKeysPaged(api, childKey)
        : api.rpc.childstate.getKeys(childKey, '0x')
    ),
    map((keys) =>
      keys.map((k) => k.toHex())
    )
  );
}

function _contributions (api: DeriveApi, paraId: string | number | BN, childKey: string): Observable<DeriveContributions> {
  return combineLatest([
    _getAll(api, paraId, childKey),
    _getUpdates(api, paraId)
  ]).pipe(
    map(([keys, { added, blockHash, removed }]): DeriveContributions => {
      const contributorsMap: Record<string, boolean> = {};

      keys.forEach((k): void => {
        contributorsMap[k] = true;
      });

      added.forEach((k): void => {
        contributorsMap[k] = true;
      });

      removed.forEach((k): void => {
        delete contributorsMap[k];
      });

      return {
        blockHash,
        contributorsHex: Object.keys(contributorsMap)
      };
    })
  );
}

export function contributions (instanceId: string, api: DeriveApi): (paraId: string | number | BN) => Observable<DeriveContributions> {
  return memo(instanceId, (paraId: string | number | BN): Observable<DeriveContributions> =>
    api.derive.crowdloan.childKey(paraId).pipe(
      switchMap((childKey) =>
        childKey
          ? _contributions(api, paraId, childKey)
          : of({ blockHash: '-', contributorsHex: [] })
      )
    )
  );
}
