import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function listClinics(params = {}) {
  const response = await api.get("/clinics/", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function createClinic(payload) {
  const response = await api.post("/clinics/", payload);
  return unwrapData(response.data);
}

export async function updateClinic(clinicId, payload) {
  const response = await api.patch(`/clinics/${clinicId}`, payload);
  return unwrapData(response.data);
}

export async function updateClinicStatus(clinicId, payload) {
  const response = await api.patch(`/clinics/${clinicId}/status`, payload);
  return unwrapData(response.data);
}

export async function deleteClinic(clinicId) {
  const response = await api.delete(`/clinics/${clinicId}`);
  return unwrapData(response.data);
}
