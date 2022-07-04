// Copyright 2017-2022 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseBase, SubstrateApp } from 'https://esm.sh/@zondax/ledger-substrate@0.31.0';
import type { AccountOptions, LedgerAddress, LedgerSignature, LedgerTypes, LedgerVersion } from './types.ts';

import { transports } from 'https://deno.land/x/polkadot@0.0.3/hw-ledger-transports/mod.ts';
import { u8aToBuffer } from 'https://deno.land/x/polkadot@0.0.3/util/mod.ts';

import { LEDGER_DEFAULT_ACCOUNT, LEDGER_DEFAULT_CHANGE, LEDGER_DEFAULT_INDEX, LEDGER_SUCCESS_CODE } from './constants.ts';
import { ledgerApps } from './defaults.ts';

export { packageInfo } from './packageInfo.ts';

type Chain = keyof typeof ledgerApps;

// A very basic wrapper for a ledger app -
//  - it connects automatically, creating an app as required
//  - Promises return errors (instead of wrapper errors)
export class Ledger {
  #app: SubstrateApp | null = null;

  #chain: Chain;

  #transport: LedgerTypes;

  constructor (transport: LedgerTypes, chain: Chain) {
    // u2f is deprecated
    if (!['hid', 'webusb'].includes(transport)) {
      throw new Error(`Unsupported transport ${transport}`);
    } else if (!Object.keys(ledgerApps).includes(chain)) {
      throw new Error(`Unsupported chain ${chain}`);
    }

    this.#chain = chain;
    this.#transport = transport;
  }

  public async getAddress (confirm = false, accountOffset = 0, addressOffset = 0, { account = LEDGER_DEFAULT_ACCOUNT, addressIndex = LEDGER_DEFAULT_INDEX, change = LEDGER_DEFAULT_CHANGE }: Partial<AccountOptions> = {}): Promise<LedgerAddress> {
    return this.#withApp(async (app: SubstrateApp): Promise<LedgerAddress> => {
      const { address, pubKey } = await this.#wrapError(app.getAddress(account + accountOffset, change, addressIndex + addressOffset, confirm));

      return {
        address,
        publicKey: `0x${pubKey}`
      };
    });
  }

  public async getVersion (): Promise<LedgerVersion> {
    return this.#withApp(async (app: SubstrateApp): Promise<LedgerVersion> => {
      const { device_locked: isLocked, major, minor, patch, test_mode: isTestMode } = await this.#wrapError(app.getVersion());

      return {
        isLocked,
        isTestMode,
        version: [major, minor, patch]
      };
    });
  }

  public async sign (message: Uint8Array, accountOffset = 0, addressOffset = 0, { account = LEDGER_DEFAULT_ACCOUNT, addressIndex = LEDGER_DEFAULT_INDEX, change = LEDGER_DEFAULT_CHANGE }: Partial<AccountOptions> = {}): Promise<LedgerSignature> {
    return this.#withApp(async (app: SubstrateApp): Promise<LedgerSignature> => {
      const buffer = u8aToBuffer(message);
      const { signature } = await this.#wrapError(app.sign(account + accountOffset, change, addressIndex + addressOffset, buffer));

      return {
        signature: `0x${signature.toString('hex')}`
      };
    });
  }

  #getApp = async (): Promise<SubstrateApp> => {
    if (!this.#app) {
      const def = transports.find(({ type }) => type === this.#transport);

      if (!def) {
        throw new Error(`Unable to find a transport for ${this.#transport}`);
      }

      const transport = await def.create();

      this.#app = ledgerApps[this.#chain](transport);
    }

    return this.#app;
  };

  #withApp = async <T> (fn: (app: SubstrateApp) => Promise<T>): Promise<T> => {
    try {
      const app = await this.#getApp();

      return await fn(app);
    } catch (error) {
      this.#app = null;

      throw error;
    }
  };

  #wrapError = async <T extends ResponseBase> (promise: Promise<T>): Promise<T> => {
    const result = await promise;

    if (result.return_code !== LEDGER_SUCCESS_CODE) {
      throw new Error(result.error_message);
    }

    return result;
  };
}
