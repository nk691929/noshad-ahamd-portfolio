/**
 * Purpose: hide unfilled TODO(owner) placeholders in the UI. real(value) returns undefined for placeholders.
 * Used by: every section that renders owner content.
 */
import { isTodo } from "./todo";

export function real(value: string | undefined): string | undefined {
  return value === undefined || isTodo(value) ? undefined : value;
}
