import { Pill } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const prescriptions = [
  {
    id: "rx-1",
    doctor: "Dr. Nethmi Rodrigo",
    issuedOn: "2026-04-11",
    medicine: "Metformin 500mg",
    dosage: "1-0-1",
    duration: "30 days",
  },
  {
    id: "rx-2",
    doctor: "Dr. Kavishka Perera",
    issuedOn: "2026-03-19",
    medicine: "Vitamin D3",
    dosage: "0-0-1",
    duration: "60 days",
  },
];

export default function PatientPrescriptionsPage() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <Pill className="size-5 text-primary" />
          My Prescriptions (View Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Issued On</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Dosage</th>
              <th className="px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 text-slate-600">{item.issuedOn}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.doctor}</td>
                <td className="px-4 py-3 text-slate-700">{item.medicine}</td>
                <td className="px-4 py-3 text-slate-700">{item.dosage}</td>
                <td className="px-4 py-3 text-slate-700">{item.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
