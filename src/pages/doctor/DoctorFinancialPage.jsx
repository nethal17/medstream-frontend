import { CircleDollarSign, CreditCard, Landmark, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDoctorEarnings } from "@/services/payments";
import { formatCurrencyLkr, extractApiErrorMessage } from "@/lib/appointment-utils";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

export default function DoctorFinancialPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const payload = await getDoctorEarnings();
        setData(payload);
      } catch (err) {
        toast.error(extractApiErrorMessage(err, "Failed to load financial data"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const stats = [
    { 
      title: "Total Earned", 
      value: formatCurrencyLkr(data?.total_earned || 0), 
      note: "Settled payments", 
      icon: CircleDollarSign,
      color: "emerald" 
    },
    { 
      title: "Pending Payout", 
      value: formatCurrencyLkr(data?.total_pending || 0), 
      note: "Awaiting settlement", 
      icon: Landmark,
      color: "amber" 
    },
    { 
      title: "Refunded/Reversed", 
      value: formatCurrencyLkr(data?.total_reversed || 0), 
      note: "Returned to patients", 
      icon: CreditCard,
      color: "rose" 
    },
    { 
      title: "Transactions", 
      value: data?.splits?.length || 0, 
      note: "Total volume", 
      icon: TrendingUp,
      color: "blue" 
    },
  ];

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.title}</p>
                <div className={`rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary`}>
                  <item.icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Earnings History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm border-separate border-spacing-0">
            <thead className="bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 border-b border-slate-100">Date</th>
                <th className="px-5 py-4 border-b border-slate-100">Amount</th>
                <th className="px-5 py-4 border-b border-slate-100">Status</th>
                <th className="px-5 py-4 border-b border-slate-100">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data?.splits?.map((split, i) => (
                <tr key={split.split_id} className={`transition-colors hover:bg-slate-50/50 ${i !== data.splits.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {new Date(split.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {formatCurrencyLkr(split.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      split.status === 'settled' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                      split.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                      'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                    }`}>
                      {split.status.charAt(0).toUpperCase() + split.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {Number(split.percentage).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {(!data?.splits || data.splits.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-slate-500 italic">
                    No earning transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
