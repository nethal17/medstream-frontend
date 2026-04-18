import { ClipboardList, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getClinicSummary } from "@/services/payments";

export default function ClinicAdminFinancialsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const from_date = thirtyDaysAgo.toISOString();
        const to_date = today.toISOString();

        const summary = await getClinicSummary({ from_date, to_date });
        setData(summary);
      } catch (error) {
        toast.error("Failed to load clinic financial summary.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const fmt = (val) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(val);

  const summaryCards = [
    { title: "Total earnings", value: fmt(data.clinic_share_total), icon: Wallet, trend: "Past 30 Days" },
    { title: "Total bookings", value: String(data.total_bookings), icon: ClipboardList, trend: "Successful payments" },
  ];

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Financial Snapshot (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
