// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { compactAddLength, isU8a, stringToU8a, u8aConcat } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { blake2AsU8a } from '../blake2/asU8a.ts';

const HDKD = compactAddLength(stringToU8a('Ed25519HDKD'));

export function ed25519DeriveHard (seed: Uint8Array, chainCode: Uint8Array): Uint8Array {
  if (!isU8a(chainCode) || chainCode.length !== 32) {
    throw new Error('Invalid chainCode passed to derive');
  }

  return blake2AsU8a(
    u8aConcat(HDKD, seed, chainCode)
  );
}
