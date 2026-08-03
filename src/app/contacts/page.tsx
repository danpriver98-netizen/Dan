"use client";

import * as React from "react";
import { Search, PhoneOff, Phone, Mail, Filter, Archive } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagPill } from "@/components/tag-pill";
import { CONTACTS, TAGS } from "@/lib/mock-data";
import type { Contact, ContactType } from "@/lib/types";
import { formatCurrency, formatDate, initials, cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  seller: "Sellers",
  buyer: "Buyers",
  renter: "Renters",
};

const STAGE_VARIANT: Record<string, "teal" | "warning" | "secondary"> = {
  active: "teal",
  nurturing: "warning",
  past_client: "secondary",
};

export default function ContactsPage() {
  const [type, setType] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<string[]>([]);

  const filtered = CONTACTS.filter((c) => {
    if (type !== "all" && c.type !== type) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.phone.includes(query)) return false;
    if (activeTags.length && !activeTags.every((t) => c.tags.includes(t) || (c.desiredTags ?? []).includes(t))) return false;
    return true;
  });

  const toggleTag = (id: string) =>
    setActiveTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Unified Sellers, Buyers & Renters with smart tagging and pipeline stages."
        action={<Button variant="teal" size="sm">+ New Contact</Button>}
      />

      <div className="space-y-4 p-4 md:p-8">
        <Tabs value={type} onValueChange={setType}>
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            {Object.keys(TYPE_LABELS).map((k) => (
              <TabsTrigger key={k} value={k} className="flex-1 md:flex-none">
                {TYPE_LABELS[k]}
                <Badge variant="secondary" className="ml-1.5 px-1.5">
                  {k === "all" ? CONTACTS.length : CONTACTS.filter((c) => c.type === k).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Tag filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {TAGS.map((t) => (
            <button key={t.id} onClick={() => toggleTag(t.id)} className="shrink-0">
              <TagPill tagId={t.id} className={cn("cursor-pointer transition-opacity", !activeTags.includes(t.id) && activeTags.length > 0 && "opacity-40")} />
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} contacts</p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactCard({ contact: c }: { contact: Contact }) {
  return (
    <Card className={cn(c.stage === "past_client" && "opacity-80")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal/10 text-sm font-bold text-teal">
            {initials(c.name.trim())}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{c.name.trim()}</p>
              {c.dncFlagged && (
                <span title="On Do-Not-Call registry" className="text-destructive">
                  <PhoneOff className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{c.type}</span>·<span>{c.city}</span>·<span>{c.source}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={STAGE_VARIANT[c.stage]}>
              {c.stage === "past_client" ? <Archive className="mr-1 h-3 w-3" /> : null}
              {c.stage.replace("_", " ")}
            </Badge>
            <span className={cn(
              "text-[10px] font-bold uppercase",
              c.seriousness === "hot" ? "text-rose-500" : c.seriousness === "warm" ? "text-amber-500" : "text-slate-400"
            )}>
              {c.seriousness}
            </span>
          </div>
        </div>

        {(c.budgetMax || c.rooms) && (
          <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-secondary/50 p-2 text-xs">
            {c.budgetMax && (
              <span><span className="text-muted-foreground">Budget </span><b>{formatCurrency(c.budgetMin ?? 0, { compact: true })}–{formatCurrency(c.budgetMax, { compact: true })}</b></span>
            )}
            {c.rooms && <span><span className="text-muted-foreground">Rooms </span><b>{c.rooms}+</b></span>}
            {c.leaseEndDate && <span><span className="text-muted-foreground">Lease ends </span><b>{formatDate(c.leaseEndDate)}</b></span>}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {c.tags.map((t) => <TagPill key={t} tagId={t} />)}
          {(c.desiredTags ?? []).filter((t) => !c.tags.includes(t)).map((t) => (
            <TagPill key={`d-${t}`} tagId={t} className="ring-1 ring-dashed ring-current" />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" disabled={c.dncFlagged}>
            <Phone className="h-3.5 w-3.5" /> Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Mail className="h-3.5 w-3.5" /> WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
