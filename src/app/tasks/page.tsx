"use client";

import * as React from "react";
import {
  Check,
  X,
  CalendarCheck,
  RotateCcw,
  CalendarDays,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENDA_TASKS, contactById } from "@/lib/mock-data";
import type { AgendaTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<AgendaTask[]>(AGENDA_TASKS);
  const [rolledNotice, setRolledNotice] = React.useState<number | null>(null);

  const todayIso = new Date().toISOString().slice(0, 10);

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t
      )
    );

  /** Simulate the nightly cron: roll any unchecked past task to today. */
  const runRollover = () => {
    let count = 0;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status !== "done" && t.dueDate < todayIso) {
          count++;
          return { ...t, dueDate: todayIso, status: "rolled_over", rolledFrom: t.rolledFrom ?? t.dueDate };
        }
        return t;
      })
    );
    setRolledNotice(count);
    setTimeout(() => setRolledNotice(null), 4000);
  };

  const today = tasks.filter((t) => t.dueDate <= todayIso);
  const upcoming = tasks.filter((t) => t.dueDate > todayIso);
  const doneCount = today.filter((t) => t.status === "done").length;

  return (
    <div>
      <PageHeader
        title="Rolling Task Board"
        description="Daily agenda with Google Calendar sync — unchecked tasks roll over automatically."
        action={
          <Button variant="outline" size="sm" onClick={runRollover}>
            <RotateCcw className="h-4 w-4" /> Run rollover
          </Button>
        }
      />

      <div className="space-y-5 p-4 md:p-8">
        <Card className="border-teal/30 bg-teal/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            <span>
              <b className="text-foreground">Rollover logic:</b> any task left unchecked (marked with an <b>×</b> or untouched) at day&apos;s end is automatically carried to the next day&apos;s agenda. Tap “Run rollover” to simulate the nightly cron.
            </span>
          </CardContent>
        </Card>

        {rolledNotice !== null && (
          <div className="animate-fade-in rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
            🔄 {rolledNotice} unchecked task{rolledNotice !== 1 && "s"} rolled over to today.
          </div>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-teal" /> Today
            </CardTitle>
            <Badge variant="secondary">{doneCount}/{today.length} done</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {today.map((t) => <TaskRow key={t.id} task={t} onToggle={toggle} />)}
            {!today.length && <p className="py-6 text-center text-sm text-muted-foreground">No tasks for today 🎉</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((t) => <TaskRow key={t.id} task={t} onToggle={toggle} />)}
            {!upcoming.length && <p className="py-6 text-center text-sm text-muted-foreground">Nothing scheduled ahead.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({ task: t, onToggle }: { task: AgendaTask; onToggle: (id: string) => void }) {
  const contact = t.contactId ? contactById(t.contactId) : undefined;
  const done = t.status === "done";
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", done && "opacity-60")}>
      <button
        onClick={() => onToggle(t.id)}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          done ? "border-teal bg-teal text-teal-foreground" : "border-muted-foreground/40 text-transparent hover:border-teal"
        )}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done ? <Check className="h-4 w-4" /> : <X className="h-3.5 w-3.5 text-muted-foreground/40" />}
      </button>

      <span className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-amber-500" : "bg-slate-400")} />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "line-through")}>{t.title}</p>
        {contact && <p className="text-xs text-muted-foreground">{contact.name.trim()}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {t.status === "rolled_over" && <Badge variant="warning" className="gap-1"><RotateCcw className="h-3 w-3" />Rolled</Badge>}
        {t.syncedToCalendar && (
          <span title="Synced to Google Calendar"><CalendarCheck className="h-4 w-4 text-teal" /></span>
        )}
      </div>
    </div>
  );
}
