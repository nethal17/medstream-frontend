import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getAccessToken } from "@/services/api";
import { decodeJwtPayload, getClinicIdFromToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import {
  createClinicStaff,
  deleteClinicStaff,
  getUserClinic,
  listClinicStaff,
  updateClinicStaff,
} from "@/services/clinicStaff";

const emptyForm = { name: "", role: "", email: "", phone: "" };

export default function ClinicAdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(editId);

  useEffect(() => {
    const accessToken = getAccessToken();
    const tokenClinicId = getClinicIdFromToken(accessToken) || decodeJwtPayload(accessToken)?.clinic_id || decodeJwtPayload(accessToken)?.clinicId;
    if (tokenClinicId) {
      setClinicId(tokenClinicId);
      return;
    }

    if (!accessToken) {
      setClinicId("");
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const result = await getUserClinic();
        setClinicId(result?.clinic_id || "");
      } catch (error) {
        toast.error(extractApiErrorMessage(error, "Unable to resolve clinic assignment."));
        setClinicId("");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchClinicStaff = useCallback(async () => {
    if (!clinicId) {
      setStaff([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await listClinicStaff(clinicId);
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load clinic staff."));
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchClinicStaff();
  }, [clinicId, fetchClinicStaff]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email) {
      toast.error("Fill all staff fields.");
      return;
    }

    if (!clinicId) {
      toast.error("Unable to determine clinic assignment.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        const updatedStaff = await updateClinicStaff(clinicId, editId, {
          name: form.name,
          phone: form.phone || undefined,
        });

        setStaff((prev) => prev.map((item) => (item.staff_id === editId ? updatedStaff : item)));
        toast.success("Clinic staff updated successfully.");
      } else {
        const created = await createClinicStaff(clinicId, {
          email: form.email,
          name: form.name,
          role: "clinic_staff",
          phone: form.phone || undefined,
        });

        setStaff((prev) => [created.staff, ...prev]);
        toast.success(`Clinic staff account created. Temporary password: ${created.temporary_password}`);
      }

      resetForm();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to save clinic staff."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.staff_name || "",
      role: item.staff_role || "",
      email: item.staff_email || "",
      phone: item.staff_phone || "",
    });
    setEditId(item.staff_id);
  };

  const handleDelete = async (staffId) => {
    if (!clinicId) {
      toast.error("Unable to determine clinic assignment.");
      return;
    }

    try {
      await deleteClinicStaff(clinicId, staffId);
      setStaff((prev) => prev.filter((item) => item.staff_id !== staffId));
      if (editId === staffId) {
        resetForm();
      }
      toast.success("Clinic staff removed successfully.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to remove clinic staff."));
    }
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <UserPlus className="size-5 text-primary" />
          Clinic Staff Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <Input
            placeholder="Staff Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />

          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            disabled={isEdit}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isEdit ? (isSaving ? "Updating..." : "Update") : isSaving ? "Creating..." : "Create"}
            </Button>
            {isEdit ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((item) => (
                  <tr key={item.staff_id} className="border-t">
                    <td className="px-4 py-3 text-slate-700">{item.staff_name}</td>
                    <td className="px-4 py-3 text-slate-700">{item.staff_role}</td>
                    <td className="px-4 py-3 text-slate-600">{item.staff_email}</td>
                    <td className="px-4 py-3 text-slate-600">{item.staff_phone || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="xs" variant="outline" onClick={() => handleEdit(item)}>
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(item.staff_id)}
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
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No staff records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
