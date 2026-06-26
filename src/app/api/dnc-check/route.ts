import { NextResponse } from "next/server";
import { checkDnc, checkDncBatch } from "@/lib/dnc";

/**
 * Regulator "Do Not Call" registry check.
 * POST { phone: string } | { phones: string[] }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (Array.isArray(body.phones)) {
    return NextResponse.json({ results: checkDncBatch(body.phones) });
  }
  if (typeof body.phone === "string") {
    return NextResponse.json(checkDnc(body.phone));
  }
  return NextResponse.json(
    { error: "Provide `phone` (string) or `phones` (string[])." },
    { status: 400 }
  );
}

export async function GET(req: Request) {
  const phone = new URL(req.url).searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "Missing ?phone=" }, { status: 400 });
  }
  return NextResponse.json(checkDnc(phone));
}
