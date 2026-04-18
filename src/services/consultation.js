import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

// ---------------------------------------------------------------------------
// Consultation Notes
// ---------------------------------------------------------------------------

export async function saveConsultationNote(appointmentId, content) {
  const response = await api.post(
    `/appointments/appointments/${appointmentId}/notes`,
    { content }
  );
  return unwrapData(response.data);
}

export async function getConsultationNotes(appointmentId) {
  const response = await api.get(
    `/appointments/appointments/${appointmentId}/notes`
  );
  const data = unwrapData(response.data);
  return Array.isArray(data) ? data : [];
}

// ---------------------------------------------------------------------------
// Prescriptions (appointment-scoped)
// ---------------------------------------------------------------------------

export async function createConsultationPrescription(appointmentId, payload) {
  const response = await api.post(
    `/appointments/appointments/${appointmentId}/prescriptions`,
    payload
  );
  return unwrapData(response.data);
}

export async function getConsultationPrescriptions(appointmentId) {
  const response = await api.get(
    `/appointments/appointments/${appointmentId}/prescriptions`
  );
  const data = unwrapData(response.data);
  return Array.isArray(data) ? data : [];
}

export async function finalizePrescription(appointmentId, prescriptionId) {
  const response = await api.post(
    `/appointments/appointments/${appointmentId}/prescriptions/${prescriptionId}/finalize`
  );
  return unwrapData(response.data);
}

// ---------------------------------------------------------------------------
// AI Overview
// ---------------------------------------------------------------------------

export async function getAIOverview(appointmentId) {
  const response = await api.get(
    `/appointments/appointments/${appointmentId}/ai-overview`
  );
  return unwrapData(response.data);
}

// ---------------------------------------------------------------------------
// Consultation Documents (appointment-scoped)
// ---------------------------------------------------------------------------

export async function uploadConsultationDocument(appointmentId, payload) {
  const response = await api.post(
    `/appointments/appointments/${appointmentId}/patient-documents`,
    payload
  );
  return unwrapData(response.data);
}

export async function getConsultationDocuments(appointmentId) {
  const response = await api.get(
    `/appointments/appointments/${appointmentId}/patient-documents`
  );
  return unwrapData(response.data);
}
