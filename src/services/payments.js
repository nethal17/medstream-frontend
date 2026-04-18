import api from "@/services/api";

/**
 * Initiate a Stripe Checkout session for a pending payment.
 * @param {string} paymentId - UUID of the payment record
 * @returns {{ payment_id, gateway_url, transaction_reference, expires_at }}
 */
export async function initiatePayment(paymentId) {
  const { data } = await api.post(`/payments/${paymentId}/initiate`);
  return data;
}

/**
 * Fetch the payment record associated with an appointment.
 * @param {string} appointmentId - UUID of the appointment
 * @returns {object} PaymentResponse
 */
export async function getPaymentByAppointment(appointmentId) {
  const { data } = await api.get(`/payments/appointment/${appointmentId}`);
  return data;
}

/**
 * Fetch a single payment by its ID.
 * @param {string} paymentId - UUID of the payment
 * @returns {object} PaymentResponse
 */
export async function getPayment(paymentId) {
  const { data } = await api.get(`/payments/${paymentId}`);
  return data;
}

/**
 * (Dev only) Mock-confirm or mock-fail a payment when Stripe mock mode is on.
 * @param {string} paymentId - UUID of the payment
 * @param {"success"|"fail"} action
 */
export async function mockConfirmPayment(paymentId, action = "success") {
  const { data } = await api.post("/payments/mock-confirm", {
    payment_id: paymentId,
    action,
  });
  return data;
}

/**
 * Manually verify a Stripe/Mock session for immediate confirmation.
 * @param {string} sessionId - Checkout Session ID
 * @returns {{ status, payment_id }}
 */
export async function verifyPaymentSession(sessionId) {
  const { data } = await api.post(`/payments/verify-session/${sessionId}`);
  return data;
}

/**
 * Fetch financial summary for the currently logged-in doctor.
 * @returns {object} MyEarningsSummary
 */
export async function getDoctorEarnings() {
  const { data } = await api.get("/payments/summaries/my-earnings");
  return data;
}

/**
 * Fetch platform-wide financial summary (Admin only).
 * @returns {object} PlatformSummary
 */
export async function getPlatformSummary() {
  const { data } = await api.get("/payments/summaries/platform");
  return data;
}

/**
 * Fetch financial summary for the given clinic.
 * @param {object} params - query params (from_date, to_date)
 * @returns {object} ClinicSummary
 */
export async function getClinicSummary(params) {
  const { data } = await api.get("/payments/summaries/clinic", { params });
  return data;
}
