import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

// ==========================================
// Clinic Admin - Doctor Assignments
// ==========================================

export async function getClinicAvailableDoctors(clinicId, params = {}) {
  const response = await api.get(`/clinics/${clinicId}/doctors/available`, {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function getClinicDoctors(clinicId) {
  const response = await api.get(`/clinics/${clinicId}/doctors`);
  return unwrapData(response.data);
}

export async function assignDoctorToClinic(clinicId, doctorId) {
  const response = await api.post(`/clinics/${clinicId}/doctors`, {
    doctor_id: doctorId,
  });
  return unwrapData(response.data);
}

export async function unassignDoctorFromClinic(clinicId, doctorId) {
  const response = await api.delete(`/clinics/${clinicId}/doctors/${doctorId}`);
  return unwrapData(response.data);
}

// ==========================================
// Super Admin - Global Doctor Records 
// ==========================================

export async function listAllDoctors() {
  const response = await api.get(`/clinics/admin/doctors`);
  return unwrapData(response.data);
}

export async function createDoctor(payload) {
  const response = await api.post(`/clinics/admin/doctors`, payload);
  return unwrapData(response.data);
}

export async function updateDoctor(doctorId, payload) {
  const response = await api.patch(`/clinics/admin/doctors/${doctorId}`, payload);
  return unwrapData(response.data);
}

export async function deleteDoctor(doctorId) {
  const response = await api.delete(`/clinics/admin/doctors/${doctorId}`);
  return unwrapData(response.data);
}
