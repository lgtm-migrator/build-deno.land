// Copyright 2017-2022 @polkadot/types-codec authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyTupleValue, Codec, CodecClass, Inspect, ITuple, Registry } from '../types/index.ts';

import { isFunction, isHex, isString, isU8a, stringify, u8aConcatStrict, u8aToU8a } from 'https://deno.land/x/polkadot@0.2.14/util/mod.ts';

import { AbstractArray } from '../abstract/Array.ts';
import { decodeU8a, mapToTypeMap, typeToConstructor } from '../utils/index.ts';

type TupleType = (CodecClass | string);

type TupleTypes = TupleType[] | {
  [index: string]: CodecClass | string;
};

type Definition = [CodecClass[], string[]];

interface Options {
  definition?: Definition;
  setDefinition?: (d: Definition) => Definition;
}

function noopSetDefinition (d: Definition): Definition {
  return d;
}

/** @internal */
function decodeTuple (registry: Registry, result: Codec[], value: Exclude<AnyTupleValue, Uint8Array> | undefined, Classes: Definition): [Codec[], number] {
  if (isU8a(value) || isHex(value)) {
    return decodeU8a(registry, result, u8aToU8a(value), Classes);
  }

  const Types = Classes[0];

  for (let i = 0; i < Types.length; i++) {
    try {
      const entry = value?.[i];

      result[i] = entry instanceof Types[i]
        ? entry
        : new Types[i](registry, entry);
    } catch (error) {
      throw new Error(`Tuple: failed on ${i}:: ${(error as Error).message}`);
    }
  }

  return [result, 0];
}

/**
 * @name Tuple
 * @description
 * A Tuple defines an anonymous fixed-length array, where each element has its
 * own type. It extends the base JS `Array` object.
 */
export class Tuple extends AbstractArray<Codec> implements ITuple<Codec[]> {
  readonly initialU8aLength?: number;

  #Types: Definition;

  constructor (registry: Registry, Types: TupleTypes | TupleType, value?: AnyTupleValue, { definition, setDefinition = noopSetDefinition }: Options = {}) {
    const Classes = definition || setDefinition(
      Array.isArray(Types)
        ? [Types.map((t) => typeToConstructor(registry, t)), []]
        : isFunction(Types) || isString(Types)
          ? [[typeToConstructor(registry, Types)], []]
          : mapToTypeMap(registry, Types)
    );

    super(registry, Classes[0].length);

    this.initialU8aLength = (
      isU8a(value)
        ? decodeU8a(registry, this, value, Classes)
        : decodeTuple(registry, this, value, Classes)
    )[1];
    this.#Types = Classes;
  }

  public static with (Types: TupleTypes | TupleType): CodecClass<Tuple> {
    let definition: Definition | undefined;

    // eslint-disable-next-line no-return-assign
    const setDefinition = (d: Definition) =>
      definition = d;

    return class extends Tuple {
      constructor (registry: Registry, value?: AnyTupleValue) {
        super(registry, Types, value, { definition, setDefinition });
      }
    };
  }

  /**
   * @description The length of the value when encoded as a Uint8Array
   */
  public override get encodedLength (): number {
    let total = 0;

    for (let i = 0; i < this.length; i++) {
      total += this[i].encodedLength;
    }

    return total;
  }

  /**
   * @description The types definition of the tuple
   */
  public get Types (): string[] {
    return this.#Types[1].length
      ? this.#Types[1]
      : this.#Types[0].map((T) => new T(this.registry).toRawType());
  }

  /**
   * @description Returns a breakdown of the hex encoding for this Codec
   */
  public override inspect (): Inspect {
    return {
      inner: this.inspectInner()
    };
  }

  /**
   * @description Returns the base runtime type name for this instance
   */
  public toRawType (): string {
    const types = this.#Types[0].map((T) =>
      this.registry.getClassName(T) || new T(this.registry).toRawType()
    );

    return `(${types.join(',')})`;
  }

  /**
   * @description Returns the string representation of the value
   */
  public override toString (): string {
    // Overwrite the default toString representation of Array.
    return stringify(this.toJSON());
  }

  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */
  public override toU8a (isBare?: boolean): Uint8Array {
    return u8aConcatStrict(this.toU8aInner(isBare));
  }
}
