import { NextResponse, type NextRequest } from "next/server";

import { loadSubmissions } from "@/lib/dci-store";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug) {
    return NextResponse.json({ error: "prospect query param required" }, { status: 400 });
  }
  const { source, submissions } = await loadSubmissions(slug);
  return NextResponse.json({ source, prospect: slug, submissions });
}
