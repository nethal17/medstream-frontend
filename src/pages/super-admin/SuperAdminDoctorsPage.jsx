import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import {
  createDoctor,
  deleteDoctor,
  listAllDoctors,
  updateDoctor,
} from "@/services/doctors";

const SPECIALIZATIONS = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Rheumatology",
  "Urology",
];

const emptyForm = {
  full_name: "",
  email: "",
  specialization: "General Practice",
  consultation_fee: "",
  status: "active",
};

export default function SuperAdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedDoctors = useMemo(() => [...doctors].sort((a, b) => a.full_name.localeCompare(b.full_name)), [doctors]);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listAllDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to load doctors"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDoctors();
  }, [loadDoctors]);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.doctor_id);
    setForm({
      full_name: doctor.full_name || "",
      email: "", // We don't update email here
      specialization: doctor.specialization || "General Practice",
      consultation_fee: doctor.consultation_fee || "",
      status: doctor.status || "active",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }
    try {
      await deleteDoctor(id);
      toast.success("Doctor deleted successfully");
      await loadDoctors();
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to delete doctor"));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.full_name.trim() || !form.specialization || (!editingId && !form.email.trim())) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        specialization: form.specialization,
        status: form.status,
      };

      if (!editingId) {
        payload.email = form.email.trim();
      }
      
      const fee = parseFloat(form.consultation_fee);
      if (!isNaN(fee)) {
        payload.consultation_fee = fee;
      }

      if (editingId) {
        await updateDoctor(editingId, payload);
        toast.success("Doctor updated successfully");
      } else {
        await createDoctor(payload);
        toast.success("Doctor created successfully");
      }
      
      setForm(emptyForm);
      setEditingId(null);
      await loadDoctors();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to save doctor"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Doctors Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
            <Input placeholder="Full Name *" required value={form.full_name} onChange={(event) => handleInputChange("full_name", event.target.value)} />
            <Input type="email" placeholder="Email *" required={!editingId} disabled={!!editingId} value={form.email} onChange={(event) => handleInputChange("email", event.target.value)} />
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.specialization}
              onChange={(event) => handleInputChange("specialization", event.target.value)}
              required
            >
              <option value="" disabled>Select Specialization *</option>
              {SPECIALIZATIONS.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <Input type="number" placeholder="Consultation Fee" value={form.consultation_fee} onChange={(event) => handleInputChange("consultation_fee", event.target.value)} />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.status}
              onChange={(event) => handleInputChange("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="suspended">Suspended</option>
            </select>

            <div className="md:col-span-5 flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2 size-4" />}
                <Plus className="size-4" />
                {editingId ? "Update Doctor" : "Add Doctor"}
              </Button>
              {editingId ? (
                <Button variant="outline" type="button" onClick={handleCancelEdit} disabled={isSubmitting}>
                  Cancel Edit
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
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Consultation Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDoctors.map((doctor) => (
                    <tr key={doctor.doctor_id} className="border-t">
                      <td className="px-4 py-3 text-slate-700 max-w-[120px] truncate" title={doctor.doctor_id}>
                        {doctor.doctor_id}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{doctor.full_name}</td>
                      <td className="px-4 py-3 text-slate-700">{doctor.specialization || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {doctor.consultation_fee != null ? `Rs. ${doctor.consultation_fee}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${doctor.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(doctor.doctor_id)}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
