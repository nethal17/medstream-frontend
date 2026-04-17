import { publicApi } from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

export async function sendJoinWithUsRequest(payload) {
  const response = await publicApi.post("/notifications/api/notifications/events", payload);
  return unwrapData(response.data);
}

export async function sendContactUsRequest(payload) {
  const response = await publicApi.post("/notifications/api/notifications/contact-us", payload);
  return unwrapData(response.data);
}
