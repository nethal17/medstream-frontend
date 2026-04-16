import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function searchDoctors(params = {}) {
  const response = await api.get("/appointments/doctors/search", {
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
