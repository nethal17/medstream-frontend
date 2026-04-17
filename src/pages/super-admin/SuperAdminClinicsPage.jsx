import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const dummyClinics = [
  { id: "CLN-001", name: "City Health Center", city: "Colombo", contact: "+94 11 456 9800", status: "Active" },
  { id: "CLN-002", name: "Lakeside Medical", city: "Kandy", contact: "+94 81 220 1450", status: "Active" },
  { id: "CLN-003", name: "Southern Family Clinic", city: "Galle", contact: "+94 91 445 0032", status: "Inactive" },
];

const emptyForm = {
  id: "",
  name: "",
  city: "",
  contact: "",
  status: "Active",
};

export default function SuperAdminClinicsPage() {
  const [clinics, setClinics] = useState(dummyClinics);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const sortedClinics = useMemo(() => [...clinics].sort((a, b) => a.id.localeCompare(b.id)), [clinics]);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (clinic) => {
    setEditingId(clinic.id);
    setForm(clinic);
  };

  const handleDelete = (id) => {
    setClinics((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.id.trim() || !form.name.trim() || !form.city.trim() || !form.contact.trim()) {
      return;
    }

    if (editingId) {
      setClinics((prev) => prev.map((item) => (item.id === editingId ? { ...form } : item)));
      handleCancelEdit();
      return;
    }

    const existing = clinics.some((item) => item.id === form.id.trim());
    if (existing) {
      return;
    }

    setClinics((prev) => [...prev, { ...form, id: form.id.trim() }]);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Clinics Management (Dummy CRUD)</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
            <Input placeholder="Clinic ID" value={form.id} onChange={(event) => handleInputChange("id", event.target.value)} disabled={Boolean(editingId)} />
            <Input placeholder="Clinic Name" value={form.name} onChange={(event) => handleInputChange("name", event.target.value)} />
            <Input placeholder="City" value={form.city} onChange={(event) => handleInputChange("city", event.target.value)} />
            <Input placeholder="Contact" value={form.contact} onChange={(event) => handleInputChange("contact", event.target.value)} />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.status}
              onChange={(event) => handleInputChange("status", event.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="md:col-span-5 flex flex-wrap gap-2">
              <Button type="submit">
                <Plus className="size-4" />
                {editingId ? "Update Clinic" : "Add Clinic"}
              </Button>
              {editingId ? (
                <Button variant="outline" type="button" onClick={handleCancelEdit}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Clinic Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Clinic ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClinics.map((clinic) => (
                  <tr key={clinic.id} className="border-t">
                    <td className="px-4 py-3 text-slate-700">{clinic.id}</td>
                    <td className="px-4 py-3 text-slate-700">{clinic.name}</td>
                    <td className="px-4 py-3 text-slate-700">{clinic.city}</td>
                    <td className="px-4 py-3 text-slate-700">{clinic.contact}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${clinic.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(clinic)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(clinic.id)}>
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedClinics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No clinic records.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
