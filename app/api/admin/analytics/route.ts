import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { loadAnalytics } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const r = Number(new URL(req.url).searchParams.get("range"));
  const range = [7, 30, 90].includes(r) ? r : 30;
  try {
    return NextResponse.json(await loadAnalytics(range));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not load analytics." }, { status: 500 });
  }
}
