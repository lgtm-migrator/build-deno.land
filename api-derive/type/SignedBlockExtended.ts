// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, DispatchError, DispatchInfo, EventRecord, Extrinsic, SignedBlock } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/index.ts';
import type { Registry } from 'https://deno.land/x/polkadot@0.2.14/types/types/index.ts';
import type { SignedBlockExtended, TxWithEvent } from './types.ts';

import { extractAuthor } from './util.ts';

function mapExtrinsics (extrinsics: Extrinsic[], records: EventRecord[]): TxWithEvent[] {
  return extrinsics.map((extrinsic, index): TxWithEvent => {
    let dispatchError: DispatchError | undefined;
    let dispatchInfo: DispatchInfo | undefined;

    const events = records
      .filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
      .map(({ event }) => {
        if (event.section === 'system') {
          if (event.method === 'ExtrinsicSuccess') {
            dispatchInfo = event.data[0] as DispatchInfo;
          } else if (event.method === 'ExtrinsicFailed') {
            dispatchError = event.data[0] as DispatchError;
            dispatchInfo = event.data[1] as DispatchInfo;
          }
        }

        return event;
      });

    return { dispatchError, dispatchInfo, events, extrinsic };
  });
}

export function createSignedBlockExtended (registry: Registry, block?: SignedBlock, events?: EventRecord[], validators?: AccountId[] | null, author?: AccountId | null): SignedBlockExtended {
  // an instance of the base extrinsic for us to extend
  const SignedBlockBase = registry.createClass('SignedBlock');

  class Implementation extends SignedBlockBase implements SignedBlockExtended {
    readonly #author?: AccountId;
    readonly #events: EventRecord[];
    readonly #extrinsics: TxWithEvent[];

    constructor (registry: Registry, block?: SignedBlock, events?: EventRecord[], validators?: AccountId[] | null, author?: AccountId | null) {
      super(registry, block);

      this.#author = author || extractAuthor(this.block.header.digest, validators || []);
      this.#events = events || ([] as EventRecord[]);
      this.#extrinsics = mapExtrinsics(this.block.extrinsics, this.#events);
      this.createdAtHash = block?.createdAtHash;
    }

    /**
     * @description Convenience method, returns the author for the block
     */
    public get author (): AccountId | undefined {
      return this.#author;
    }

    /**
     * @description Convenience method, returns the events associated with the block
     */
    public get events (): EventRecord[] {
      return this.#events;
    }

    /**
     * @description Returns the extrinsics and their events, mapped
     */
    public get extrinsics (): TxWithEvent[] {
      return this.#extrinsics;
    }
  }

  return new Implementation(registry, block, events, validators, author);
}
