import Link from "next/link";
import {
  Users,
  Building2,
  Wallet,
  Target,
  TrendingUp,
  PhoneOff,
  Clock,
  BellRing,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagPill } from "@/components/tag-pill";
import {
  CONTACTS,
  PROPERTIES,
  CHEQUES,
  MARKETING_EXPENSES,
  AGENDA_TASKS,
  contactById,
  propertyById,
} from "@/lib/mock-data";
import { projectTaxes } from "@/lib/tax";
import { formatCurrency, formatDate, addMonths } from "@/lib/utils";

export default function DashboardPage() {
  const activeContacts = CONTACTS.filter((c) => c.stage !== "past_client").length;
  const activeListings = PROPERTIES.filter((p) => p.status === "active" || p.status === "under_offer").length;
  const dncCount = CONTACTS.filter((c) => c.dncFlagged).length;

  const closedDeals = PROPERTIES.filter((p) => p.status === "sold");
  const grossCommission = closedDeals.reduce(
    (sum, p) => sum + (p.soldPrice ?? p.askingPrice) * ((p.commissionRate ?? 2) / 100),
    0
  );
  const tax = projectTaxes(grossCommission);

  const pendingCheques = CHEQUES.filter((c) => c.status === "pending" && c.direction === "incoming");
  const pendingCash = pendingCheques.reduce((s, c) => s + c.amount, 0);
  const totalMarketingSpend = MARKETING_EXPENSES.reduce((s, e) => s + e.amount, 0);

  const rolledTasks = AGENDA_TASKS.filter((t) => t.status === "rolled_over");
  const todayTasks = AGENDA_TASKS.filter((t) => t.status !== "done");

  // Renter 11-month renewals due
  const renewals = CONTACTS.filter((c) => {
    if (c.type !== "renter" || !c.leaseStartDate) return false;
    const alert = addMonths(new Date(c.leaseStartDate), 11);
    const now = new Date();
    return now >= alert && now < addMonths(new Date(c.leaseStartDate), 12);
  });

  return (
    <div>
      <PageHeader
        title="Command Center"
        description="Your real-estate business at a glance — pipeline, automations, and cash flow."
        action={
          <Badge variant="teal" className="gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal animate-pulse" /> Live · Mock Feeds
          </Badge>
        }
      />

      <div className="space-y-6 p-4 md:p-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Active Clients" value={String(activeContacts)} icon={Users} accent="teal" delta="+2 this week" deltaPositive />
          <StatCard label="Live Listings" value={String(activeListings)} icon={Building2} accent="blue" />
          <StatCard label="Pending Cash" value={formatCurrency(pendingCash, { compact: true })} icon={Wallet} accent="amber" />
          <StatCard label="Proj. Commission" value={formatCurrency(grossCommission, { compact: true })} icon={TrendingUp} accent="rose" deltaPositive delta="YTD closed" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Automation alerts */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Automation Alerts</CardTitle>
              <Badge variant="secondary">{renewals.length + dncCount + rolledTasks.length} active</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {renewals.map((r) => (
                <AlertRow
                  key={r.id}
                  icon={<BellRing className="h-4 w-4 text-amber-500" />}
                  title={`Lease renewal: ${r.name}`}
                  sub={`11-month trigger fired · lease started ${formatDate(r.leaseStartDate!)}`}
                  href="/contacts"
                  badge={<Badge variant="warning">Renewal</Badge>}
                />
              ))}
              {dncCount > 0 && (
                <AlertRow
                  icon={<PhoneOff className="h-4 w-4 text-destructive" />}
                  title={`${dncCount} contacts on Do-Not-Call registry`}
                  sub="Outbound calls & bulk messages auto-blocked for these numbers"
                  href="/contacts"
                  badge={<Badge variant="destructive">Regulator</Badge>}
                />
              )}
              {rolledTasks.length > 0 && (
                <AlertRow
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                  title={`${rolledTasks.length} tasks rolled over to today`}
                  sub="Unchecked tasks automatically carried forward from previous days"
                  href="/tasks"
                  badge={<Badge variant="secondary">Rollover</Badge>}
                />
              )}
            </CardContent>
          </Card>

          {/* Tax snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tax Estimator (Internal)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Gross commission" value={formatCurrency(tax.grossCommission)} />
              <Row label="VAT (Ma'am 18%)" value={formatCurrency(tax.vatCollected)} muted />
              <Row label={`Income tax (${(tax.effectiveIncomeRate * 100).toFixed(0)}%)`} value={formatCurrency(tax.incomeTax)} muted />
              <div className="border-t pt-3">
                <Row label="Est. take-home" value={formatCurrency(tax.takeHome)} bold />
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/finance">Open Finance BI <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's agenda + hot listings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Agenda</CardTitle>
              <Button asChild variant="link" size="sm"><Link href="/tasks">View board</Link></Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-amber-500" : "bg-slate-400"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    {t.contactId && <p className="text-xs text-muted-foreground">{contactById(t.contactId)?.name}</p>}
                  </div>
                  {t.status === "rolled_over" && <Badge variant="secondary" className="shrink-0">Rolled</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Marketing Spend vs Pipeline</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total Ad Spend</p>
                  <p className="text-lg font-bold">{formatCurrency(totalMarketingSpend, { compact: true })}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Proj. Commission</p>
                  <p className="text-lg font-bold text-teal">{formatCurrency(grossCommission, { compact: true })}</p>
                </div>
              </div>
              <div className="space-y-2">
                {PROPERTIES.filter((p) => p.status !== "archived").slice(0, 3).map((p) => (
                  <Link href="/properties" key={p.id} className="flex items-center gap-3 rounded-lg border p-2 hover:bg-accent">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => <TagPill key={t} tagId={t} />)}
                      </div>
                    </div>
                    <Badge variant={p.status === "sold" ? "success" : p.status === "under_offer" ? "warning" : "teal"}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ icon, title, sub, href, badge }: { icon: React.ReactNode; title: string; sub: string; href: string; badge: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      {badge}
    </Link>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={bold ? "font-bold text-teal" : "font-medium"}>{value}</span>
    </div>
  );
}
