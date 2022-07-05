// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from 'https://deno.land/x/polkadot@0.0.4-2/util/types.ts';
import type { Prefix } from './types.ts';

// Original implementation: https://github.com/paritytech/polka-ui/blob/4858c094684769080f5811f32b081dd7780b0880/src/polkadot.js#L6
import { assert, isHex, isU8a, u8aToU8a } from 'https://deno.land/x/polkadot@0.0.4-2/util/mod.ts';

import { base58Decode } from '../base58/index.ts';
import { checkAddressChecksum } from './checksum.ts';
import { defaults } from './defaults.ts';

export function decodeAddress (encoded?: HexString | string | Uint8Array | null, ignoreChecksum?: boolean, ss58Format: Prefix = -1): Uint8Array {
  assert(encoded, 'Invalid empty address passed');

  if (isU8a(encoded) || isHex(encoded)) {
    return u8aToU8a(encoded);
  }

  try {
    const decoded = base58Decode(encoded);

    assert(defaults.allowedEncodedLengths.includes(decoded.length), 'Invalid decoded address length');

    const [isValid, endPos, ss58Length, ss58Decoded] = checkAddressChecksum(decoded);

    assert(ignoreChecksum || isValid, 'Invalid decoded address checksum');
    assert([-1, ss58Decoded].includes(ss58Format), () => `Expected ss58Format ${ss58Format}, received ${ss58Decoded}`);

    return decoded.slice(ss58Length, endPos);
  } catch (error) {
    throw new Error(`Decoding ${encoded}: ${(error as Error).message}`);
  }
}
