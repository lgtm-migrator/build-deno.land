// Copyright 2017-2022 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Keypair } from '../../types.ts';

import nacl from 'https://esm.sh/tweetnacl@1.0.3';

/**
 * @name ed25519PairFromSecret
 * @summary Creates a new public/secret keypair from a secret.
 * @description
 * Returns a object containing a `publicKey` & `secretKey` generated from the supplied secret.
 * @example
 * <BR>
 *
 * ```javascript
 * import { ed25519PairFromSecret } from 'https://deno.land/x/polkadot@0.2.14/util-crypto/mod.ts';
 *
 * ed25519PairFromSecret(...); // => { secretKey: [...], publicKey: [...] }
 * ```
 */
export function ed25519PairFromSecret (secret: Uint8Array): Keypair {
  return nacl.sign.keyPair.fromSecretKey(secret);
}
