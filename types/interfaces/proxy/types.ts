// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Struct } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import type { AccountId, BlockNumber, Hash } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/runtime/index.ts';

/** @name ProxyAnnouncement */
export interface ProxyAnnouncement extends Struct {
  readonly real: AccountId;
  readonly callHash: Hash;
  readonly height: BlockNumber;
}

/** @name ProxyDefinition */
export interface ProxyDefinition extends Struct {
  readonly delegate: AccountId;
  readonly proxyType: ProxyType;
  readonly delay: BlockNumber;
}

/** @name ProxyType */
export interface ProxyType extends Enum {
  readonly isAny: boolean;
  readonly isNonTransfer: boolean;
  readonly isGovernance: boolean;
  readonly isStaking: boolean;
  readonly type: 'Any' | 'NonTransfer' | 'Governance' | 'Staking';
}

export type PHANTOM_PROXY = 'proxy';
