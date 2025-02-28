// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { GenericExtrinsic, GenericExtrinsicEra, GenericExtrinsicPayload, GenericExtrinsicPayloadUnknown, GenericExtrinsicPayloadV4, GenericExtrinsicSignatureV4, GenericExtrinsicUnknown, GenericExtrinsicV4, GenericImmortalEra, GenericMortalEra, GenericSignerPayload } from 'https://deno.land/x/polkadot@0.2.14/types/mod.ts';
import type { Enum, U8aFixed } from 'https://deno.land/x/polkadot@0.2.14/types-codec/mod.ts';
import type { H512 } from 'https://deno.land/x/polkadot@0.2.14/types/interfaces/runtime/index.ts';

/** @name AnySignature */
export interface AnySignature extends H512 {}

/** @name EcdsaSignature */
export interface EcdsaSignature extends U8aFixed {}

/** @name Ed25519Signature */
export interface Ed25519Signature extends H512 {}

/** @name Era */
export interface Era extends ExtrinsicEra {}

/** @name Extrinsic */
export interface Extrinsic extends GenericExtrinsic {}

/** @name ExtrinsicEra */
export interface ExtrinsicEra extends GenericExtrinsicEra {}

/** @name ExtrinsicPayload */
export interface ExtrinsicPayload extends GenericExtrinsicPayload {}

/** @name ExtrinsicPayloadUnknown */
export interface ExtrinsicPayloadUnknown extends GenericExtrinsicPayloadUnknown {}

/** @name ExtrinsicPayloadV4 */
export interface ExtrinsicPayloadV4 extends GenericExtrinsicPayloadV4 {}

/** @name ExtrinsicSignature */
export interface ExtrinsicSignature extends MultiSignature {}

/** @name ExtrinsicSignatureV4 */
export interface ExtrinsicSignatureV4 extends GenericExtrinsicSignatureV4 {}

/** @name ExtrinsicUnknown */
export interface ExtrinsicUnknown extends GenericExtrinsicUnknown {}

/** @name ExtrinsicV4 */
export interface ExtrinsicV4 extends GenericExtrinsicV4 {}

/** @name ImmortalEra */
export interface ImmortalEra extends GenericImmortalEra {}

/** @name MortalEra */
export interface MortalEra extends GenericMortalEra {}

/** @name MultiSignature */
export interface MultiSignature extends Enum {
  readonly isEd25519: boolean;
  readonly asEd25519: Ed25519Signature;
  readonly isSr25519: boolean;
  readonly asSr25519: Sr25519Signature;
  readonly isEcdsa: boolean;
  readonly asEcdsa: EcdsaSignature;
  readonly type: 'Ed25519' | 'Sr25519' | 'Ecdsa';
}

/** @name Signature */
export interface Signature extends H512 {}

/** @name SignerPayload */
export interface SignerPayload extends GenericSignerPayload {}

/** @name Sr25519Signature */
export interface Sr25519Signature extends H512 {}

export type PHANTOM_EXTRINSICS = 'extrinsics';
