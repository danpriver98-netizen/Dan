"use client";

import * as React from "react";
import {
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Send,
  Filter,
  CheckCircle2,
  PhoneOff,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TagPill } from "@/components/tag-pill";
import { MockAudioPlayer } from "@/components/audio-player";
import {
  MESSAGE_TEMPLATES,
  CALL_LOGS,
  CONTACTS,
  TAGS,
  contactById,
} from "@/lib/mock-data";
import { formatDateTime, initials, cn } from "@/lib/utils";

export default function CommunicationPage() {
  return (
    <div>
      <PageHeader
        title="Omnichannel Comms"
        description="WhatsApp Cloud API templates, tag-filtered bulk messaging, and Cloud-PBX call logs."
        action={
          <Badge variant="teal" className="gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal" /> Meta Cloud API · Mock
          </Badge>
        }
      />

      <div className="p-4 md:p-8">
        <Tabs defaultValue="bulk">
          <TabsList>
            <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="calls">Call Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk"><BulkMessaging /></TabsContent>
          <TabsContent value="templates"><Templates /></TabsContent>
          <TabsContent value="calls"><CallLogs /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BulkMessaging() {
  const [activeTags, setActiveTags] = React.useState<string[]>([]);
  const [templateId, setTemplateId] = React.useState(MESSAGE_TEMPLATES[0].id);
  const [sent, setSent] = React.useState<number | null>(null);

  const toggle = (id: string) =>
    setActiveTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const recipients = CONTACTS.filter((c) => {
    if (c.dncFlagged) return false;
    if (!activeTags.length) return true;
    return activeTags.some((t) => c.tags.includes(t) || (c.desiredTags ?? []).includes(t));
  });
  const blocked = CONTACTS.filter(
    (c) => c.dncFlagged && (!activeTags.length || activeTags.some((t) => c.tags.includes(t)))
  );
  const template = MESSAGE_TEMPLATES.find((t) => t.id === templateId)!;

  const send = () => {
    setSent(recipients.length);
    setTimeout(() => setSent(null), 5000);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4 text-teal" />Filter audience by tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <button key={t.id} onClick={() => toggle(t.id)}>
                  <TagPill tagId={t.id} className={cn("cursor-pointer", !activeTags.includes(t.id) && activeTags.length > 0 && "opacity-40")} />
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm">
              <b className="text-teal">{recipients.length}</b> recipients match
              {blocked.length > 0 && <span className="text-muted-foreground"> · {blocked.length} excluded (DNC)</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Select template</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {MESSAGE_TEMPLATES.filter((t) => t.status === "approved").map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                  templateId === t.id ? "border-teal bg-teal/5" : "hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="secondary" className="uppercase">{t.language}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.body}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="sticky top-20">
          <CardHeader><CardTitle className="text-base">WhatsApp Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl bg-[#0b141a] p-3">
              <div className="ml-auto max-w-[90%] rounded-lg rounded-tr-none bg-[#005c4b] p-2.5 text-sm text-white">
                {template.body.replace("{{name}}", "David").replace(/\{\{\d\}\}/g, "…")}
                <div className="mt-1 text-right text-[10px] text-white/60">12:30 ✓✓</div>
              </div>
            </div>
            {sent !== null ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" /> Sent to {sent} contacts via Cloud API.
              </div>
            ) : (
              <Button variant="teal" className="mt-4 w-full" disabled={!recipients.length} onClick={send}>
                <Send className="h-4 w-4" /> Send to {recipients.length} contacts
              </Button>
            )}
            {blocked.length > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <PhoneOff className="h-3.5 w-3.5 text-destructive" /> {blocked.length} DNC-flagged numbers auto-skipped.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Templates() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="teal" size="sm"><Plus className="h-4 w-4" /> New Template</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {MESSAGE_TEMPLATES.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-teal" />
                  <span className="font-mono text-sm font-semibold">{t.name}</span>
                </div>
                <Badge variant={t.status === "approved" ? "success" : t.status === "pending" ? "warning" : "destructive"}>
                  {t.status}
                </Badge>
              </div>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary" className="capitalize">{t.category}</Badge>
                <Badge variant="outline" className="uppercase">{t.language}</Badge>
              </div>
              <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">{t.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CallLogs() {
  return (
    <div className="space-y-3">
      {CALL_LOGS.map((log) => {
        const contact = contactById(log.contactId);
        return (
          <Card key={log.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 sm:w-56">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  log.direction === "inbound" ? "bg-blue-500/10 text-blue-500" : "bg-teal/10 text-teal"
                )}>
                  {log.direction === "inbound" ? <PhoneIncoming className="h-4 w-4" /> : <PhoneOutgoing className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{contact?.name.trim() ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:w-32">
                <Badge variant={log.outcome === "connected" ? "success" : log.outcome === "no_answer" ? "destructive" : "warning"} className="capitalize">
                  {log.outcome.replace("_", " ")}
                </Badge>
                {log.dncChecked && (
                  <span title="Checked against DNC registry"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></span>
                )}
              </div>

              <div className="flex-1">
                <MockAudioPlayer durationSec={log.durationSec} />
              </div>
            </CardContent>
          </Card>
        );
      })}
      <p className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <Phone className="h-3.5 w-3.5" /> Recordings served server-side from Cloud PBX — bypasses iOS/Android recording limits.
      </p>
    </div>
  );
}
