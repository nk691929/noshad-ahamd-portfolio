/**
 * Purpose: public read endpoint for comments: GET /api/comments?before=<ISO>&limit=<n>. Returns approved comments only
 * (newest first) using the publishable key, so Row Level Security decides what is visible. Never cached, so a comment
 * is visible right after it is posted and after a page refresh. Used by: components/ui/comments-panel.tsx.
 */
import { NextResponse } from "next/server";
import { listComments, parseBefore, parseLimit } from "@/lib/comments";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await listComments(
    parseBefore(searchParams.get("before")),
    parseLimit(searchParams.get("limit")),
  );
  if (!result) {
    return NextResponse.json(
      { error: "Comments are unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
