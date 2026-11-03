/**
 * Purpose: types shared by the comment server action, the API route and the client panel (no Zod, so the client
 * bundle stays small).
 */
export type CommentItem = { id: string; name: string; message: string; created_at: string };

export type CommentField = "name" | "message";

export type CommentState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CommentField, string>>;
  values?: Record<CommentField, string>;
  /** the stored comment, returned so it can be shown immediately (omitted when approval is required) */
  comment?: CommentItem;
};
