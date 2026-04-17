import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

/**
 * @typedef {"public" | "private" | "doctor_only"} DocumentVisibility
 */

/**
 * @typedef {Object} PatientDocument
 * @property {string} document_id
 * @property {string} patient_id
 * @property {string} document_type
 * @property {string} file_name
 * @property {string} file_url
 * @property {DocumentVisibility} visibility
 * @property {string} uploaded_at
 */

/**
 * @param {string} patientId
 * @returns {Promise<PatientDocument[]>}
 */
export async function listDocuments(patientId) {
  const response = await api.get(`/patients/patients/${patientId}/documents`);
  const data = unwrapData(response.data);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} patientId
 * @param {File} file
 * @param {string} documentType
 * @param {DocumentVisibility} [visibility="public"]
 * @returns {Promise<PatientDocument>}
 */
export async function uploadDocument(patientId, file, documentType, visibility = "public") {
  const form = new FormData();
  form.append("file", file);
  form.append("document_type", documentType);
  form.append("visibility", visibility);

  const response = await api.post(`/patients/patients/${patientId}/documents`, form);
  return unwrapData(response.data);
}

/**
 * @param {string} patientId
 * @param {string} documentId
 * @param {{ document_type?: string, visibility?: DocumentVisibility }} payload
 * @returns {Promise<PatientDocument>}
 */
export async function updateDocument(patientId, documentId, payload) {
  const response = await api.patch(`/patients/patients/${patientId}/documents/${documentId}`, payload);
  return unwrapData(response.data);
}

/**
 * @param {string} patientId
 * @param {string} documentId
 * @returns {Promise<unknown>}
 */
export async function deleteDocument(patientId, documentId) {
  const response = await api.delete(`/patients/patients/${patientId}/documents/${documentId}`);
  return unwrapData(response.data);
}
