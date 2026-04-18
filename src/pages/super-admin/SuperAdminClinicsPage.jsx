import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import { createClinic, deleteClinic, listClinics, updateClinic, updateClinicStatus } from "@/services/clinics";

const emptyForm = {
  clinic_name: "",
  registration_no: "",
  address: "",
  phone: "",
  email: "",
  facility_charge: "",
  status: "active",
};

export default function SuperAdminClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClinicId, setEditingClinicId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sortedClinics = useMemo(
    () =>
      [...clinics]
        .filter((clinic) => clinic.status?.toLowerCase() !== "removed")
        .sort((a, b) => String(a.clinic_id || "").localeCompare(String(b.clinic_id || ""))),
    [clinics]
  );

  const fetchClinics = useCallback(async () => {
    setIsLoading(true);

    try {
      const payload = await listClinics();
      setClinics(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load clinics."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingClinicId(null);
    setForm(emptyForm);
  };

  const handleEdit = (clinic) => {
    setEditingClinicId(clinic.clinic_id);
    setForm({
      clinic_name: clinic.clinic_name || "",
      registration_no: clinic.registration_no || "",
      address: clinic.address || "",
      phone: clinic.phone || "",
      email: clinic.email || "",
      facility_charge: clinic.facility_charge || "0",
      status: clinic.status?.toLowerCase() || "active",
    });
  };

  const handleDelete = async (clinicId) => {
    if (!clinicId) {
      return;
    }

    try {
      await deleteClinic(clinicId);
      setClinics((prev) => prev.filter((item) => item.clinic_id !== clinicId));
      if (editingClinicId === clinicId) {
        resetForm();
      }
      toast.success("Clinic deleted.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to delete clinic."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.clinic_name.trim() || !form.registration_no.trim() || !form.address.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Please complete all clinic fields.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingClinicId) {
        let updated;

        try {
          updated = await updateClinic(editingClinicId, {
            clinic_name: form.clinic_name.trim(),
            registration_no: form.registration_no.trim(),
            address: form.address.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            facility_charge: Number(form.facility_charge) || 0,
            status: form.status,
          });
        } catch (error) {
          if (error?.response?.status === 404 || error?.response?.status === 405) {
            updated = await updateClinicStatus(editingClinicId, {
              status: form.status,
              reason: "Updated from Super Admin UI",
            });
          } else {
            throw error;
          }
        }

        setClinics((prev) =>
          prev.map((item) => (item.clinic_id === editingClinicId ? { ...item, ...updated } : item))
        );
        toast.success("Clinic updated.");
      } else {
        const created = await createClinic({
          clinic_name: form.clinic_name.trim(),
          registration_no: form.registration_no.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          facility_charge: Number(form.facility_charge) || 0,
        });

        setClinics((prev) => [...prev, created]);
        toast.success("Clinic created.");
      }

      resetForm();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to save clinic."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Clinics Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr]" onSubmit={handleSubmit}>
            <Input
              placeholder="Clinic name"
              value={form.clinic_name}
              onChange={(event) => handleInputChange("clinic_name", event.target.value)}
            />
            <Input
              placeholder="Registration number"
              value={form.registration_no}
              onChange={(event) => handleInputChange("registration_no", event.target.value)}
            />
            <Input
              placeholder="Address"
              value={form.address}
              onChange={(event) => handleInputChange("address", event.target.value)}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => handleInputChange("phone", event.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => handleInputChange("email", event.target.value)}
            />
            <Input
              placeholder="Facility Charge (LKR)"
              type="number"
              value={form.facility_charge}
              onChange={(event) => handleInputChange("facility_charge", event.target.value)}
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.status}
              onChange={(event) => handleInputChange("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex flex-wrap gap-2 lg:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <Plus className="size-4" />
                {editingClinicId ? "Update Clinic" : "Create Clinic"}
              </Button>
              {editingClinicId ? (
                <Button variant="outline" type="button" onClick={resetForm} disabled={isSaving}>
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
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Clinic ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Fee (LKR)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading clinics...
                    </td>
                  </tr>
                ) : sortedClinics.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No clinic records.
                    </td>
                  </tr>
                ) : (
                  sortedClinics.map((clinic) => (
                    <tr key={clinic.clinic_id} className="border-t">
                      <td className="px-4 py-3 text-slate-700">{clinic.clinic_id}</td>
                      <td className="px-4 py-3 text-slate-700">{clinic.clinic_name}</td>
                      <td className="px-4 py-3 text-slate-700">{clinic.registration_no}</td>
                      <td className="px-4 py-3 text-slate-700">{clinic.address}</td>
                      <td className="px-4 py-3 text-slate-700">{clinic.phone}</td>
                      <td className="px-4 py-3 text-slate-700">{clinic.email}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {clinic.facility_charge ? Number(clinic.facility_charge).toLocaleString() : "0"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            clinic.status?.toLowerCase() === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {clinic.status?.charAt(0).toUpperCase() + clinic.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(clinic)}>
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(clinic.clinic_id)}>
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
