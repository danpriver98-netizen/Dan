"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, Moon, Sun } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function MobileTopBar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-teal-foreground">
          <Building className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold">Real-Estate 360°</span>
      </div>
      <button onClick={toggle} className="rounded-md p-2 text-muted-foreground">
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => i.mobile);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t bg-card/95 backdrop-blur md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium",
              active ? "text-teal" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
