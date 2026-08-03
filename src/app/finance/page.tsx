"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Wallet, Receipt, Banknote, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  PROPERTIES,
  MARKETING_EXPENSES,
  CHEQUES,
  propertyById,
} from "@/lib/mock-data";
import { projectTaxes, VAT_RATE } from "@/lib/tax";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function FinancePage() {
  const expensesByProperty = (id: string) =>
    MARKETING_EXPENSES.filter((e) => e.propertyId === id).reduce((s, e) => s + e.amount, 0);

  const roiData = PROPERTIES.filter((p) => p.status !== "archived").map((p) => {
    const spend = expensesByProperty(p.id);
    const closing = (p.soldPrice ?? p.askingPrice) * ((p.commissionRate ?? 2) / 100);
    const projected = p.status === "sold";
    const net = (projected ? closing : closing * 0.6) - spend; // discount unrealized pipeline
    return { id: p.id, code: p.code, title: p.title, spend, commission: closing, net, projected };
  });

  const totalSpend = MARKETING_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const closedCommission = PROPERTIES.filter((p) => p.status === "sold").reduce(
    (s, p) => s + (p.soldPrice ?? p.askingPrice) * ((p.commissionRate ?? 2) / 100),
    0
  );
  const tax = projectTaxes(closedCommission);

  const incoming = CHEQUES.filter((c) => c.direction === "incoming");
  const pendingIn = incoming.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);
  const clearedIn = incoming.filter((c) => c.status === "cleared").reduce((s, c) => s + c.amount, 0);
  const outgoing = CHEQUES.filter((c) => c.direction === "outgoing");
  const pendingOut = outgoing.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <PageHeader
        title="Financial BI"
        description="Internal monitoring only — ROI per listing, cash-flow ledger, and tax projections."
        action={<Badge variant="secondary">Internal tracking · not invoicing</Badge>}
      />

      <div className="space-y-5 p-4 md:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Marketing Spend" value={formatCurrency(totalSpend, { compact: true })} icon={Receipt} accent="amber" />
          <StatCard label="Closed Commission" value={formatCurrency(closedCommission, { compact: true })} icon={TrendingUp} accent="teal" />
          <StatCard label="Pending Cash In" value={formatCurrency(pendingIn, { compact: true })} icon={Wallet} accent="blue" />
          <StatCard label="Est. VAT Liability" value={formatCurrency(tax.vatLiability, { compact: true })} icon={Banknote} accent="rose" />
        </div>

        <Tabs defaultValue="roi">
          <TabsList>
            <TabsTrigger value="roi">ROI per Listing</TabsTrigger>
            <TabsTrigger value="cashflow">Cheque & Cash Flow</TabsTrigger>
            <TabsTrigger value="tax">Tax Estimator</TabsTrigger>
          </TabsList>

          {/* ROI */}
          <TabsContent value="roi" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Net Profit per Listing</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="code" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={48} />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                        {roiData.map((d) => (
                          <Cell key={d.id} fill={d.net >= 0 ? "hsl(173 80% 40%)" : "hsl(0 72% 51%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              {roiData.map((d) => {
                const margin = d.commission > 0 ? (d.net / d.commission) * 100 : 0;
                return (
                  <Card key={d.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{d.title}</p>
                          <p className="font-mono text-xs text-teal">{d.code}</p>
                        </div>
                        <Badge variant={d.projected ? "success" : "secondary"}>{d.projected ? "Closed" : "Pipeline"}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-secondary/50 p-2">
                          <p className="text-muted-foreground">Spend</p>
                          <p className="font-bold text-amber-500">{formatCurrency(d.spend, { compact: true })}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-2">
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-bold">{formatCurrency(d.commission, { compact: true })}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-2">
                          <p className="text-muted-foreground">Net</p>
                          <p className={cn("font-bold", d.net >= 0 ? "text-teal" : "text-destructive")}>{formatCurrency(d.net, { compact: true })}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Margin</span><span>{margin.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.max(margin, 0)} indicatorClassName={d.net >= 0 ? "bg-teal" : "bg-destructive"} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Cash flow */}
          <TabsContent value="cashflow" className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Cleared In</p>
                <p className="text-lg font-bold text-emerald-500">{formatCurrency(clearedIn, { compact: true })}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Pending In</p>
                <p className="text-lg font-bold text-amber-500">{formatCurrency(pendingIn, { compact: true })}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Pending Out</p>
                <p className="text-lg font-bold text-rose-500">{formatCurrency(pendingOut, { compact: true })}</p>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Cheque Ledger</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {CHEQUES.sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)).map((c) => {
                  const prop = c.propertyId ? propertyById(c.propertyId) : undefined;
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        c.direction === "incoming" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {c.direction === "incoming" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatDate(c.dueDate)}{prop ? ` · ${prop.code}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold", c.direction === "incoming" ? "text-emerald-500" : "text-rose-500")}>
                          {c.direction === "incoming" ? "+" : "−"}{formatCurrency(c.amount, { compact: true })}
                        </p>
                        <Badge variant={c.status === "cleared" ? "success" : c.status === "bounced" ? "destructive" : "warning"} className="mt-0.5">
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax */}
          <TabsContent value="tax" className="space-y-4">
            <Card className="border-teal/30 bg-teal/5">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Real-time projections of <b className="text-foreground">VAT (Ma&apos;am {Math.round(VAT_RATE * 100)}%)</b> and <b className="text-foreground">income tax</b> based on closed deals — for internal financial preparation only. Not an official filing.
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">VAT (Ma&apos;am)</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <LedgerRow label="Gross commission (excl. VAT)" value={formatCurrency(tax.grossCommission)} />
                  <LedgerRow label={`VAT collected (${Math.round(VAT_RATE * 100)}%)`} value={formatCurrency(tax.vatCollected)} />
                  <div className="border-t pt-3">
                    <LedgerRow label="VAT owed to authority" value={formatCurrency(tax.vatLiability)} accent="rose" bold />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Income Tax</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <LedgerRow label="Taxable income" value={formatCurrency(tax.grossCommission)} />
                  <LedgerRow label={`Estimated tax (${(tax.effectiveIncomeRate * 100).toFixed(1)}% eff.)`} value={formatCurrency(tax.incomeTax)} />
                  <div className="border-t pt-3">
                    <LedgerRow label="Projected take-home" value={formatCurrency(tax.takeHome)} accent="teal" bold />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LedgerRow({ label, value, accent, bold }: { label: string; value: string; accent?: "teal" | "rose"; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold && "font-bold", accent === "teal" && "text-teal", accent === "rose" && "text-rose-500", !accent && "font-medium")}>
        {value}
      </span>
    </div>
  );
}
