import axios from "axios";
import { getRoleFromToken } from "@/lib/auth";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_STORAGE_KEY = "medstream_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "medstream_refresh_token";

function extractAccessToken(payload) {
  return (
    payload?.data?.accessToken ||
    payload?.data?.access_token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.data?.token ||
    payload?.token ||
    null
  );
}

function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const fromStorage = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (fromStorage) {
    return fromStorage;
  }

  return import.meta.env.VITE_PATIENT_ACCESS_TOKEN || null;
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

function persistAccessToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

function persistRefreshToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const rawAxios = axios.create({ 
  baseURL: BASE_URL, 
  withCredentials: true 
});

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

function notifyAuthChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("auth:changed"));
}


let accessToken = getStoredAccessToken();

export const setAccessToken = (token) => {
  accessToken = token;
  persistAccessToken(token);
  notifyAuthChanged();
};
export const getAccessToken = () => accessToken;
export const getRefreshToken = () => getStoredRefreshToken();
export const setRefreshToken = (token) => {
  persistRefreshToken(token);
  notifyAuthChanged();
};
export const getCurrentRole = () => getRoleFromToken(accessToken);
export const clearAuthTokens = () => {
  setAccessToken(null);
  setRefreshToken(null);
};
export const logout = () => {
  clearAuthTokens();
};

// Attach access token to outgoing requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh access token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    // Do not auto refresh while hitting auth endpoints
    if (error.response?.status === 401 && requestUrl.includes("/auth/")) {
      if (requestUrl.includes("/auth/refresh-token")) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      if (
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/google-login")
      ) {
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await rawAxios.post("/auth/refresh-token");
        const newToken = extractAccessToken(res.data);

        if (!newToken) {
          throw new Error("Refresh token response did not include access token.");
        }

        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;