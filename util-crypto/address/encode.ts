// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from 'https://deno.land/x/polkadot@0.2.14/util/types.ts';
import type { Prefix } from './types.ts';

// Original implementation: https://github.com/paritytech/polka-ui/blob/4858c094684769080f5811f32b081dd7780b0880/src/polkadot.js#L34
import { u8aConcat } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { base58Encode } from '../base58/index.ts';
import { decodeAddress } from './decode.ts';
import { defaults } from './defaults.ts';
import { sshash } from './sshash.ts';

export function encodeAddress (key: HexString | Uint8Array | string, ss58Format: Prefix = defaults.prefix): string {
  // decode it, this means we can re-encode an address
  const u8a = decodeAddress(key);

  if ((ss58Format < 0) || (ss58Format > 16383) || [46, 47].includes(ss58Format)) {
    throw new Error('Out of range ss58Format specified');
  } else if (!defaults.allowedDecodedLengths.includes(u8a.length)) {
    throw new Error(`Expected a valid key to convert, with length ${defaults.allowedDecodedLengths.join(', ')}`);
  }

  const input = u8aConcat(
    ss58Format < 64
      ? [ss58Format]
      : [
        ((ss58Format & 0b0000_0000_1111_1100) >> 2) | 0b0100_0000,
        (ss58Format >> 8) | ((ss58Format & 0b0000_0000_0000_0011) << 6)
      ],
    u8a
  );

  return base58Encode(
    u8aConcat(
      input,
      sshash(input).subarray(0, [32, 33].includes(u8a.length) ? 2 : 1)
    )
  );
}
