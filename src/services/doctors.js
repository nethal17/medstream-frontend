import api, { publicApi } from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";
import { getCurrentUserProfile } from "@/services/auth";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function getDoctorServiceHealth() {
  const response = await publicApi.get("/doctors/health");
  return unwrapData(response.data);
}

export async function getDoctorByUserId(userId) {
  const response = await api.get(`/doctors/by-user/${userId}`);
  return unwrapData(response.data);
}

export async function getDoctorMe(params = {}) {
  const response = await api.get("/doctors/me", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function getMyDoctorAvailability(params = {}) {
  const response = await api.get("/doctors/me/availability", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function createMyDoctorAvailability(payload) {
  const response = await api.post("/doctors/me/availability", payload);
  return unwrapData(response.data);
}

export async function updateMyDoctorAvailability(availabilityId, payload) {
  const response = await api.patch(`/doctors/me/availability/${availabilityId}`, payload);
  return unwrapData(response.data);
}

export async function deleteMyDoctorAvailability(availabilityId) {
  const response = await api.delete(`/doctors/me/availability/${availabilityId}`);
  return unwrapData(response.data);
}

export async function updateMyDoctorProfile(payload) {
  const response = await api.patch("/doctors/me", payload);
  return unwrapData(response.data);
}

export async function updateMyConsultationFee(consultationFee) {
  const response = await api.patch("/doctors/me/consultation-fee", {
    consultation_fee: consultationFee,
  });
  return unwrapData(response.data);
}

export async function resolveCurrentDoctor() {
  let authUser = null;
  let userId = "";

  try {
    authUser = await getCurrentUserProfile();
    userId = authUser?.user_id || authUser?.id || "";
  } catch {
    authUser = null;
  }

  let doctor = null;

  try {
    doctor = await getDoctorMe();
  } catch (meError) {
    if (!userId) {
      throw meError;
    }

    doctor = await getDoctorByUserId(userId);
  }

  return {
    userId: userId || doctor?.user_id || "",
    doctorId: doctor?.doctor_id || "",
    doctorName: doctor?.full_name || "",
  };
}

export async function getDoctorProfile(doctorId, params = {}) {
  const response = await api.get(`/doctors/internal/doctors/${doctorId}/profile`, {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function updateDoctorProfile(doctorId, payload) {
  const response = await api.patch(`/doctors/internal/doctors/${doctorId}`, payload);
  return unwrapData(response.data);
}

export async function setDoctorVisibility(doctorId, visible) {
  const response = await api.post(`/doctors/internal/doctors/${doctorId}/visibility`, {
    visible,
  });
  return unwrapData(response.data);
}

export async function reactivateDoctorProfile(doctorId) {
  const response = await api.post(`/doctors/internal/doctors/${doctorId}/reactivate`);
  return unwrapData(response.data);
}

export async function getDoctorClinics(doctorId) {
  const response = await api.get(`/doctors/internal/doctors/${doctorId}/clinics`);
  return unwrapData(response.data);
}

export async function getDoctorAvailability(doctorId) {
  const response = await api.get(`/doctors/internal/doctors/${doctorId}/availability`);
  return unwrapData(response.data);
}

export async function createDoctorAvailability(doctorId, payload) {
  const response = await api.post(`/doctors/internal/doctors/${doctorId}/availability`, payload);
  return unwrapData(response.data);
}

export async function updateDoctorAvailability(doctorId, availabilityId, payload) {
  const response = await api.patch(
    `/doctors/internal/doctors/${doctorId}/availability/${availabilityId}`,
    payload
  );
  return unwrapData(response.data);
}

export async function deleteDoctorAvailability(doctorId, availabilityId) {
  const response = await api.delete(`/doctors/internal/doctors/${doctorId}/availability/${availabilityId}`);
  return unwrapData(response.data);
}
