import api, { publicApi } from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function searchDoctors(params = {}) {
  const response = await publicApi.get("/appointments/doctors/search", {
    params: cleanParams(params),
  });

  return unwrapData(response.data);
}

export async function getDoctorProfile(doctorId, date) {
  const response = await api.get(`/appointments/doctors/${doctorId}/profile`, {
    params: cleanParams({ date }),
  });

  return unwrapData(response.data);
}

export async function bookAppointment(payload, idempotencyKey) {
  const response = await api.post("/appointments/appointments/book", payload, {
    headers: {
      "X-Idempotency-Key": idempotencyKey,
    },
  });

  return unwrapData(response.data);
}

export async function rescheduleAppointment(appointmentId, payload) {
  const response = await api.post(`/appointments/appointments/${appointmentId}/reschedule`, payload);
  return unwrapData(response.data);
}

export async function cancelAppointment(appointmentId, payload = {}) {
  const response = await api.post(`/appointments/appointments/${appointmentId}/cancel`, payload);
  return unwrapData(response.data);
}

export async function getAppointments(params = {}) {
  const response = await api.get("/appointments/appointments", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function markAppointmentArrived(appointmentId, payload = {}) {
  const response = await api.post(`/appointments/appointments/${appointmentId}/arrived`, payload);
  return unwrapData(response.data);
}

export async function markAppointmentCompleted(appointmentId) {
  const response = await api.post(`/appointments/appointments/${appointmentId}/complete`);
  return unwrapData(response.data);
}

export async function markAppointmentTechnicalFailure(appointmentId, payload) {
  const response = await api.post(`/appointments/appointments/${appointmentId}/technical-failure`, payload);
  return unwrapData(response.data);
}

export async function suggestFollowUp(payload) {
  const response = await api.post("/appointments/appointments/follow-ups/suggest", payload);
  return unwrapData(response.data);
}

export async function getPendingFollowUps() {
  const response = await api.get("/appointments/appointments/follow-ups/pending");
  return unwrapData(response.data);
}

export async function confirmFollowUp(suggestionId, payload = {}) {
  const response = await api.post(`/appointments/appointments/follow-ups/${suggestionId}/confirm`, payload);
  return unwrapData(response.data);
}

export async function getAdminAppointments(params = {}) {
  const response = await api.get("/appointments/admin/appointments", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function adminCancelAppointment(appointmentId, payload) {
  const response = await api.post(`/appointments/admin/appointments/${appointmentId}/cancel`, payload);
  return unwrapData(response.data);
}

export async function adminMarkNoShow(appointmentId, payload) {
  const response = await api.post(`/appointments/admin/appointments/${appointmentId}/no-show`, payload);
  return unwrapData(response.data);
}

export async function getAppointmentStatusHistory(appointmentId) {
  const response = await api.get(`/appointments/admin/appointments/${appointmentId}/status-history`);
  return unwrapData(response.data);
}

export async function getAdminStatistics(params = {}) {
  const response = await api.get("/appointments/admin/statistics", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function getAdminTelemedicineLiveStatuses(params = {}) {
  const response = await api.get("/appointments/admin/telemedicine/live-statuses", {
    params: cleanParams(params),
  });
  return unwrapData(response.data);
}

export async function getActivePolicy() {
  const response = await api.get("/appointments/admin/policies/active");
  return unwrapData(response.data);
}

export async function updateActivePolicy(payload) {
  const response = await api.put("/appointments/admin/policies/active", payload);
  return unwrapData(response.data);
}

export async function getEffectivePolicy() {
  const response = await api.get("/appointments/admin/policies/effective");
  return unwrapData(response.data);
}

export const doctorApi = {
  searchDoctors,
  getDoctorProfile,
};

export const bookingApi = {
  bookAppointment,
  rescheduleAppointment,
  suggestFollowUp,
  getPendingFollowUps,
  confirmFollowUp,
};

export const appointmentApi = {
  getAppointments,
  cancelAppointment,
  markAppointmentArrived,
  markAppointmentCompleted,
  markAppointmentTechnicalFailure,
};

export const adminAppointmentApi = {
  getAdminAppointments,
  adminCancelAppointment,
  adminMarkNoShow,
  getAppointmentStatusHistory,
  getAdminStatistics,
  getAdminTelemedicineLiveStatuses,
};

export const policyApi = {
  getActivePolicy,
  updateActivePolicy,
  getEffectivePolicy,
};
