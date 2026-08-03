import { NextResponse } from "next/server";
import { CALL_LOGS, contactById } from "@/lib/mock-data";

/**
 * Cloud-PBX recording endpoint (mock).
 * Recordings are stored & served server-side from the cloud network,
 * bypassing iOS/Android on-device recording restrictions.
 *
 * GET /api/recording/:id  → recording metadata (would stream audio in prod)
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const log = CALL_LOGS.find((c) => c.id === params.id);
  if (!log) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  return NextResponse.json({
    callId: log.id,
    contact: contactById(log.contactId)?.name.trim(),
    direction: log.direction,
    durationSec: log.durationSec,
    recordedAt: log.timestamp,
    storage: "cloud-pbx://recordings/" + log.id + ".mp3",
    note: "Audio streamed server-side in production (Twilio/Cloud PBX).",
  });
}
