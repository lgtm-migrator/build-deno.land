// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Compact, Option, Struct, bool, u32 } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import type { AccountId, Balance } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/runtime/index.ts';

/** @name ClassDetails */
export interface ClassDetails extends Struct {
  readonly owner: AccountId;
  readonly issuer: AccountId;
  readonly admin: AccountId;
  readonly freezer: AccountId;
  readonly totalDeposit: DepositBalance;
  readonly freeHolding: bool;
  readonly instances: u32;
  readonly instanceMetadatas: u32;
  readonly attributes: u32;
  readonly isFrozen: bool;
}

/** @name ClassId */
export interface ClassId extends u32 {}

/** @name ClassMetadata */
export interface ClassMetadata extends Struct {
  readonly deposit: DepositBalance;
  readonly data: Bytes;
  readonly isFrozen: bool;
}

/** @name DepositBalance */
export interface DepositBalance extends Balance {}

/** @name DepositBalanceOf */
export interface DepositBalanceOf extends Balance {}

/** @name DestroyWitness */
export interface DestroyWitness extends Struct {
  readonly instances: Compact<u32>;
  readonly instanceMetadatas: Compact<u32>;
  readonly attributes: Compact<u32>;
}

/** @name InstanceDetails */
export interface InstanceDetails extends Struct {
  readonly owner: AccountId;
  readonly approved: Option<AccountId>;
  readonly isFrozen: bool;
  readonly deposit: DepositBalance;
}

/** @name InstanceId */
export interface InstanceId extends u32 {}

/** @name InstanceMetadata */
export interface InstanceMetadata extends Struct {
  readonly deposit: DepositBalance;
  readonly data: Bytes;
  readonly isFrozen: bool;
}

export type PHANTOM_UNIQUES = 'uniques';
