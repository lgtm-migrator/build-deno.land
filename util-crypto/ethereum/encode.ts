// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';

import { u8aToHex, u8aToU8a } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { keccakAsU8a } from '../keccak/index.ts';
import { secp256k1Expand } from '../secp256k1/index.ts';

function getH160 (u8a: Uint8Array): Uint8Array {
  if ([33, 65].includes(u8a.length)) {
    u8a = keccakAsU8a(secp256k1Expand(u8a));
  }

  return u8a.slice(-20);
}

export function ethereumEncode (addressOrPublic?: HexString | string | Uint8Array): HexString {
  if (!addressOrPublic) {
    return '0x';
  }

  const u8aAddress = u8aToU8a(addressOrPublic);

  if (![20, 32, 33, 65].includes(u8aAddress.length)) {
    throw new Error('Invalid address or publicKey passed');
  }

  const address = u8aToHex(getH160(u8aAddress), -1, false);
  const hash = u8aToHex(keccakAsU8a(address), -1, false);
  let result = '';

  for (let i = 0; i < 40; i++) {
    result = `${result}${parseInt(hash[i], 16) > 7 ? address[i].toUpperCase() : address[i]}`;
  }

  return `0x${result}`;
}
