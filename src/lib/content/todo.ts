/**
 * Purpose: typed placeholder helpers. Anything the owner has not supplied is a `TODO(owner)` string,
 * never an invented value. Inputs: none. Used by: content/*.ts, schemas.ts, UI (to hide/flag placeholders).
 */
export const TODO_PREFIX = "TODO(owner)";

export type TodoText = `${typeof TODO_PREFIX}: ${string}`;

/** Create a placeholder, e.g. todo("live URL"). */
export const todo = (what: string): TodoText => `${TODO_PREFIX}: ${what}`;

/** True when a value is still an unfilled placeholder. */
export const isTodo = (value: unknown): value is TodoText =>
  typeof value === "string" && value.startsWith(TODO_PREFIX);
