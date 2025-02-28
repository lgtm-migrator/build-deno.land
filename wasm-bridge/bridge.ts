// Copyright 2019-2022 @polkadot/wasm-bridge authors & contributors
// SPDX-License-Identifier: Apache-2.0

// A number of functions are "unsafe" and purposefully so - it is
// assumed that where the bridge is used, it is correctly wrapped
// in a safeguard (see withWasm in the wasm-crypto package) which
// then ensures that the internal wasm instance here is available
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { BridgeBase, InitFn, InitPromise, WasmBaseInstance, WasmImports } from './types.ts';

import { stringToU8a, u8aToString } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { Wbg } from './wbg.ts';

/**
 * @name Bridge
 * @description
 * Creates a bridge between the JS and WASM environments.
 *
 * For any bridge it is passed an function white is then called internally at the
 * time of initialization. This affectively implements the layer between WASM and
 * the native environment, providing all the plumbing needed for the Wbg classes.
 */
export class Bridge<C extends WasmBaseInstance> implements BridgeBase<C> {
  #cachegetInt32: Int32Array | null;
  #cachegetUint8: Uint8Array | null;
  #createWasm: InitFn<C>;
  #heap: unknown[];
  #heapNext: number;
  #wasm: C | null;
  #wasmError: string | null;
  #wasmPromise: InitPromise<C> | null;
  #wbg: WasmImports;
  #type: 'asm' | 'wasm' | 'none';

  constructor (createWasm: InitFn<C>) {
    this.#createWasm = createWasm;
    this.#cachegetInt32 = null;
    this.#cachegetUint8 = null;
    this.#heap = new Array(32)
      .fill(undefined)
      .concat(undefined, null, true, false);
    this.#heapNext = this.#heap.length;
    this.#type = 'none';
    this.#wasm = null;
    this.#wasmError = null;
    this.#wasmPromise = null;
    this.#wbg = { ...new Wbg(this) };
  }

  /** @description Returns the init error */
  get error (): string | null {
    return this.#wasmError;
  }

  /** @description Returns the init type */
  get type (): 'asm' | 'wasm' | 'none' {
    return this.#type;
  }

  /** @description Returns the created wasm interface */
  get wasm (): C | null {
    return this.#wasm;
  }

  /** @description Performs the wasm initialization */
  async init (createWasm?: InitFn<C>): Promise<C | null> {
    if (!this.#wasmPromise || createWasm) {
      this.#wasmPromise = (createWasm || this.#createWasm)(this.#wbg);
    }

    const { error, type, wasm } = await this.#wasmPromise;

    this.#type = type;
    this.#wasm = wasm;
    this.#wasmError = error;

    return this.#wasm;
  }

  /**
   * @internal
   * @description Gets an object from the heap
   */
  getObject (idx: number): unknown {
    return this.#heap[idx];
  }

  /**
   * @internal
   * @description Removes an object from the heap
   */
  dropObject (idx: number) {
    if (idx < 36) {
      return;
    }

    this.#heap[idx] = this.#heapNext;
    this.#heapNext = idx;
  }

  /**
   * @internal
   * @description Retrieves and removes an object to the heap
   */
  takeObject (idx: number): unknown {
    const ret = this.getObject(idx);

    this.dropObject(idx);

    return ret;
  }

  /**
   * @internal
   * @description Adds an object to the heap
   */
  addObject (obj: unknown): number {
    if (this.#heapNext === this.#heap.length) {
      this.#heap.push(this.#heap.length + 1);
    }

    const idx = this.#heapNext;

    this.#heapNext = this.#heap[idx] as number;
    this.#heap[idx] = obj;

    return idx;
  }

  /**
   * @internal
   * @description Retrieve an Int32 in the WASM interface
   */
  getInt32 (): Int32Array {
    if (this.#cachegetInt32 === null || this.#cachegetInt32.buffer !== this.#wasm!.memory.buffer) {
      this.#cachegetInt32 = new Int32Array(this.#wasm!.memory.buffer);
    }

    return this.#cachegetInt32;
  }

  /**
   * @internal
   * @description Retrieve an Uint8Array in the WASM interface
   */
  getUint8 (): Uint8Array {
    if (this.#cachegetUint8 === null || this.#cachegetUint8.buffer !== this.#wasm!.memory.buffer) {
      this.#cachegetUint8 = new Uint8Array(this.#wasm!.memory.buffer);
    }

    return this.#cachegetUint8;
  }

  /**
   * @internal
   * @description Retrieves an Uint8Array in the WASM interface
   */
  getU8a (ptr: number, len: number): Uint8Array {
    return this.getUint8().subarray(ptr / 1, ptr / 1 + len);
  }

  /**
   * @internal
   * @description Retrieves a string in the WASM interface
   */
  getString (ptr: number, len: number): string {
    return u8aToString(this.getU8a(ptr, len));
  }

  /**
   * @internal
   * @description Allocates an Uint8Array in the WASM interface
   */
  allocU8a (arg: Uint8Array): [number, number] {
    const ptr = this.#wasm!.__wbindgen_malloc(arg.length * 1);

    this.getUint8().set(arg, ptr / 1);

    return [ptr, arg.length];
  }

  /**
   * @internal
   * @description Allocates a string in the WASM interface
   */
  allocString (arg: string): [number, number] {
    return this.allocU8a(stringToU8a(arg));
  }

  /**
   * @internal
   * @description Retrieves an Uint8Array from the WASM interface
   */
  resultU8a (): Uint8Array {
    const r0 = this.getInt32()[8 / 4 + 0];
    const r1 = this.getInt32()[8 / 4 + 1];
    const ret = this.getU8a(r0, r1).slice();

    this.#wasm!.__wbindgen_free(r0, r1 * 1);

    return ret;
  }

  /**
   * @internal
   * @description Retrieve a string from the WASM interface
   */
  resultString (): string {
    return u8aToString(this.resultU8a());
  }
}
