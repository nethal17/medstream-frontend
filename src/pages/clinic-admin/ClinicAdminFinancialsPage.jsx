import { CreditCard, DollarSign, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const summaryCards = [
  { title: "Monthly Revenue", value: "LKR 3,420,000", icon: DollarSign, trend: "+8.2% vs last month" },
  { title: "Outstanding Invoices", value: "LKR 410,000", icon: Wallet, trend: "12 invoices pending" },
  { title: "Insurance Claims", value: "LKR 1,210,000", icon: CreditCard, trend: "84% approved" },
  { title: "Operating Margin", value: "21.6%", icon: TrendingUp, trend: "Stable performance" },
];

const monthlyBreakdown = [
  { month: "Jan", revenue: "LKR 2,950,000", expense: "LKR 2,180,000", profit: "LKR 770,000" },
  { month: "Feb", revenue: "LKR 3,100,000", expense: "LKR 2,270,000", profit: "LKR 830,000" },
  { month: "Mar", revenue: "LKR 3,420,000", expense: "LKR 2,680,000", profit: "LKR 740,000" },
];

export default function ClinicAdminFinancialsPage() {
  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Financials (Dummy Data)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{item.title}</p>
                <item.icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-600">{item.trend}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quarterly Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Expenses</th>
                <th className="px-4 py-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((row) => (
                <tr key={row.month} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">{row.month}</td>
                  <td className="px-4 py-3 text-slate-700">{row.revenue}</td>
                  <td className="px-4 py-3 text-slate-700">{row.expense}</td>
                  <td className="px-4 py-3 text-emerald-700">{row.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
