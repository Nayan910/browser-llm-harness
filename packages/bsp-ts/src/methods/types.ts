/**
 * Method handler type definitions
 */

import type { BspMeta } from '../types.js';

/** A handler for a specific method */
export interface MethodHandler<P = unknown, R = unknown> {
  handle(params: P, meta: BspMeta): Promise<R> | R;
}

/** A plain function handler */
export type MethodFunction<P = unknown, R = unknown> = (
  params: P,
  meta: BspMeta,
) => Promise<R> | R;

/** Collection of named method handlers (can be either objects or functions) */
export type MethodHandlers = Record<string, MethodHandler | MethodFunction>;
