import api from "@/services/api";
import { unwrapData } from "@/lib/appointment-utils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8080";

function toWebSocketBaseUrl(baseUrl) {
  if (baseUrl.startsWith("https://")) {
    return baseUrl.replace("https://", "wss://");
  }

  if (baseUrl.startsWith("http://")) {
    return baseUrl.replace("http://", "ws://");
  }

  return baseUrl;
}

function buildRealtimeUrl(userId, token) {
  const wsBase = toWebSocketBaseUrl(API_BASE_URL).replace(/\/$/, "");
  const params = new URLSearchParams({ token });
  return `${wsBase}/notifications/ws/${encodeURIComponent(userId)}?${params.toString()}`;
}

/**
 * @param {string} userId
 * @param {string} token
 * @param {{onOpen?: (event: Event) => void, onMessage?: (event: MessageEvent) => void, onError?: (event: Event) => void, onClose?: (event: CloseEvent) => void}} handlers
 */
export function connectRealtime(userId, token, handlers = {}) {
  const ws = new WebSocket(buildRealtimeUrl(userId, token));

  if (handlers.onOpen) {
    ws.addEventListener("open", handlers.onOpen);
  }
  if (handlers.onMessage) {
    ws.addEventListener("message", handlers.onMessage);
  }
  if (handlers.onError) {
    ws.addEventListener("error", handlers.onError);
  }
  if (handlers.onClose) {
    ws.addEventListener("close", handlers.onClose);
  }

  return {
    socket: ws,
    sendKeepalive: () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    },
    close: () => {
      try {
        ws.close();
      } catch {
        // no-op
      }
    },
  };
}

export async function fetchInbox(skip = 0, limit = 20, unreadOnly = false) {
  const response = await api.get("/notifications/api/notifications/inbox/", {
    params: {
      skip,
      limit,
      unread_only: unreadOnly,
    },
  });

  const data = unwrapData(response.data);
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

export async function fetchUnreadCount() {
  const response = await api.get("/notifications/api/notifications/inbox/unread-count");
  const data = unwrapData(response.data);

  if (typeof data === "number") {
    return data;
  }

  return Number(data?.unread_count || data?.count || 0);
}

export async function markRead(notificationId) {
  const response = await api.patch(`/notifications/api/notifications/inbox/${notificationId}/read`);
  return unwrapData(response.data);
}

export async function markAllRead() {
  const response = await api.patch("/notifications/api/notifications/inbox/read-all");
  return unwrapData(response.data);
}
