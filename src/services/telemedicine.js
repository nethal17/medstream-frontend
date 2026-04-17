import axios from "axios";

import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const joinTokenApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function createTelemedicineJoinLink(appointmentId) {
  const response = await api.post("/telemedicine/sessions/join-link", {
    appointment_id: appointmentId,
  });

  return unwrapData(response.data);
}

export async function validateTelemedicineJoinToken(joinToken) {
  const response = await joinTokenApi.get("/telemedicine/sessions/validate", {
    headers: {
      Authorization: `Bearer ${joinToken}`,
    },
  });

  return unwrapData(response.data);
}

export async function getGoogleOAuthStatus() {
  const response = await api.get("/telemedicine/auth/google/status");
  return unwrapData(response.data);
}

export function getGoogleOAuthLoginUrl() {
  return `${BASE_URL}/telemedicine/auth/google/login`;
}

export async function getTelemedicineLiveStatuses(params = {}) {
  const response = await api.get("/appointments/admin/telemedicine/live-statuses", {
    params: cleanParams(params),
  });

  return unwrapData(response.data);
}

export const telemedicineApi = {
  createTelemedicineJoinLink,
  validateTelemedicineJoinToken,
  getGoogleOAuthStatus,
  getGoogleOAuthLoginUrl,
  getTelemedicineLiveStatuses,
};
