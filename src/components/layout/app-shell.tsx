import { Sidebar } from "./sidebar";
import { MobileTopBar, MobileBottomBar } from "./mobile-nav";
import { QuickActionFab } from "./quick-action-fab";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
      </div>
      <MobileBottomBar />
      <QuickActionFab />
    </div>
  );
}

/** Standard page wrapper with title + optional action slot. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-card/40 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
