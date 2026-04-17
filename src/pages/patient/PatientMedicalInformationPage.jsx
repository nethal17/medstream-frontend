import { ClipboardPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialRows = [
  { id: "mi-1", type: "Allergy", name: "Penicillin", note: "Mild rash" },
  { id: "mi-2", type: "Condition", name: "Hypertension", note: "Under control" },
];

const emptyForm = { type: "Allergy", name: "", note: "" };

export default function PatientMedicalInformationPage() {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");

  const isEdit = Boolean(editId);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const submitForm = (event) => {
    event.preventDefault();

    if (!form.name) {
      toast.error("Name is required.");
      return;
    }

    if (isEdit) {
      setRows((prev) => prev.map((item) => (item.id === editId ? { ...item, ...form } : item)));
      toast.success("Dummy update: record edited.");
      resetForm();
      return;
    }

    setRows((prev) => [{ id: `mi-${prev.length + 1}`, ...form }, ...prev]);
    toast.success("Dummy create: record added.");
    resetForm();
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({ type: item.type, name: item.name, note: item.note });
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((item) => item.id !== id));
    if (editId === id) {
      resetForm();
    }
    toast.success("Dummy delete: record removed.");
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <ClipboardPlus className="size-5 text-primary" />
          My Medical Information (CRUD)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]" onSubmit={submitForm}>
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="Allergy">Allergy</option>
            <option value="Condition">Condition</option>
            <option value="Medication">Medication</option>
            <option value="Surgery">Surgery</option>
          </select>
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            placeholder="Note"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
          <div className="flex gap-2">
            <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
            {isEdit ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 text-slate-700">{item.type}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.note || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button size="xs" variant="outline" type="button" onClick={() => startEdit(item)}>
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                      <Button size="xs" variant="destructive" type="button" onClick={() => removeRow(item.id)}>
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
