// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { HeaderExtended } from '../type/types.ts';
import type { DeriveApi } from '../types.ts';

import { combineLatest, map, switchMap } from 'https://esm.sh/rxjs@7.5.7';

import { createHeaderExtended } from '../type/index.ts';
import { memo } from '../util/index.ts';
import { getAuthorDetails } from './util.ts';

/**
 * @name getHeader
 * @param {( Uint8Array | string )} hash - A block hash as U8 array or string.
 * @returns An array containing the block header and the block author
 * @description Get a specific block header and extend it with the author
 * @example
 * <BR>
 *
 * ```javascript
 * const { author, number } = await api.derive.chain.getHeader('0x123...456');
 *
 * console.log(`block #${number} was authored by ${author}`);
 * ```
 */
export function getHeader (instanceId: string, api: DeriveApi): (blockHash: Uint8Array | string) => Observable<HeaderExtended> {
  return memo(instanceId, (blockHash: Uint8Array | string): Observable<HeaderExtended> =>
    combineLatest([
      api.rpc.chain.getHeader(blockHash),
      api.queryAt(blockHash)
    ]).pipe(
      switchMap(([header, queryAt]) =>
        getAuthorDetails(header, queryAt)
      ),
      map(([header, validators, author]) =>
        createHeaderExtended((validators || header).registry, header, validators, author)
      )
    )
  );
}
