export function toApiDate(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    return parsed.toISOString().slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

export function formatDisplayDate(value) {
  if (!value) {
    return "-";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeLabel(time24h) {
  if (!time24h) {
    return "-";
  }

  const [hours, minutes] = String(time24h).split(":");
  if (hours == null || minutes == null) {
    return time24h;
  }

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatConsultationType(type) {
  if (!type) {
    return "-";
  }

  return type === "telemedicine" ? "Telemedicine" : "In-person";
}

export function formatCurrencyLkr(amount) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return "Rs 0.00";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(numeric);
}

export function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `booking_${crypto.randomUUID()}`;
  }

  return `booking_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getAppointmentStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (["confirmed", "arrived"].includes(normalized)) {
    return "bg-blue-100/70 text-blue-700";
  }
  if (["completed"].includes(normalized)) {
    return "bg-emerald-100/70 text-emerald-700";
  }
  if (["pending_payment", "pending"].includes(normalized)) {
    return "bg-amber-100/70 text-amber-700";
  }

  return "bg-rose-100/70 text-rose-700";
}

function formatValidationDetail(detail) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (typeof item === "object" && item !== null) {
          if (item.msg) {
            return item.msg;
          }
          return JSON.stringify(item);
        }
        return String(item);
      })
      .join(". ");
  }

  if (typeof detail === "object" && detail !== null) {
    if (detail.msg) {
      return detail.msg;
    }
    return JSON.stringify(detail);
  }

  return null;
}

export function extractApiErrorMessage(error, fallback = "Request failed. Please try again.") {
  const data = error?.response?.data;
  const detailMessage = formatValidationDetail(data?.detail);
  const errorsMessage = formatValidationDetail(data?.errors);

  return (
    detailMessage ||
    data?.message ||
    data?.error ||
    errorsMessage ||
    fallback
  );
}

export function toPositiveInt(value, defaultValue) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
}
