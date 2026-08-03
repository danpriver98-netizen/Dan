"use client";

import * as React from "react";
import {
  MapPin,
  Check,
  X,
  Clock,
  Navigation,
  Link2,
  CalendarPlus,
  CalendarCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPOINTMENTS, contactById, propertyById } from "@/lib/mock-data";
import type { Appointment, RsvpStatus } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";

const STATUS: Record<RsvpStatus, { variant: "success" | "warning" | "destructive"; label: string }> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "warning", label: "Awaiting RSVP" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

export default function AppointmentsPage() {
  const [appts, setAppts] = React.useState<Appointment[]>(APPOINTMENTS);
  const [copied, setCopied] = React.useState<string | null>(null);

  const setStatus = (id: string, status: RsvpStatus) =>
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const copyLink = (a: Appointment) => {
    const link = `https://crm360.app/rsvp/${a.confirmationToken}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(a.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Appointments & RSVP"
        description="Viewing confirmations with Waze navigation — client responses sync to your calendar."
        action={<Button variant="teal" size="sm"><CalendarPlus className="h-4 w-4" /> Schedule Viewing</Button>}
      />

      <div className="space-y-4 p-4 md:p-8">
        {appts.map((a) => {
          const contact = contactById(a.contactId);
          const prop = propertyById(a.propertyId);
          const st = STATUS[a.status];
          return (
            <Card key={a.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{prop?.title}</CardTitle>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {prop?.address}
                  </p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 text-xs font-bold text-teal">
                      {contact?.name.trim().slice(0, 1)}
                    </span>
                    {contact?.name.trim()}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {formatDateTime(a.scheduledAt)}
                  </span>
                  {a.status === "confirmed" && (
                    <span className="flex items-center gap-1 text-xs text-teal">
                      <CalendarCheck className="h-3.5 w-3.5" /> Synced to calendar
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button asChild variant="outline" size="sm">
                    <a href={a.wazeUrl} target="_blank" rel="noreferrer">
                      <Navigation className="h-3.5 w-3.5" /> Waze
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyLink(a)}>
                    <Link2 className="h-3.5 w-3.5" /> {copied === a.id ? "Copied!" : "RSVP Link"}
                  </Button>
                  {a.status !== "confirmed" && (
                    <Button variant="teal" size="sm" onClick={() => setStatus(a.id, "confirmed")}>
                      <Check className="h-3.5 w-3.5" /> Confirm
                    </Button>
                  )}
                  {a.status !== "cancelled" && (
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setStatus(a.id, "cancelled")}>
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>

                {/* Simulated client RSVP card preview */}
                <div className={cn(
                  "rounded-lg border p-3 text-xs",
                  a.status === "confirmed" ? "border-emerald-500/30 bg-emerald-500/5" : "bg-secondary/40"
                )}>
                  <p className="font-medium">Client confirmation link preview</p>
                  <p className="mt-1 font-mono text-muted-foreground break-all">
                    https://crm360.app/rsvp/{a.confirmationToken}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Includes a one-tap Waze button. The client&apos;s Confirm/Cancel choice writes back to the agent&apos;s Google Calendar automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
