import { useCallback, useEffect, useState } from "react";

import AuthContext from "@/contexts/auth-context";

import { getHomeRouteForRole, getRoleFromToken, normalizeRole } from "@/lib/auth";
import {
  getAccessToken,
  getCurrentRole,
  logout as clearAuthState,
  setAccessToken,
  setRefreshToken,
} from "@/services/api";

function parseRoleFromUser(user, fallbackRole) {
  const roleCandidate =
    user?.role ||
    user?.user_role ||
    user?.userRole ||
    user?.data?.role ||
    user?.data?.user_role ||
    null;

  return normalizeRole(roleCandidate) || normalizeRole(fallbackRole) || null;
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => ({
    isLoading: true,
    role: null,
    accessToken: null,
    isAuthenticated: false,
  }));

  const hydrateAuthState = useCallback(() => {
    const accessToken = getAccessToken();
    const tokenRole = getRoleFromToken(accessToken) || getCurrentRole();
    const role = parseRoleFromUser(null, tokenRole);

    setAuthState({
      isLoading: false,
      role,
      accessToken,
      isAuthenticated: Boolean(accessToken),
    });
  }, []);

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => {
      hydrateAuthState();
    }, 0);

    const onAuthChanged = () => hydrateAuthState();
    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      clearTimeout(bootstrapTimer);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [hydrateAuthState]);

  const setAuthSession = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    hydrateAuthState();
  };

  const logout = () => {
    clearAuthState();
    hydrateAuthState();
  };

  const value = {
    user: {
      role: authState.role,
      accessToken: authState.accessToken,
      isAuthenticated: authState.isAuthenticated,
    },
    role: authState.role,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    homeRoute: getHomeRouteForRole(authState.role),
    setAuthSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
