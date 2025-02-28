// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';

export type DefinitionTypeType = string;

export type DefinitionTypeEnum = { _fallback?: DefinitionTypeType } & ({ _enum: DefinitionTypeType[] } | { _enum: Record<string, DefinitionTypeType | null> });

export type DefinitionTypeSet = { _fallback?: DefinitionTypeType, _set: Record<string, number> };

type DefinitionTypeStructExtra = {
  _alias?: Record<string, DefinitionTypeType>;
  _fallback?: DefinitionTypeType;
} & Record<string, unknown>;

export type DefinitionTypeStruct = Record<string, DefinitionTypeType> | DefinitionTypeStructExtra;

export type DefinitionType = string | DefinitionTypeEnum | DefinitionTypeSet | DefinitionTypeStruct;

export interface DefinitionRpcParam {
  isHistoric?: boolean;
  isOptional?: boolean;
  name: string;
  type: DefinitionTypeType;
}

export interface DefinitionRpc {
  alias?: string[];
  aliasSection?: string;
  deprecated?: string;
  description: string;
  endpoint?: string;
  isSigned?: boolean;
  noErrorLog?: boolean;
  params: DefinitionRpcParam[];
  type: DefinitionTypeType;
}

export interface DefinitionRpcExt extends DefinitionRpc {
  isSubscription: boolean;
  jsonrpc: string;
  method: string;
  pubsub?: [string, string, string];
  section: string;
}

export interface DefinitionCallParam {
  name: string;
  type: DefinitionTypeType;
}

export interface DefinitionCall {
  description: string;
  params: DefinitionCallParam[];
  type: DefinitionTypeType;
}

export interface DefinitionRpcSub extends DefinitionRpc {
  pubsub: [string, string, string];
}

export type DefinitionsRpc = Record<string, DefinitionRpc | DefinitionRpcSub>;

export interface DefinitionsCallEntry {
  methods: Record<string, DefinitionCall>;
  version: number;
}

export type DefinitionsCall = Record<string, DefinitionsCallEntry[]>;

export interface DefinitionCallNamed extends DefinitionCall {
  method: string;
  name: string;
  section: string;
  sectionHash: HexString;
  version: number;
}

export type DefinitionsTypes = Record<string, DefinitionType>;

export interface Definitions {
  rpc?: DefinitionsRpc;
  runtime?: DefinitionsCall;
  types: DefinitionsTypes;
}
