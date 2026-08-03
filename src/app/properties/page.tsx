"use client";

import * as React from "react";
import {
  Search,
  FileText,
  MapPin,
  BedDouble,
  Ruler,
  Crown,
  CheckCircle2,
  Send,
  Archive,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TagPill } from "@/components/tag-pill";
import { PROPERTIES, propertyByCode, contactById } from "@/lib/mock-data";
import type { Property } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "teal" | "warning" | "success" | "secondary"> = {
  active: "teal",
  under_offer: "warning",
  sold: "success",
  rented: "success",
  archived: "secondary",
};

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState(PROPERTIES);
  const [botQuery, setBotQuery] = React.useState("");
  const [brochure, setBrochure] = React.useState<Property | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const botMatch = botQuery ? propertyByCode(botQuery.trim()) : undefined;

  const markSold = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "sold", soldPrice: p.askingPrice } : p))
    );
    const prop = properties.find((p) => p.id === id);
    const seller = prop?.sellerId ? contactById(prop.sellerId) : undefined;
    setToast(
      seller
        ? `✅ ${prop?.code} marked SOLD · seller "${seller.name.trim()}" auto-moved to Past Clients Archive`
        : `✅ ${prop?.code} marked SOLD`
    );
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Listing lifecycle, smart tags, and the Name Bot brochure packager."
        action={<Button variant="teal" size="sm">+ Add Listing</Button>}
      />

      <div className="space-y-5 p-4 md:p-8">
        {/* Name Bot */}
        <Card className="border-teal/30 bg-teal/5">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal" />
              <p className="text-sm font-semibold">Name Bot · Property Code Autocomplete</p>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Type a property code (e.g. <code className="rounded bg-secondary px-1">BY-PENT-04</code>) — the bot instantly packages a digital brochure (Tabu deed, municipal tax, floor plan, virtual tour, comparables) ready to send.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter property code…"
                  className="pl-9"
                  value={botQuery}
                  onChange={(e) => setBotQuery(e.target.value)}
                />
              </div>
              <Button variant="teal" disabled={!botMatch} onClick={() => botMatch && setBrochure(botMatch)}>
                <FileText className="h-4 w-4" /> Package
              </Button>
            </div>
            {botQuery && (
              <p className="mt-2 text-xs">
                {botMatch ? (
                  <span className="text-teal">✓ Found: {botMatch.title}</span>
                ) : (
                  <span className="text-muted-foreground">No property matches that code. Try BY-PENT-04, RL-BAL-21, BY-GRD-09…</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {toast && (
          <div className="animate-fade-in rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {toast}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative h-40 w-full bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 flex gap-1">
                  <Badge variant={STATUS_VARIANT[p.status]} className="capitalize shadow">
                    {p.status === "sold" && <Archive className="mr-1 h-3 w-3" />}
                    {p.status.replace("_", " ")}
                  </Badge>
                  {p.origin === "proptech_feed" && (
                    <Badge variant="secondary" className="shadow">PropTech Feed</Badge>
                  )}
                </div>
                {p.exclusive && (
                  <Badge variant="teal" className="absolute right-2 top-2 gap-1 shadow">
                    <Crown className="h-3 w-3" /> Exclusive
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.title}</p>
                    <p className="font-mono text-xs text-teal">{p.code}</p>
                  </div>
                  <p className="shrink-0 text-right font-bold">{formatCurrency(p.askingPrice, { compact: true })}</p>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.city}</span>
                  <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.rooms}</span>
                  <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.sizeSqm}m²</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {p.tags.map((t) => <TagPill key={t} tagId={t} />)}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setBrochure(p)}>
                    <FileText className="h-3.5 w-3.5" /> Brochure
                  </Button>
                  {p.status !== "sold" && p.status !== "archived" && (
                    <Button size="sm" variant="teal" className="flex-1" onClick={() => markSold(p.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Sold
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BrochureDialog property={brochure} onClose={() => setBrochure(null)} />
    </div>
  );
}

function BrochureDialog({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const items = property
    ? [
        { key: "tabuDeed", label: "Tabu / Title Deed", on: property.brochure.tabuDeed },
        { key: "municipalTax", label: "Municipal Tax (Arnona)", on: property.brochure.municipalTax },
        { key: "floorPlan", label: "Floor Plan", on: property.brochure.floorPlan },
        { key: "virtualTour", label: "Virtual Tour (360°)", on: property.brochure.virtualTour },
        { key: "comparables", label: "Comparable Deals (CMA)", on: property.brochure.comparables },
      ]
    : [];

  return (
    <Dialog open={!!property} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal" /> Digital Brochure
          </DialogTitle>
          <DialogDescription>
            {property?.code} · {property?.title} — auto-packaged assets, one tap to send.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.key} className={cn(
              "flex items-center justify-between rounded-lg border p-3 text-sm",
              !it.on && "opacity-50"
            )}>
              <span>{it.label}</span>
              {it.on ? (
                <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Ready</Badge>
              ) : (
                <Badge variant="secondary">Missing</Badge>
              )}
            </div>
          ))}
        </div>
        <Button variant="teal" className="w-full">
          <Send className="h-4 w-4" /> Send via WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
  );
}
