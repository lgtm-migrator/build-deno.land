// Copyright 2017-2022 @polkadot/rpc-provider authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Server } from 'https://esm.sh/mock-socket@9.1.5';
import type { Constructor } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface Global extends NodeJS.Global {
  WebSocket: Constructor<WebSocket>;
  fetch: any;
}

export interface Mock {
  body: Record<string, Record<string, unknown>>;
  requests: number;
  server: Server;
  done: () => Record<string, unknown>;
}

export type MockStateSubscriptionCallback = (error: Error | null, value: any) => void;

export type MockStateSubscriptions = Record<string, {
  callbacks: Record<number, MockStateSubscriptionCallback>;
  lastValue: any;
}>;

export type MockStateDb = Record<string, Uint8Array>;

export type MockStateRequests = Record<string, (db: MockStateDb, params: any[]) => string>;
