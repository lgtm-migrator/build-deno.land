// Copyright 2017-2022 @polkadot/x-randomvalues authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/LinusU/react-native-get-random-values/blob/85f48393821c23b83b89a8177f56d3a81dc8b733/index.js
// Copyright (c) 2018, 2020 Linus Unnebäck
// SPDX-License-Identifier: MIT

import { NativeModules } from 'https://esm.sh/react-native';

import { xglobal } from 'https://deno.land/x/polkadot@0.2.14/x-global/mod.ts';

import { base64Decode } from './base64.ts';
import { getRandomValues as getRandomValuesGlobal } from './browser.ts';
import { insecureRandomValues } from './fallback.ts';

export { packageInfo } from './packageInfo.ts';

interface RNExt {
  ExpoRandom: {
    getRandomBase64String: (length: number) => string;
  };
  RNGetRandomValues: {
    getRandomBase64: (length: number) => string;
  }
}

interface GlobalExt extends Window {
  nativeCallSyncHook: unknown;
}

function getRandomValuesNative <T extends Uint8Array> (output: T): T {
  const bytes = base64Decode(
    (NativeModules as RNExt).RNGetRandomValues
      ? (NativeModules as RNExt).RNGetRandomValues.getRandomBase64(output.length)
      : (NativeModules as RNExt).ExpoRandom.getRandomBase64String(output.length)
  );

  for (let i = 0; i < bytes.length; i++) {
    output[i] = bytes[i];
  }

  return output;
}

export const getRandomValues = (
  typeof xglobal.crypto === 'object' && typeof xglobal.crypto.getRandomValues === 'function'
    ? getRandomValuesGlobal
    : (typeof (xglobal as unknown as GlobalExt).nativeCallSyncHook === 'undefined' || !NativeModules.ExpoRandom)
      ? insecureRandomValues
      : getRandomValuesNative
);
