import { NextResponse, type NextRequest } from "next/server";

import { deleteTokens } from "@/lib/google-oauth";

/** POST /api/calendar/disconnect?engineer=luc-thilliez */
export async function POST(req: NextRequest) {
  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  await deleteTokens(engineer);
  return NextResponse.json({ ok: true, engineer });
}
