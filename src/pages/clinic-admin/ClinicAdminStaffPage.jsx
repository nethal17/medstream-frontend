import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const seedStaff = [
  { id: "S-101", name: "Nadeesha Perera", role: "Receptionist", email: "nadeesha@medstream.lk" },
  { id: "S-102", name: "Kavindu Silva", role: "Nurse", email: "kavindu@medstream.lk" },
  { id: "S-103", name: "Malsha Fernando", role: "Billing Officer", email: "malsha@medstream.lk" },
];

const emptyForm = { name: "", role: "", email: "" };

export default function ClinicAdminStaffPage() {
  const [staff, setStaff] = useState(seedStaff);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");

  const isEdit = Boolean(editId);
  const nextId = useMemo(() => `S-${100 + staff.length + 1}`, [staff.length]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.role || !form.email) {
      toast.error("Fill all staff fields.");
      return;
    }

    if (isEdit) {
      setStaff((prev) => prev.map((item) => (item.id === editId ? { ...item, ...form } : item)));
      toast.success("Dummy update: staff member edited.");
      resetForm();
      return;
    }

    setStaff((prev) => [{ id: nextId, ...form }, ...prev]);
    toast.success("Dummy create: new staff member added.");
    resetForm();
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, role: item.role, email: item.email });
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    setStaff((prev) => prev.filter((item) => item.id !== id));
    if (editId === id) {
      resetForm();
    }
    toast.success("Dummy delete: staff member removed.");
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <UserPlus className="size-5 text-primary" />
          Staff Management (Dummy CRUD)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input
            placeholder="Staff Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            placeholder="Role"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.id}</td>
                  <td className="px-4 py-3 text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-slate-700">{item.role}</td>
                  <td className="px-4 py-3 text-slate-600">{item.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="xs" variant="outline" onClick={() => handleEdit(item)}>
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No staff records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
