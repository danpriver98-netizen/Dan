import { NextResponse } from "next/server";
import { CONTACTS } from "@/lib/mock-data";
import { addMonths } from "@/lib/utils";

/**
 * Renter 11-Month Automation Trigger.
 * Daily cron job — finds renters whose lease started ~11 months ago and
 * fires a renewal alert (prompt the agent to renew or find a new property).
 *
 * Protect with: Authorization: Bearer ${CRON_SECRET}
 * GET /api/cron/renter-renewal
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = CONTACTS.filter((c) => {
    if (c.type !== "renter" || !c.leaseStartDate) return false;
    const start = new Date(c.leaseStartDate);
    const alertDate = addMonths(start, 11);
    const expiry = addMonths(start, 12);
    return now >= alertDate && now < expiry;
  }).map((c) => ({
    contactId: c.id,
    name: c.name.trim(),
    phone: c.phone,
    leaseStartDate: c.leaseStartDate,
    renewalAlertDate: addMonths(new Date(c.leaseStartDate!), 11)
      .toISOString()
      .slice(0, 10),
    leaseEndDate: c.leaseEndDate,
    action: "send_lease_renewal_template", // tpl: lease_renewal_11mo
  }));

  return NextResponse.json({
    triggeredAt: now.toISOString(),
    count: due.length,
    renewals: due,
  });
}
