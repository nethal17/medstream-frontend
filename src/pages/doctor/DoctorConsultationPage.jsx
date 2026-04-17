import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  MoreVertical,
  Pill,
  Plus,
  Printer,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDisplayDate, formatTimeLabel } from "@/lib/appointment-utils";

const medicalDocuments = [
  { name: "Blood Report_Q1.pdf", date: "2024-03-15", source: "Laboratory" },
  { name: "Chest_Xray_Digital.jpg", date: "2024-02-10", source: "Radiology" },
  { name: "Previous_Prescription.pdf", date: "2023-12-10", source: "Historical" },
];

const checklistItems = [
  "Verify insurance status",
  "Check lab integrations",
  "Review chronic history",
];

function buildPatientProfile(name) {
  return {
    fullName: name || "Johnathan Doe",
    age: 42,
    gender: "M",
    mrn: "#P-882910",
    bloodGroup: "O Positive (O+)",
    latestVitals: "120/80 mmHg",
    allergies: ["Penicillin", "Peanuts", "Latex"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension", "Seasonal Asthma"],
  };
}

export default function DoctorConsultationPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { state } = useLocation();

  const appointment = state?.appointment || {};
  const patient = useMemo(() => buildPatientProfile(appointment?.patient_name), [appointment?.patient_name]);

  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [advice, setAdvice] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [medicineRows, setMedicineRows] = useState([
    {
      id: "med-1",
      name: "Amoxicillin 500mg",
      dosage: "1 capsule",
      frequency: "1-0-1",
      duration: "7 days",
      instruction: "After meals",
    },
  ]);

  const handleAddMedicine = () => {
    setMedicineRows((prev) => [
      ...prev,
      {
        id: `med-${prev.length + 1}`,
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instruction: "",
      },
    ]);
  };

  const handleUpdateMedicine = (id, key, value) => {
    setMedicineRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const handleDeleteMedicine = (id) => {
    setMedicineRows((prev) => prev.filter((row) => row.id !== id));
  };

  const onSaveNotes = () => toast.success("Dummy save: consultation notes saved.");
  const onScheduleFollowUp = () => toast.success("Dummy save: follow-up scheduled.");
  const onIssuePrescription = () => toast.success("Dummy: prescription issued.");
  const onMarkCompleted = () => toast.success("Dummy: appointment marked completed.");

  return (
    <div className="min-w-0 space-y-4">
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <button
                type="button"
                onClick={() => navigate("/doctor/dashboard/overview")}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="size-3" />
                Back to Appointments
              </button>
              <h2 className="text-xl font-semibold text-slate-900">{patient.fullName}</h2>
              <p className="text-xs text-slate-500">
                {patient.age} Yrs / {patient.gender} | MRN: {patient.mrn}
              </p>
            </div>

            <div className="max-w-full rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-600">
              <p className="font-semibold uppercase tracking-wide text-slate-500">Appointment Details</p>
              <p className="mt-1">ID: #{appointmentId || appointment?.appointment_id || "AP-2024-0012"}</p>
              <p>
                {appointment?.consultation_type || "Telemedicine"} | {formatDisplayDate(appointment?.date)}{" "}
                {formatTimeLabel(appointment?.start_time)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Marked as arrived.")}>
                Mark Arrived
              </Button>
              <Button size="sm" onClick={() => toast.success("Consultation started.")}>
                Start Consultation
              </Button>
              <Button size="icon" variant="ghost">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Medical Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Blood Group</p>
                  <p className="font-medium text-slate-800">{patient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Latest Vitals</p>
                  <p className="font-medium text-slate-800">{patient.latestVitals}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Allergies</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {patient.allergies.map((item) => (
                    <span key={item} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Chronic Conditions</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
                  {patient.chronicConditions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <button type="button" className="text-xs font-semibold text-primary hover:underline">
                View Full Medical Record
              </button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Medical Documents</CardTitle>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                {medicalDocuments.length}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {medicalDocuments.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded border border-slate-200 p-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-700">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">{doc.date} | {doc.source}</p>
                  </div>
                  <Button size="xs" variant="outline">
                    View
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="size-4" />
                Upload New Document
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Consultation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Diagnosis</label>
                <Input
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  placeholder="Search or enter clinical diagnosis"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Symptoms and Clinical Signs
                </label>
                <Input
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="Type and press Enter to add symptoms"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Advice and Lifestyle Management
                </label>
                <Input
                  value={advice}
                  onChange={(event) => setAdvice(event.target.value)}
                  placeholder="Enter patient advice"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Doctor's Clinical Notes
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Record detailed observations, physical examination results, and case discussions"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-slate-600">
                <Pill className="size-4" />
                Prescription
              </CardTitle>
              <Button size="xs" onClick={handleAddMedicine}>
                <Plus className="size-3" />
                Add Medicine
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="border-y border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Medicine Name</th>
                    <th className="px-2 py-2">Dosage</th>
                    <th className="px-2 py-2">Frequency</th>
                    <th className="px-2 py-2">Duration</th>
                    <th className="px-2 py-2">Instruction</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicineRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200">
                      <td className="px-2 py-2">
                        <Input
                          value={row.name}
                          onChange={(event) => handleUpdateMedicine(row.id, "name", event.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.dosage}
                          onChange={(event) => handleUpdateMedicine(row.id, "dosage", event.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.frequency}
                          onChange={(event) => handleUpdateMedicine(row.id, "frequency", event.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.duration}
                          onChange={(event) => handleUpdateMedicine(row.id, "duration", event.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.instruction}
                          onChange={(event) => handleUpdateMedicine(row.id, "instruction", event.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteMedicine(row.id)}>
                          <FileText className="size-3 text-rose-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Pharmacist Instructions
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                  placeholder="Special instructions for pharmacy regarding alternatives or packaging"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 xl:col-span-2 2xl:col-span-1">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Follow-Up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Suggested Date</label>
                  <Input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Notes for Follow-Up
                  </label>
                  <textarea
                    rows={3}
                    value={followUpNotes}
                    onChange={(event) => setFollowUpNotes(event.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                    placeholder="Review lab results"
                  />
                </div>
                <Button className="w-full" onClick={onScheduleFollowUp}>
                  Schedule Follow-Up
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Quick Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklistItems.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" defaultChecked className="size-3 rounded border-slate-300" />
                    {item}
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 bg-white py-3 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Auto-save enabled | Last saved: just now
          </p>
          <div className="inline-flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onSaveNotes}>
              <Save className="size-4" />
              Save Consultation Notes
            </Button>
            <Button variant="outline" onClick={() => toast.success("Print summary ready.")}>
              <Printer className="size-4" />
              Print Summary
            </Button>
            <Button variant="outline" onClick={onIssuePrescription}>
              <ClipboardList className="size-4" />
              Issue Prescription
            </Button>
            <Button onClick={onMarkCompleted}>
              <CheckCircle2 className="size-4" />
              Mark Appointment Completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
