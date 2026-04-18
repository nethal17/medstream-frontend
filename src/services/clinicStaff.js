import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

export async function listClinicStaff(clinicId) {
  const response = await api.get(`/clinics/${clinicId}/staff`);
  return unwrapData(response.data);
}

export async function createClinicStaff(clinicId, payload) {
  const response = await api.post(`/clinics/${clinicId}/staff`, payload);
  return unwrapData(response.data);
}

export async function updateClinicStaff(clinicId, staffId, payload) {
  const response = await api.patch(`/clinics/${clinicId}/staff/${staffId}`, payload);
  return unwrapData(response.data);
}

export async function deleteClinicStaff(clinicId, staffId) {
  const response = await api.delete(`/clinics/${clinicId}/staff/${staffId}`);
  return unwrapData(response.data);
}

export async function getUserClinic() {
  const response = await api.get(`/clinics/assignment`);
  return unwrapData(response.data);
}
