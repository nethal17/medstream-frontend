import { FileText, Plus, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialReports = [
  { id: "rep-1", name: "Blood Test Report", date: "2026-04-10", category: "Lab", notes: "Quarterly check" },
  { id: "rep-2", name: "Chest X-ray", date: "2026-03-22", category: "Radiology", notes: "Routine" },
];

const emptyForm = { name: "", date: "", category: "", notes: "" };

export default function PatientReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [form, setForm] = useState(emptyForm);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addReport = (event) => {
    event.preventDefault();

    if (!form.name || !form.date) {
      toast.error("Report name and date are required.");
      return;
    }

    setReports((prev) => [
      {
        id: `rep-${prev.length + 1}`,
        ...form,
      },
      ...prev,
    ]);

    setForm(emptyForm);
    toast.success("Dummy add: report uploaded.");
  };

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Upload className="size-5 text-primary" />
            My Reports - Add
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_160px_160px_1fr_auto]" onSubmit={addReport}>
            <Input
              placeholder="Report Name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
            <Input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
            <Input
              placeholder="Category"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            />
            <Input
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
            <Button type="submit">
              <Plus className="size-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <FileText className="size-5 text-primary" />
            My Reports - View
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.date}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{item.notes || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="xs" variant="outline" onClick={() => toast.success("Dummy view: opening report.")}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
