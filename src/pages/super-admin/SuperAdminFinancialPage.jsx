import { CircleDollarSign, Landmark, TrendingUp, Users, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformSummary } from "@/services/payments";
import { formatCurrencyLkr, extractApiErrorMessage } from "@/lib/appointment-utils";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

export default function SuperAdminFinancialPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const payload = await getPlatformSummary();
        setData(payload);
      } catch (err) {
        toast.error(extractApiErrorMessage(err, "Failed to load platform data"));
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
      title: "Total earnings", 
      value: formatCurrencyLkr(data?.platform_earnings || 0), 
      note: "10% Platform Fee", 
      icon: CircleDollarSign,
      color: "emerald" 
    },
    { 
      title: "Total bookings", 
      value: data?.total_payments || 0, 
      note: "Successful payments", 
      icon: Activity,
      color: "blue" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title} className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.title}</p>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <item.icon className="size-4" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Platform Financial Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 font-medium text-center">Settled Earnings</p>
                <p className="text-xl font-bold text-emerald-600 text-center">{formatCurrencyLkr(data?.total_settled || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 font-medium text-center">Pending Earnings</p>
                <p className="text-xl font-bold text-amber-600 text-center">{formatCurrencyLkr(data?.total_processing || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 font-medium text-center">Failed Fee volume</p>
                <p className="text-xl font-bold text-rose-600 text-center">{formatCurrencyLkr(data?.total_failed || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
