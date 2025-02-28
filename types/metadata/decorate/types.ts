// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyTuple, Codec, Registry } from 'https://deno.land/x/polkadot@0.2.14/types-codec/types/index.ts';
import type { DispatchErrorModule, DispatchErrorModuleU8, DispatchErrorModuleU8a, ErrorMetadataLatest, EventMetadataLatest, PalletConstantMetadataLatest } from '../../interfaces/index.ts';
import type { StorageEntry } from '../../primitive/types.ts';
import type { CallFunction, IEvent, IEventLike } from '../../types/index.ts';

export interface ConstantCodec extends Codec {
  readonly meta: PalletConstantMetadataLatest;
}

export interface IsError {
  readonly meta: ErrorMetadataLatest;

  is: (moduleError: DispatchErrorModule | DispatchErrorModuleU8 | DispatchErrorModuleU8a) => boolean;
}

export interface IsEvent <T extends AnyTuple, N = unknown> {
  readonly meta: EventMetadataLatest;

  is: (event: IEventLike) => event is IEvent<T, N>;
}

export type ModuleConstants = Record<string, ConstantCodec>;

export type ModuleErrors = Record<string, IsError>;

export type ModuleEvents = Record<string, IsEvent<AnyTuple>>;

export type ModuleExtrinsics = Record<string, CallFunction>;

export type ModuleStorage = Record<string, StorageEntry>

export type Constants = Record<string, ModuleConstants>;

export type Errors = Record<string, ModuleErrors>;

export type Events = Record<string, ModuleEvents>;

export type Extrinsics = Record<string, ModuleExtrinsics>

export type Storage = Record<string, ModuleStorage>;

export interface DecoratedMeta {
  readonly consts: Constants;
  readonly errors: Errors;
  readonly events: Events;
  readonly query: Storage;
  readonly registry: Registry;
  readonly tx: Extrinsics
}
