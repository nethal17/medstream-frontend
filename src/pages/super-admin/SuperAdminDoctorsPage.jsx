import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const dummyDoctors = [
  { id: "DOC-001", name: "Dr. Ayesha Perera", specialty: "Cardiology", clinic: "City Heart Clinic", status: "Active" },
  { id: "DOC-002", name: "Dr. Nimal Fernando", specialty: "Neurology", clinic: "Central Neuro Care", status: "Active" },
  { id: "DOC-003", name: "Dr. Kavindi Silva", specialty: "Dermatology", clinic: "SkinPoint Center", status: "Inactive" },
];

const emptyForm = {
  id: "",
  name: "",
  specialty: "",
  clinic: "",
  status: "Active",
};

export default function SuperAdminDoctorsPage() {
  const [doctors, setDoctors] = useState(dummyDoctors);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const sortedDoctors = useMemo(() => [...doctors].sort((a, b) => a.id.localeCompare(b.id)), [doctors]);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm(doctor);
  };

  const handleDelete = (id) => {
    setDoctors((prev) => prev.filter((item) => item.id !== id));
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

    if (!form.id.trim() || !form.name.trim() || !form.specialty.trim() || !form.clinic.trim()) {
      return;
    }

    if (editingId) {
      setDoctors((prev) => prev.map((item) => (item.id === editingId ? { ...form } : item)));
      handleCancelEdit();
      return;
    }

    const existing = doctors.some((item) => item.id === form.id.trim());
    if (existing) {
      return;
    }

    setDoctors((prev) => [...prev, { ...form, id: form.id.trim() }]);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Doctors Management (Dummy CRUD)</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
            <Input placeholder="Doctor ID" value={form.id} onChange={(event) => handleInputChange("id", event.target.value)} disabled={Boolean(editingId)} />
            <Input placeholder="Doctor Name" value={form.name} onChange={(event) => handleInputChange("name", event.target.value)} />
            <Input placeholder="Specialty" value={form.specialty} onChange={(event) => handleInputChange("specialty", event.target.value)} />
            <Input placeholder="Clinic" value={form.clinic} onChange={(event) => handleInputChange("clinic", event.target.value)} />
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
                {editingId ? "Update Doctor" : "Add Doctor"}
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
          <CardTitle className="text-xl">Doctor Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Doctor ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDoctors.map((doctor) => (
                  <tr key={doctor.id} className="border-t">
                    <td className="px-4 py-3 text-slate-700">{doctor.id}</td>
                    <td className="px-4 py-3 text-slate-700">{doctor.name}</td>
                    <td className="px-4 py-3 text-slate-700">{doctor.specialty}</td>
                    <td className="px-4 py-3 text-slate-700">{doctor.clinic}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${doctor.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(doctor.id)}>
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No doctor records.
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
