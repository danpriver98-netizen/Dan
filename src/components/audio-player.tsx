"use client";

import * as React from "react";
import { Play, Pause, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mock cloud-PBX recording player (server-side recording, no device limits). */
export function MockAudioPlayer({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + 100 / (durationSec || 1) / 2;
      });
    }, 500);
    return () => clearInterval(id);
  }, [playing, durationSec]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const elapsed = Math.floor((progress / 100) * durationSec);

  if (durationSec === 0) {
    return <span className="text-xs text-muted-foreground">No recording (missed)</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-teal-foreground"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="flex min-w-[120px] flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full bg-teal transition-all")} style={{ width: `${progress}%` }} />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {fmt(elapsed)}/{fmt(durationSec)}
        </span>
      </div>
      <button className="text-muted-foreground hover:text-foreground" aria-label="Download recording">
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
