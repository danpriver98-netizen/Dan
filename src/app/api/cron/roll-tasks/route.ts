import { NextResponse } from "next/server";
import { AGENDA_TASKS } from "@/lib/mock-data";

/**
 * Rolling Task Board cron.
 * Daily job — any uncompleted task with a past due date rolls over to today.
 * Mirrors the SQL fn_roll_over_tasks() in the Supabase schema.
 *
 * Protect with: Authorization: Bearer ${CRON_SECRET}
 * GET /api/cron/roll-tasks
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const rolled = AGENDA_TASKS.filter(
    (t) => t.status !== "done" && t.dueDate < today
  ).map((t) => ({
    id: t.id,
    title: t.title,
    rolledFrom: t.rolledFrom ?? t.dueDate,
    newDueDate: today,
  }));

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    rolledCount: rolled.length,
    rolled,
  });
}
