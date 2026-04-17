import { CircleDollarSign, CreditCard, Landmark, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statCards = [
  { title: "Consultation Revenue", value: "LKR 1,180,000", note: "This month", icon: CircleDollarSign },
  { title: "Telemedicine Earnings", value: "LKR 430,000", note: "37% of total", icon: CreditCard },
  { title: "Pending Payout", value: "LKR 145,000", note: "Next settlement in 3 days", icon: Landmark },
  { title: "Growth", value: "+9.4%", note: "Compared to last month", icon: TrendingUp },
];

const payoutHistory = [
  { period: "Week 1", appointments: 22, amount: "LKR 195,000", status: "Paid" },
  { period: "Week 2", appointments: 19, amount: "LKR 172,000", status: "Paid" },
  { period: "Week 3", appointments: 24, amount: "LKR 228,000", status: "Pending" },
  { period: "Week 4", appointments: 17, amount: "LKR 155,000", status: "Pending" },
];

export default function DoctorFinancialPage() {
  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Financial (Dummy)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{item.title}</p>
                <item.icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-600">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Payout Summary</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((item) => (
                <tr key={item.period} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.period}</td>
                  <td className="px-4 py-3 text-slate-700">{item.appointments}</td>
                  <td className="px-4 py-3 text-slate-700">{item.amount}</td>
                  <td className="px-4 py-3 text-slate-700">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
