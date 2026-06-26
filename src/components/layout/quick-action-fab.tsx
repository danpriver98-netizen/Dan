"use client";

import * as React from "react";
import { Plus, PhoneCall, Tag as TagIcon, BellRing, Check, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TAGS } from "@/lib/mock-data";
import { TagPill } from "@/components/tag-pill";
import { checkDnc } from "@/lib/dnc";
import { cn } from "@/lib/utils";

/**
 * Sticky floating action button for field agents.
 * Add a client from a recent call → tag → set callback reminder in ~5 seconds.
 * Includes inline DNC registry check on the entered number.
 */
export function QuickActionFab() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [callback, setCallback] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const dnc = phone.replace(/\D/g, "").length >= 6 ? checkDnc(phone) : null;

  const toggleTag = (id: string) =>
    setSelectedTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const reset = () => {
    setName(""); setPhone(""); setSelectedTags([]); setCallback(""); setSaved(false);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => { setOpen(false); reset(); }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick add client"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-teal-foreground shadow-lg shadow-teal/30 transition-transform active:scale-95 md:bottom-6 md:right-6"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-teal" /> Quick Capture
            </DialogTitle>
            <DialogDescription>
              Add a client from your last call, tag them, and set a callback — in seconds.
            </DialogDescription>
          </DialogHeader>

          {saved ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <Check className="h-8 w-8" />
              </div>
              <p className="font-semibold">Client saved & reminder set</p>
              <p className="text-sm text-muted-foreground">Synced to your task board and calendar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qa-name">Name</Label>
                  <Input id="qa-name" placeholder="e.g. Dana Levi" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qa-phone">Phone</Label>
                  <Input id="qa-phone" placeholder="+972-5x-xxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              {dnc && (
                <div className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                  dnc.registered ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}>
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {dnc.registered
                    ? "⚠ Number is on the Do-Not-Call registry — outreach blocked by regulator check."
                    : "✓ Cleared against Do-Not-Call registry."}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><TagIcon className="h-3.5 w-3.5" /> Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.slice(0, 9).map((t) => (
                    <button key={t.id} onClick={() => toggleTag(t.id)}>
                      <TagPill
                        tagId={t.id}
                        className={cn("cursor-pointer", !selectedTags.includes(t.id) && "opacity-40")}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qa-cb" className="flex items-center gap-1.5"><BellRing className="h-3.5 w-3.5" /> Callback reminder</Label>
                <Input id="qa-cb" type="datetime-local" value={callback} onChange={(e) => setCallback(e.target.value)} />
              </div>

              <Button
                variant="teal"
                className="w-full"
                disabled={!name || !phone || (dnc?.registered ?? false)}
                onClick={save}
              >
                Save client & set reminder
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
