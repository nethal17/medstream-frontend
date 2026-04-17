import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

/**
 * @typedef {Object} Prescription
 * @property {string} prescription_id
 * @property {string} appointment_id
 * @property {string} patient_id
 * @property {string | null} doctor_id
 * @property {string | null} clinic_id
 * @property {Array<Record<string, unknown>>} medications
 * @property {string | null} instructions
 * @property {string} status
 * @property {string | null} issued_at
 * @property {string | null} finalized_at
 * @property {string} created_at
 * @property {string} updated_at
 */

export async function getPatientProfileByUserId(userId) {
  const response = await api.get(`/patients/by-user/${userId}`);
  return unwrapData(response.data);
}

export async function updatePatientProfile(patientId, payload) {
  const response = await api.patch(`/patients/patients/${patientId}`, payload);
  return unwrapData(response.data);
}

export async function getPatientAllergies(patientId) {
  const response = await api.get(`/patients/patients/${patientId}/allergies`);
  return unwrapData(response.data);
}

export async function createPatientAllergy(patientId, payload) {
  const response = await api.post(`/patients/patients/${patientId}/allergies`, payload);
  return unwrapData(response.data);
}

export async function updatePatientAllergy(patientId, allergyId, payload) {
  const response = await api.patch(`/patients/patients/${patientId}/allergies/${allergyId}`, payload);
  return unwrapData(response.data);
}

export async function deletePatientAllergy(patientId, allergyId) {
  const response = await api.delete(`/patients/patients/${patientId}/allergies/${allergyId}`);
  return unwrapData(response.data);
}

export async function getPatientChronicDiseases(patientId) {
  const response = await api.get(`/patients/patients/${patientId}/chronic-diseases`);
  return unwrapData(response.data);
}

export async function createPatientChronicDisease(patientId, payload) {
  const response = await api.post(`/patients/patients/${patientId}/chronic-diseases`, payload);
  return unwrapData(response.data);
}

export async function updatePatientChronicDisease(patientId, conditionId, payload) {
  const response = await api.patch(
    `/patients/patients/${patientId}/chronic-diseases/${conditionId}`,
    payload
  );
  return unwrapData(response.data);
}

export async function deletePatientChronicDisease(patientId, conditionId) {
  const response = await api.delete(`/patients/patients/${patientId}/chronic-diseases/${conditionId}`);
  return unwrapData(response.data);
}

/**
 * @param {string} patientId
 * @returns {Promise<Prescription[]>}
 */
export async function getPatientPrescriptions(patientId) {
  const response = await api.get(`/patients/patients/${patientId}/prescriptions`);
  const data = unwrapData(response.data);
  return Array.isArray(data) ? data : [];
}
