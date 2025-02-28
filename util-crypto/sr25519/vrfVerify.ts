// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';

import { u8aToU8a } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';
import { vrfVerify } from 'https://deno.land/x/polkadot@0.2.14/wasm-crypto/mod.ts';

const EMPTY_U8A = new Uint8Array();

/**
 * @name sr25519VrfVerify
 * @description Verify with sr25519 vrf verification
 */
export function sr25519VrfVerify (message: HexString | Uint8Array | string, signOutput: HexString | string | Uint8Array, publicKey: HexString | Uint8Array | string, context: HexString | string | Uint8Array = EMPTY_U8A, extra: HexString | string | Uint8Array = EMPTY_U8A): boolean {
  const publicKeyU8a = u8aToU8a(publicKey);
  const proofU8a = u8aToU8a(signOutput);

  if (publicKeyU8a.length !== 32) {
    throw new Error('Invalid publicKey, expected 32-bytes');
  } else if (proofU8a.length !== 96) {
    throw new Error('Invalid vrfSign output, expected 96 bytes');
  }

  return vrfVerify(publicKeyU8a, u8aToU8a(context), u8aToU8a(message), u8aToU8a(extra), proofU8a);
}
