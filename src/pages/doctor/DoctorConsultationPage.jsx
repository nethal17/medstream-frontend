import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  MoreVertical,
  Pill,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
  CalendarDays,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDisplayDate, formatTimeLabel } from "@/lib/appointment-utils";
import { Spinner } from "@/components/ui/spinner";
import { useDoctorIdentity } from "@/hooks/useDoctorIdentity";

import { getMedicalSummary } from "@/services/patients";
import { uploadDocument } from "@/services/documents";
import { 
  markAppointmentArrived, 
  markAppointmentCompleted,
  suggestFollowUp 
} from "@/services/appointments";
import { sendNotificationEvent } from "@/services/notifications";
import {
  getAIOverview,
  getConsultationDocuments,
  uploadConsultationDocument,
  getConsultationNotes,
  saveConsultationNote,
  getConsultationPrescriptions,
  createConsultationPrescription,
} from "@/services/consultation";

const checklistItems = [
  "Verify patient identity",
  "Review AI overview and risk flags",
  "Review past consultation notes",
  "Check latest lab reports",
  "Issue new prescriptions if needed",
  "Schedule follow-up",
];

export default function DoctorConsultationPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { state } = useLocation();
  const { doctorId } = useDoctorIdentity();

  const appointment = state?.appointment || {};
  const patientId = appointment?.patient_id || appointment?.patientId || appointment?.patient?.id;
  const doctorUserId = appointment?.doctor_id || appointment?.doctorId || doctorId;
  const isReadOnly = appointment?.status === "completed" || appointment?.status === "cancelled" || appointment?.status === "technical_failure";


  const [loading, setLoading] = useState(true);
  const [medicalSummary, setMedicalSummary] = useState(null);
  const [aiOverview, setAiOverview] = useState(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [consultationDocuments, setConsultationDocuments] = useState([]);
  const [consultationNotes, setConsultationNotes] = useState([]);
  const [consultationPrescriptions, setConsultationPrescriptions] = useState([]);

  const fileInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [busyState, setBusyState] = useState("");

  const [notesContent, setNotesContent] = useState("");
  
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpType, setFollowUpType] = useState(appointment?.consultation_type || "physical");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const [medicineRows, setMedicineRows] = useState([
    { id: "med-1", name: "", dosage: "", frequency: "", duration: "", instruction: "" },
  ]);

  const fetchPageData = async () => {
    try {
      setLoading(true);

      const [
        docsData,
        notesData,
        prescriptionsData
      ] = await Promise.all([
        getConsultationDocuments(appointmentId).catch(() => ({ results: [] })),
        getConsultationNotes(appointmentId).catch(() => []),
        getConsultationPrescriptions(appointmentId).catch(() => [])
      ]);

      setConsultationDocuments(docsData?.results || []);
      setConsultationNotes(notesData || []);
      setConsultationPrescriptions(prescriptionsData || []);

      if (patientId) {
        const summaryData = await getMedicalSummary(patientId).catch(() => null);
        setMedicalSummary(summaryData);
      }
    } catch (error) {
      console.error("Failed to load consultation data", error);
      toast.error("Failed to load some consultation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPageData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, patientId]);

  const profile = medicalSummary?.profile || {};
  const allergies = medicalSummary?.allergies || [];
  const chronicConditions = medicalSummary?.chronic_conditions || [];

  // Prescription Handlers
  const handleAddMedicine = () => {
    setMedicineRows((prev) => [
      ...prev,
      { id: `med-${Date.now()}`, name: "", dosage: "", frequency: "", duration: "", instruction: "" },
    ]);
  };

  const handleUpdateMedicine = (id, key, value) => {
    setMedicineRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const handleDeleteMedicine = (id) => {
    setMedicineRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleGenerateAiOverview = async () => {
    try {
      setIsGeneratingAi(true);
      const data = await getAIOverview(appointmentId);
      setAiOverview(data);
    } catch {
      toast.error("Failed to generate AI overview.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Actions
  const handleUploadDocumentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!patientId) {
      toast.error("Patient ID missing. Cannot upload document.");
      return;
    }

    try {
      setUploadingDoc(true);
      // 1. Upload to patient service to get URL
      const patientDoc = await uploadDocument(patientId, file, "Consultation Document", "public");

      // 2. Link to consultation only if not already linked by backend hooks/workflows.
      const currentDocs = await getConsultationDocuments(appointmentId).catch(() => ({ results: [] }));
      const existingItems = currentDocs?.results || [];
      const alreadyLinked = existingItems.some(
        (item) => item?.url === patientDoc.file_url || item?.name === patientDoc.file_name
      );

      if (!alreadyLinked) {
        await uploadConsultationDocument(appointmentId, {
          name: patientDoc.file_name,
          document_type: "Consultation Document",
          url: patientDoc.file_url,
          description: "Uploaded during consultation"
        });
      }

      toast.success("Document uploaded successfully");
      const docsData = await getConsultationDocuments(appointmentId);
      setConsultationDocuments(docsData?.results || []);
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onIssuePrescription = async () => {
    const validMeds = medicineRows.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) {
      toast.error("Please add at least one medicine.");
      return;
    }

    try {
      setBusyState("prescription");
      await createConsultationPrescription(appointmentId, {
        medications: validMeds.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          notes: m.instruction
        })),
        instructions: "Issued via consultation dashboard"
      });
      toast.success("Prescription issued successfully.");
      setMedicineRows([{ id: "med-1", name: "", dosage: "", frequency: "", duration: "", instruction: "" }]);
      const pData = await getConsultationPrescriptions(appointmentId);
      setConsultationPrescriptions(pData || []);
    } catch (error) {
      toast.error("Failed to issue prescription.");
      console.error(error);
    } finally {
      setBusyState("");
    }
  };

  const onSaveNotes = async () => {
    if (!notesContent.trim()) {
      toast.error("Notes cannot be empty.");
      return;
    }
    try {
      setBusyState("notes");
      await saveConsultationNote(appointmentId, notesContent);
      toast.success("Consultation notes saved.");
      setNotesContent("");
      const notesData = await getConsultationNotes(appointmentId);
      setConsultationNotes(notesData || []);
    } catch {
      toast.error("Failed to save notes.");
    } finally {
      setBusyState("");
    }
  };

  const onScheduleFollowUp = async () => {
    if (!followUpDate || !followUpTime) {
      toast.error("Please select a date and time for follow-up.");
      return;
    }
    try {
      setBusyState("followup");
      await suggestFollowUp({
        original_appointment_id: appointmentId,
        suggested_date: followUpDate,
        suggested_start_time: followUpTime,
        consultation_type: followUpType,
        notes: followUpNotes
      });
      toast.success("Follow-up scheduled successfully.");
      setFollowUpDate("");
      setFollowUpTime("");
      setFollowUpType(appointment?.consultation_type || "physical");
      setFollowUpNotes("");
    } catch {
      toast.error("Failed to schedule follow-up.");
    } finally {
      setBusyState("");
    }
  };

  const onMarkArrived = async () => {
    try {
      setBusyState("arrived");
      await markAppointmentArrived(appointmentId);
      toast.success("Patient marked as arrived.");
    } catch {
      toast.error("Failed to mark as arrived.");
    } finally {
      setBusyState("");
    }
  };

  const onMarkCompleted = async () => {
    try {
      setBusyState("completed");
      await markAppointmentCompleted(appointmentId);

      const notificationJobs = [];

      if (patientId) {
        notificationJobs.push(
          sendNotificationEvent({
            event_type: "appointment.consultation_completed.patient",
            user_id: patientId,
            payload: {
              appointment_id: appointmentId,
              doctor_id: doctorUserId || null,
              doctor_name: appointment?.doctor_name || null,
              patient_name: appointment?.patient_name || null,
            },
            channels: ["in_app", "email"],
          })
        );
      }

      if (doctorUserId) {
        notificationJobs.push(
          sendNotificationEvent({
            event_type: "appointment.consultation_completed.doctor",
            user_id: doctorUserId,
            payload: {
              appointment_id: appointmentId,
              patient_id: patientId || null,
              patient_name: appointment?.patient_name || null,
            },
            channels: ["in_app"],
          })
        );
      }

      const notificationResults = await Promise.allSettled(notificationJobs);
      const hasNotificationFailure = notificationResults.some((result) => result.status === "rejected");

      navigate("/doctor/dashboard/overview", {
        replace: true,
        state: {
          consultationComplete: {
            appointmentId,
            hasNotificationFailure,
          },
        },
      });
    } catch (error) {
      console.error("Completion error:", error);
      toast.error("Failed to complete appointment.");
    } finally {
      setBusyState("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {/* Top Header Card */}
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
              <h2 className="text-xl font-semibold text-slate-900">{profile.full_name || appointment?.patient_name || "Unknown Patient"}</h2>
              <p className="text-xs text-slate-500">
                {profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : "--"} Yrs / {profile.gender || "U"} | MRN: #{patientId?.split('-')[0] || "Unknown"}
              </p>
            </div>

            <div className="max-w-full rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-600">
              <p className="font-semibold uppercase tracking-wide text-slate-500">Appointment Details</p>
              <p className="mt-1">ID: #{appointmentId?.split('-')[0]}</p>
              <p>
                {appointment?.consultation_type || "Telemedicine"} | {formatDisplayDate(appointment?.date)}{" "}
                {formatTimeLabel(appointment?.start_time)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={onMarkArrived} disabled={busyState === "arrived" || isReadOnly}>
                Mark Arrived
              </Button>
              <Button size="sm" onClick={onMarkCompleted} disabled={busyState === "completed" || isReadOnly}>
                Complete Consultation
              </Button>
              <Button size="icon" variant="ghost">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Overview Section removed from main layout to sliding panel */}

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Left Sidebar */}
        <div className="min-w-0 space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Medical Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Blood Group</p>
                  <p className="font-medium text-slate-800">{profile?.blood_group || "--"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Vitals</p>
                  <p className="font-medium text-slate-800">--</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Allergies</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {allergies.length > 0 ? allergies.map((item) => (
                    <span key={item.allergy_id} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {item.allergy_name}
                    </span>
                  )) : <span className="text-xs text-slate-400">No known allergies</span>}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Chronic Conditions</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
                  {chronicConditions.length > 0 ? chronicConditions.map((item) => (
                    <li key={item.condition_id}>{item.condition_name}</li>
                  )) : <span className="text-xs text-slate-400 -ml-4">None reported</span>}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Consultation Documents</CardTitle>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                {consultationDocuments.length}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {consultationDocuments.map((doc) => (
                <div key={doc.document_id} className="flex items-center justify-between rounded border border-slate-200 p-2">
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-medium text-slate-700" title={doc.name}>{doc.name}</p>
                    <p className="text-[11px] text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString()} | {doc.document_type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        <FileText className="size-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <Button variant="outline" className="w-full" onClick={handleUploadDocumentClick} disabled={uploadingDoc || isReadOnly}>
                {uploadingDoc ? <span className="animate-pulse">Uploading...</span> : <><Upload className="size-4 mr-1" /> Upload Document</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Main Area */}
        <div className="min-w-0 space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Consultation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {consultationNotes.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Previous Notes from this Session</h4>
                  {consultationNotes.map(note => (
                    <div key={note.note_id} className="bg-slate-50 p-2 rounded border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap">
                      {note.content}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Add Clinical Note
                </label>
                <textarea
                  rows={4}
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Record observations, diagnosis, and advice here..."
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm mt-1"
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={onSaveNotes} disabled={busyState === "notes" || isReadOnly}>
                  <Save className="size-3 mr-1" /> Save Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-slate-600">
                <Pill className="size-4" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Prescriptions */}
              {consultationPrescriptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Issued Prescriptions</h4>
                  {consultationPrescriptions.map(p => (
                    <div key={p.prescription_id} className="border border-slate-200 rounded p-2 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700">Issued at {new Date(p.created_at).toLocaleString()}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{p.status}</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {p.medications?.map((m, i) => (
                          <li key={i}>{m.name} - {m.dosage} ({m.frequency})</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* New Prescription Form */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Draft New Prescription</h4>
                  <Button size="xs" variant="outline" onClick={handleAddMedicine} disabled={isReadOnly}>
                    <Plus className="size-3 mr-1" /> Add Medicine
                  </Button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-2 py-2">Medicine Name</th>
                        <th className="px-2 py-2">Dosage</th>
                        <th className="px-2 py-2">Frequency</th>
                        <th className="px-2 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineRows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-200 last:border-0">
                          <td className="px-2 py-2">
                            <Input
                              value={row.name}
                              onChange={(e) => handleUpdateMedicine(row.id, "name", e.target.value)}
                              className="h-7 text-xs"
                              placeholder="Name"
                              disabled={isReadOnly}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.dosage}
                              onChange={(e) => handleUpdateMedicine(row.id, "dosage", e.target.value)}
                              className="h-7 text-xs"
                              placeholder="e.g. 500mg"
                              disabled={isReadOnly}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.frequency}
                              onChange={(e) => handleUpdateMedicine(row.id, "frequency", e.target.value)}
                              className="h-7 text-xs"
                              placeholder="e.g. 1-0-1"
                              disabled={isReadOnly}
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteMedicine(row.id)} disabled={isReadOnly}>
                              <Trash2 className="size-3 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={onIssuePrescription} disabled={busyState === "prescription" || isReadOnly}>
                    <ClipboardList className="size-3 mr-1" /> Issue Prescription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="min-w-0 xl:col-span-2 2xl:col-span-1">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-slate-600">
                  <CalendarDays className="size-4" /> Follow-Up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</label>
                    <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="h-8 mt-1" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Time</label>
                    <Input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className="h-8 mt-1" disabled={isReadOnly} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Consultation Type</label>
                  <select
                    value={followUpType}
                    onChange={(e) => setFollowUpType(e.target.value)}
                    disabled={isReadOnly}
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mt-1"
                  >
                    <option value="physical">Physical</option>
                    <option value="telemedicine">Telemedicine</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes</label>
                  <textarea
                    rows={2}
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs mt-1"
                    placeholder="e.g. Review lab reports"
                    disabled={isReadOnly}
                  />
                </div>
                <Button className="w-full" size="sm" onClick={onScheduleFollowUp} disabled={busyState === "followup" || isReadOnly}>
                  Schedule Follow-Up
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.16em] text-slate-600">Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklistItems.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" className="size-3 rounded border-slate-300" />
                    {item}
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Floating/Sticky Action Bar */}
      <Card className="overflow-hidden border border-slate-200 bg-white py-3 shadow-sm sticky bottom-4 z-10">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pb-0">
          <p className="text-xs text-slate-500">
            Make sure to complete all consultation actions before marking as completed.
          </p>
          <div className="inline-flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => toast.success("Summary printed (demo)")}>
              <Printer className="size-4 mr-1" />
              Print Record
            </Button>
            <Button onClick={onMarkCompleted} disabled={busyState === "completed"} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="size-4 mr-1" />
              Complete Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Floating AI Button */}
      {!isAiPanelOpen && (
        <Button
          size="icon"
          onClick={() => setIsAiPanelOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white z-50 transition-transform hover:scale-105"
        >
          <Bot className="size-7" />
        </Button>
      )}

      {/* AI Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[400px] max-w-[90vw] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isAiPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-indigo-50">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-900 uppercase tracking-wide text-sm">AI Patient Overview</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isGeneratingAi ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-indigo-600">
              <Spinner className="size-8" />
              <p className="text-sm font-medium animate-pulse">Analyzing medical records...</p>
            </div>
          ) : aiOverview ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700">{aiOverview.overall_summary}</p>
              
              {aiOverview.risk_flags?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">Risk Flags</h4>
                  <div className="grid gap-2">
                    {aiOverview.risk_flags.map((flag, idx) => (
                      <div key={idx} className="flex gap-2 rounded-md bg-rose-50 p-2 border border-rose-100">
                        <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-rose-800">{flag.title}</p>
                          <p className="text-[11px] text-rose-700">{flag.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {aiOverview.sections?.map((section) => (
                <div key={section.key} className="pt-2 border-t border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900">{section.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{section.summary}</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-700">
                    {section.highlights?.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Bot className="size-16 text-slate-200" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">AI Medical Assistant</p>
                <p className="text-xs text-slate-500 px-4">Generate a comprehensive summary of past consultations, recent prescriptions, and lab reports.</p>
              </div>
              <Button onClick={handleGenerateAiOverview} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-[200px]">
                Generate Overview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
