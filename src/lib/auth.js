export const ROLES = {
  ADMIN: "admin",
  CLINIC_ADMIN: "clinic_admin",
  CLINIC_STAFF: "clinic_staff",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

const ALLOWED_ROLES = Object.values(ROLES);

function base64UrlDecode(value) {
  try {
    const padded = value.padEnd(Math.ceil(value.length / 4) * 4, "=");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    return atob(base64);
  } catch {
    return "";
  }
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const decoded = base64UrlDecode(parts[1]);
    return decoded ? JSON.parse(decoded) : null;
  } catch {
    return null;
  }
}

export function normalizeRole(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  // Backward compatibility for older tokens that still emit super_admin.
  if (normalized === "super_admin") {
    return ROLES.ADMIN;
  }

  return ALLOWED_ROLES.includes(normalized) ? normalized : null;
}

export function getRoleFromClaims(claims) {
  if (!claims || typeof claims !== "object") {
    return null;
  }

  const candidates = [
    claims.role,
    claims.user_role,
    claims.userRole,
    Array.isArray(claims.roles) ? claims.roles[0] : null,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role) {
      return role;
    }
  }

  return null;
}

export function getRoleFromToken(token) {
  return getRoleFromClaims(decodeJwtPayload(token));
}

export function getClinicIdFromToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const claims = decodeJwtPayload(token);
  if (!claims || typeof claims !== "object") {
    return null;
  }

  return claims.clinic_id || claims.clinicId || null;
}

export function getUserIdFromToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const claims = decodeJwtPayload(token);
  if (!claims || typeof claims !== "object") {
    return null;
  }

  return claims.sub || claims.user_id || claims.userId || null;
}

export function getHomeRouteForRole(role) {
  if (role === ROLES.PATIENT) {
    return "/";
  }
  if (role === ROLES.DOCTOR) {
    return "/doctor/dashboard";
  }
  if (isClinicRole(role)) {
    return "/admin/clinic/dashboard";
  }
  if (role === ROLES.ADMIN) {
    return "/admin/super/dashboard";
  }
  return "/access-denied";
}

export function isAllowedRole(role, allowedRoles = []) {
  const normalized = normalizeRole(role);
  return Boolean(normalized && allowedRoles.includes(normalized));
}

export function isClinicRole(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.CLINIC_ADMIN || normalized === ROLES.CLINIC_STAFF;
}
