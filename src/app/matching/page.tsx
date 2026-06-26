"use client";

import * as React from "react";
import { Target, Zap, Send, CheckCircle2, PhoneOff, Database, Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TagPill } from "@/components/tag-pill";
import { PROPERTIES, CONTACTS, MESSAGE_TEMPLATES } from "@/lib/mock-data";
import { findBuyersForProperty } from "@/lib/matching";
import { formatCurrency, initials, cn } from "@/lib/utils";

export default function MatchingPage() {
  const sellable = PROPERTIES.filter((p) => p.status === "active" || p.status === "under_offer");
  const [selectedId, setSelectedId] = React.useState(sellable[0]?.id);
  const [broadcasting, setBroadcasting] = React.useState(false);
  const [sentCount, setSentCount] = React.useState<number | null>(null);

  const property = PROPERTIES.find((p) => p.id === selectedId)!;
  const matches = findBuyersForProperty(property, CONTACTS, 50);
  const blocked = CONTACTS.filter(
    (c) => (c.type === "buyer" || c.type === "renter") && c.dncFlagged
  );

  const broadcast = () => {
    setBroadcasting(true);
    setSentCount(null);
    setTimeout(() => {
      setBroadcasting(false);
      setSentCount(matches.length);
      setTimeout(() => setSentCount(null), 5000);
    }, 1400);
  };

  return (
    <div>
      <PageHeader
        title="Matching Engine"
        description="Cross-reference buyer preference tags against internal + PropTech listings."
      />

      <div className="grid gap-5 p-4 md:grid-cols-[320px_1fr] md:p-8">
        {/* Property selector */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Select a listing to match</p>
          {sellable.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedId(p.id); setSentCount(null); }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-colors",
                selectedId === p.id ? "border-teal bg-teal/5 ring-1 ring-teal" : "hover:bg-accent"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">{p.title}</span>
                <span className="shrink-0 text-xs font-bold">{formatCurrency(p.askingPrice, { compact: true })}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={p.origin === "internal" ? "teal" : "secondary"} className="gap-1">
                  {p.origin === "internal" ? <Database className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                  {p.origin === "internal" ? "Internal" : "PropTech"}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.rooms} rooms · {p.city}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Match results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-teal" />
                  {matches.length} candidate{matches.length !== 1 && "s"} matched
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  for <b>{property.title}</b> · template: <code className="rounded bg-secondary px-1">{MESSAGE_TEMPLATES[0].name}</code>
                </p>
              </div>
              <Button variant="teal" disabled={!matches.length || broadcasting} onClick={broadcast}>
                {broadcasting ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Broadcasting…</>
                ) : (
                  <><Zap className="h-4 w-4" /> One-Click Broadcast</>
                )}
              </Button>
            </CardHeader>
            {sentCount !== null && (
              <CardContent className="pt-0">
                <div className="animate-fade-in flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  WhatsApp template blasted to {sentCount} matched candidate{sentCount !== 1 && "s"} simultaneously.
                </div>
              </CardContent>
            )}
          </Card>

          <div className="space-y-3">
            {matches.map((m) => (
              <Card key={m.buyer.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal/10 text-sm font-bold text-teal">
                    {initials(m.buyer.name.trim())}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{m.buyer.name.trim()}</p>
                      <Badge variant="secondary" className="capitalize">{m.buyer.type}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.reasons.join(" · ")}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(m.buyer.desiredTags ?? []).map((t) => <TagPill key={t} tagId={t} />)}
                    </div>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <p className="text-lg font-bold text-teal">{m.score}%</p>
                    <Progress value={m.score} className="mt-1" />
                  </div>
                  <Button size="icon" variant="outline" className="shrink-0" aria-label="Send">
                    <Send className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {!matches.length && (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
                No candidates above the 50% match threshold for this listing.
              </CardContent></Card>
            )}
          </div>

          {blocked.length > 0 && (
            <Card className="border-destructive/30">
              <CardContent className="flex items-center gap-3 p-4 text-sm">
                <PhoneOff className="h-4 w-4 shrink-0 text-destructive" />
                <span className="text-muted-foreground">
                  <b className="text-foreground">{blocked.length} potential match{blocked.length !== 1 && "es"} excluded</b> — on the Do-Not-Call registry. Broadcast respects the regulator check automatically.
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
