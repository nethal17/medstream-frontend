import { ClipboardPlus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import { getCurrentUserProfile } from "@/services/auth";
import {
  createPatientAllergy,
  createPatientChronicDisease,
  deletePatientAllergy,
  deletePatientChronicDisease,
  getPatientAllergies,
  getPatientChronicDiseases,
  getPatientProfileByUserId,
  updatePatientAllergy,
  updatePatientChronicDisease,
} from "@/services/patients";

const emptyAllergyForm = { allergy_name: "", note: "" };
const emptyDiseaseForm = { condition_name: "", note: "" };

export default function PatientMedicalInformationPage() {
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");

  const [allergies, setAllergies] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);

  const [allergyForm, setAllergyForm] = useState(emptyAllergyForm);
  const [allergyEditId, setAllergyEditId] = useState("");

  const [diseaseForm, setDiseaseForm] = useState(emptyDiseaseForm);
  const [diseaseEditId, setDiseaseEditId] = useState("");

  const isEditingAllergy = Boolean(allergyEditId);
  const isEditingDisease = Boolean(diseaseEditId);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const authUser = await getCurrentUserProfile();
        const userId = authUser?.user_id || authUser?.id;

        if (!userId) {
          throw new Error("Authenticated user id not found.");
        }

        const profile = await getPatientProfileByUserId(userId);
        const resolvedPatientId = profile?.patient_id;

        if (!resolvedPatientId) {
          throw new Error("Patient profile not found.");
        }

        const [allergyPayload, diseasePayload] = await Promise.all([
          getPatientAllergies(resolvedPatientId),
          getPatientChronicDiseases(resolvedPatientId),
        ]);

        if (ignore) {
          return;
        }

        setPatientId(resolvedPatientId);
        setAllergies(Array.isArray(allergyPayload) ? allergyPayload : []);
        setChronicDiseases(Array.isArray(diseasePayload) ? diseasePayload : []);
      } catch (error) {
        if (!ignore) {
          toast.error(extractApiErrorMessage(error, "Unable to load medical information."));
          setAllergies([]);
          setChronicDiseases([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const resetAllergyForm = () => {
    setAllergyForm(emptyAllergyForm);
    setAllergyEditId("");
  };

  const resetDiseaseForm = () => {
    setDiseaseForm(emptyDiseaseForm);
    setDiseaseEditId("");
  };

  const submitAllergy = async (event) => {
    event.preventDefault();

    if (!patientId) {
      toast.error("Patient profile not found.");
      return;
    }

    if (!allergyForm.allergy_name.trim()) {
      toast.error("Allergy name is required.");
      return;
    }

    setBusyKey(isEditingAllergy ? `update-allergy-${allergyEditId}` : "create-allergy");

    try {
      if (isEditingAllergy) {
        const updated = await updatePatientAllergy(patientId, allergyEditId, {
          allergy_name: allergyForm.allergy_name.trim(),
          note: allergyForm.note.trim() || null,
        });

        setAllergies((prev) =>
          prev.map((item) => (item.allergy_id === allergyEditId ? updated : item))
        );
        toast.success("Allergy updated.");
        resetAllergyForm();
        return;
      }

      const created = await createPatientAllergy(patientId, {
        allergy_name: allergyForm.allergy_name.trim(),
        note: allergyForm.note.trim() || null,
      });

      setAllergies((prev) => [created, ...prev]);
      toast.success("Allergy added.");
      resetAllergyForm();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to save allergy."));
    } finally {
      setBusyKey("");
    }
  };

  const submitDisease = async (event) => {
    event.preventDefault();

    if (!patientId) {
      toast.error("Patient profile not found.");
      return;
    }

    if (!diseaseForm.condition_name.trim()) {
      toast.error("Condition name is required.");
      return;
    }

    setBusyKey(isEditingDisease ? `update-disease-${diseaseEditId}` : "create-disease");

    try {
      if (isEditingDisease) {
        const updated = await updatePatientChronicDisease(patientId, diseaseEditId, {
          condition_name: diseaseForm.condition_name.trim(),
          note: diseaseForm.note.trim() || null,
        });

        setChronicDiseases((prev) =>
          prev.map((item) => (item.condition_id === diseaseEditId ? updated : item))
        );
        toast.success("Chronic disease updated.");
        resetDiseaseForm();
        return;
      }

      const created = await createPatientChronicDisease(patientId, {
        condition_name: diseaseForm.condition_name.trim(),
        note: diseaseForm.note.trim() || null,
      });

      setChronicDiseases((prev) => [created, ...prev]);
      toast.success("Chronic disease added.");
      resetDiseaseForm();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to save chronic disease."));
    } finally {
      setBusyKey("");
    }
  };

  const startAllergyEdit = (item) => {
    setAllergyEditId(item.allergy_id);
    setAllergyForm({ allergy_name: item.allergy_name || "", note: item.note || "" });
  };

  const startDiseaseEdit = (item) => {
    setDiseaseEditId(item.condition_id);
    setDiseaseForm({ condition_name: item.condition_name || "", note: item.note || "" });
  };

  const removeAllergy = async (allergyId) => {
    if (!patientId) {
      return;
    }

    setBusyKey(`delete-allergy-${allergyId}`);
    try {
      await deletePatientAllergy(patientId, allergyId);
      setAllergies((prev) => prev.filter((item) => item.allergy_id !== allergyId));
      if (allergyEditId === allergyId) {
        resetAllergyForm();
      }
      toast.success("Allergy deleted.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to delete allergy."));
    } finally {
      setBusyKey("");
    }
  };

  const removeDisease = async (conditionId) => {
    if (!patientId) {
      return;
    }

    setBusyKey(`delete-disease-${conditionId}`);
    try {
      await deletePatientChronicDisease(patientId, conditionId);
      setChronicDiseases((prev) => prev.filter((item) => item.condition_id !== conditionId));
      if (diseaseEditId === conditionId) {
        resetDiseaseForm();
      }
      toast.success("Chronic disease deleted.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to delete chronic disease."));
    } finally {
      setBusyKey("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <ClipboardPlus className="size-5 text-primary" />
            My Medical Information
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Allergies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={submitAllergy}>
              <Input
                placeholder="Allergy name"
                value={allergyForm.allergy_name}
                onChange={(event) =>
                  setAllergyForm((prev) => ({ ...prev, allergy_name: event.target.value }))
                }
              />
              <Input
                placeholder="Note"
                value={allergyForm.note}
                onChange={(event) => setAllergyForm((prev) => ({ ...prev, note: event.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={Boolean(busyKey)}>
                  {isEditingAllergy ? "Update" : "Add"}
                </Button>
                {isEditingAllergy ? (
                  <Button type="button" variant="outline" onClick={resetAllergyForm} disabled={Boolean(busyKey)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Allergy</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allergies.map((item) => (
                    <tr key={item.allergy_id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.allergy_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.note || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="xs" variant="outline" type="button" onClick={() => startAllergyEdit(item)}>
                            <Pencil className="size-3" />
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            type="button"
                            onClick={() => removeAllergy(item.allergy_id)}
                            disabled={busyKey === `delete-allergy-${item.allergy_id}`}
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allergies.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No allergies found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Chronic Diseases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={submitDisease}>
              <Input
                placeholder="Condition name"
                value={diseaseForm.condition_name}
                onChange={(event) =>
                  setDiseaseForm((prev) => ({ ...prev, condition_name: event.target.value }))
                }
              />
              <Input
                placeholder="Note"
                value={diseaseForm.note}
                onChange={(event) => setDiseaseForm((prev) => ({ ...prev, note: event.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={Boolean(busyKey)}>
                  {isEditingDisease ? "Update" : "Add"}
                </Button>
                {isEditingDisease ? (
                  <Button type="button" variant="outline" onClick={resetDiseaseForm} disabled={Boolean(busyKey)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chronicDiseases.map((item) => (
                    <tr key={item.condition_id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.condition_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.note || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="xs" variant="outline" type="button" onClick={() => startDiseaseEdit(item)}>
                            <Pencil className="size-3" />
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            type="button"
                            onClick={() => removeDisease(item.condition_id)}
                            disabled={busyKey === `delete-disease-${item.condition_id}`}
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {chronicDiseases.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No chronic diseases found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
