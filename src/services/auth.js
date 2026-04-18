import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";
import { normalizeRole } from "@/lib/auth";

export function normalizeAuthUser(payload) {
  const user = unwrapData(payload) || {};

  const roleCandidate =
    user?.role ||
    user?.user_role ||
    user?.userRole ||
    user?.data?.role ||
    user?.data?.user_role ||
    null;

  return {
    ...user,
    role: normalizeRole(roleCandidate),
  };
}

export async function getCurrentUserProfile() {
  const response = await api.get("/auth/me");
  return normalizeAuthUser(response.data);
}

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return unwrapData(response.data);
}
