// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'https://esm.sh/rxjs@7.5.7';
import type { QueryableModuleStorage } from 'https://deno.land/x/polkadot@0.2.14/api-base/types/index.ts';
import type { Vec } from 'https://deno.land/x/polkadot@0.2.14/types/mod.ts';
import type { AccountId, Balance } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';
import type { PalletElectionsPhragmenVoter } from 'https://deno.land/x/polkadot@0.2.14/types/lookup.ts';
import type { ITuple } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';
import type { DeriveApi, DeriveCouncilVote, DeriveCouncilVotes } from '../types.ts';

import { combineLatest, map, of } from 'https://esm.sh/rxjs@7.5.7';

import { memo } from '../util/index.ts';

// Voter is current tuple is 2.x-era
type VoteEntry = PalletElectionsPhragmenVoter | ITuple<[Balance, Vec<AccountId>]>;

function isVoter (value: VoteEntry): value is PalletElectionsPhragmenVoter {
  return !Array.isArray(value);
}

function retrieveStakeOf (elections: QueryableModuleStorage<'rxjs'>): Observable<[AccountId, Balance][]> {
  return elections.stakeOf.entries<Balance, [AccountId]>().pipe(
    map((entries) =>
      entries.map(([{ args: [accountId] }, stake]) => [accountId, stake])
    )
  );
}

function retrieveVoteOf (elections: QueryableModuleStorage<'rxjs'>): Observable<[AccountId, AccountId[]][]> {
  return elections.votesOf.entries<Vec<AccountId>, [AccountId]>().pipe(
    map((entries) =>
      entries.map(([{ args: [accountId] }, votes]) => [accountId, votes])
    )
  );
}

function retrievePrev (api: DeriveApi, elections: QueryableModuleStorage<'rxjs'>): Observable<DeriveCouncilVotes> {
  return combineLatest([
    retrieveStakeOf(elections),
    retrieveVoteOf(elections)
  ]).pipe(
    map(([stakes, votes]): DeriveCouncilVotes => {
      const result: DeriveCouncilVotes = [];

      votes.forEach(([voter, votes]): void => {
        result.push([voter, { stake: api.registry.createType('Balance'), votes }]);
      });

      stakes.forEach(([staker, stake]): void => {
        const entry = result.find(([voter]) => voter.eq(staker));

        if (entry) {
          entry[1].stake = stake;
        } else {
          result.push([staker, { stake, votes: [] }]);
        }
      });

      return result;
    })
  );
}

function retrieveCurrent (elections: QueryableModuleStorage<'rxjs'>): Observable<DeriveCouncilVotes> {
  return elections.voting.entries<VoteEntry, [AccountId]>().pipe(
    map((entries): DeriveCouncilVotes =>
      entries.map(([{ args: [accountId] }, value]): [AccountId, DeriveCouncilVote] => [
        accountId,
        isVoter(value)
          ? { stake: value.stake, votes: value.votes }
          : { stake: value[0], votes: value[1] }
      ])
    )
  );
}

export function votes (instanceId: string, api: DeriveApi): () => Observable<DeriveCouncilVotes> {
  const elections = api.query.phragmenElection || api.query.electionsPhragmen || api.query.elections;

  return memo(instanceId, (): Observable<DeriveCouncilVotes> =>
    elections
      ? elections.stakeOf
        ? retrievePrev(api, elections)
        : retrieveCurrent(elections)
      : of([])
  );
}
