import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  connectRealtime,
  fetchInbox,
  fetchUnreadCount,
  markAllRead as markAllReadRequest,
  markRead as markReadRequest,
} from "@/services/notifications";

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 30000];
const KEEPALIVE_MS = 25000;
const FALLBACK_POLL_MS = 45000;

function normalizeNotification(item) {
  return {
    notification_id: item?.notification_id || item?.id || null,
    title: item?.title || "Notification",
    message: item?.message || "",
    event_type: item?.event_type || item?.type || "general",
    created_at: item?.created_at || item?.sent_at || new Date().toISOString(),
    is_read: Boolean(item?.is_read || item?.read_at),
    raw: item,
  };
}

function isUnread(item) {
  return !item?.is_read;
}

export function useRealtimeNotifications(token, authUserId) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  const socketControlRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const keepaliveRef = useRef(null);
  const fallbackPollRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const mountedRef = useRef(false);
  const connectRef = useRef(() => {});

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (keepaliveRef.current) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }
    if (fallbackPollRef.current) {
      clearInterval(fallbackPollRef.current);
      fallbackPollRef.current = null;
    }
  }, []);

  const startFallbackPolling = useCallback(() => {
    if (fallbackPollRef.current) {
      return;
    }

    fallbackPollRef.current = setInterval(async () => {
      try {
        const count = await fetchUnreadCount();
        if (mountedRef.current) {
          setUnreadCount(count);
        }
      } catch {
        // no-op
      }
    }, FALLBACK_POLL_MS);
  }, []);

  const stopFallbackPolling = useCallback(() => {
    if (fallbackPollRef.current) {
      clearInterval(fallbackPollRef.current);
      fallbackPollRef.current = null;
    }
  }, []);

  const refreshInbox = useCallback(async () => {
    if (!token) {
      return;
    }

    const [inboxList, unread] = await Promise.all([fetchInbox(0, 30, false), fetchUnreadCount()]);
    if (!mountedRef.current) {
      return;
    }

    const normalized = inboxList.map(normalizeNotification);
    setItems(normalized);
    setUnreadCount(unread);
  }, [token]);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current || !token || !authUserId) {
      return;
    }

    if (reconnectTimerRef.current) {
      return;
    }

    const index = Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS_MS.length - 1);
    const delay = RECONNECT_DELAYS_MS[index];
    reconnectAttemptRef.current += 1;

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connectRef.current();
    }, delay);
  }, [authUserId, token]);

  const connect = useCallback(() => {
    if (!mountedRef.current || !token || !authUserId) {
      return;
    }

    if (socketControlRef.current?.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    if (socketControlRef.current?.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    socketControlRef.current = connectRealtime(authUserId, token, {
      onOpen: async () => {
        if (!mountedRef.current) {
          return;
        }

        setIsConnected(true);
        reconnectAttemptRef.current = 0;
        stopFallbackPolling();

        if (keepaliveRef.current) {
          clearInterval(keepaliveRef.current);
        }
        keepaliveRef.current = setInterval(() => {
          socketControlRef.current?.sendKeepalive?.();
        }, KEEPALIVE_MS);

        try {
          await refreshInbox();
        } catch {
          // no-op
        }
      },
      onMessage: (event) => {
        if (!mountedRef.current) {
          return;
        }

        try {
          const payload = JSON.parse(event.data || "{}");

          if (payload?.type !== "NEW_NOTIFICATION") {
            return;
          }

          const optimisticItem = normalizeNotification({
            notification_id: payload?.notification_id || `ws-${Date.now()}`,
            title: payload?.title,
            message: payload?.message,
            event_type: payload?.event_type,
            created_at: new Date().toISOString(),
            is_read: false,
          });

          setItems((prev) => [optimisticItem, ...prev]);
          setUnreadCount((prev) => prev + 1);
        } catch {
          // no-op
        }
      },
      onError: () => {
        if (!mountedRef.current) {
          return;
        }

        setIsConnected(false);
      },
      onClose: () => {
        if (!mountedRef.current) {
          return;
        }

        setIsConnected(false);
        startFallbackPolling();
        scheduleReconnect();
      },
    });
  }, [authUserId, refreshInbox, scheduleReconnect, startFallbackPolling, stopFallbackPolling, token]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearTimers();
      socketControlRef.current?.close?.();
      socketControlRef.current = null;
    };
  }, [clearTimers]);

  useEffect(() => {
    async function bootstrap() {
      if (!token || !authUserId) {
        setItems([]);
        setUnreadCount(0);
        setIsConnected(false);
        clearTimers();
        socketControlRef.current?.close?.();
        socketControlRef.current = null;
        return;
      }

      setIsHydrating(true);
      try {
        await refreshInbox();
      } catch {
        // no-op
      } finally {
        if (mountedRef.current) {
          setIsHydrating(false);
        }
      }

      connect();
    }

    bootstrap();

    return () => {
      clearTimers();
      socketControlRef.current?.close?.();
      socketControlRef.current = null;
      setIsConnected(false);
    };
  }, [authUserId, clearTimers, connect, refreshInbox, token]);

  const markRead = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      const previous = items;
      const hadUnreadTarget = previous.some(
        (entry) => entry.notification_id === notificationId && isUnread(entry)
      );

      setItems((prev) =>
        prev.map((entry) =>
          entry.notification_id === notificationId ? { ...entry, is_read: true } : entry
        )
      );
      if (hadUnreadTarget) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await markReadRequest(notificationId);
      } catch {
        setItems(previous);
        if (hadUnreadTarget) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    [items]
  );

  const markAllRead = useCallback(async () => {
    const previous = items;
    setItems((prev) => prev.map((entry) => ({ ...entry, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllReadRequest();
    } catch {
      setItems(previous);
      setUnreadCount(previous.filter(isUnread).length);
    }
  }, [items]);

  const reconnect = useCallback(() => {
    clearTimers();
    socketControlRef.current?.close?.();
    socketControlRef.current = null;
    setIsConnected(false);
    reconnectAttemptRef.current = 0;
    connect();
  }, [clearTimers, connect]);

  return useMemo(
    () => ({
      items,
      unreadCount,
      isConnected,
      isHydrating,
      markRead,
      markAllRead,
      reconnect,
      refreshInbox,
    }),
    [isConnected, isHydrating, items, markAllRead, markRead, reconnect, refreshInbox, unreadCount]
  );
}
