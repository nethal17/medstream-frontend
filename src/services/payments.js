import api from "@/services/api";

/**
 * Initiate a Stripe Checkout session for a pending payment.
 * @param {string} paymentId - UUID of the payment record
 * @returns {{ payment_id, gateway_url, transaction_reference, expires_at }}
 */
export async function initiatePayment(paymentId) {
  const { data } = await api.post(`/payments/api/payments/${paymentId}/initiate`);
  return data;
}

/**
 * Fetch the payment record associated with an appointment.
 * @param {string} appointmentId - UUID of the appointment
 * @returns {object} PaymentResponse
 */
export async function getPaymentByAppointment(appointmentId) {
  const { data } = await api.get(`/payments/api/payments/appointment/${appointmentId}`);
  return data;
}

/**
 * Fetch a single payment by its ID.
 * @param {string} paymentId - UUID of the payment
 * @returns {object} PaymentResponse
 */
export async function getPayment(paymentId) {
  const { data } = await api.get(`/payments/api/payments/${paymentId}`);
  return data;
}

/**
 * (Dev only) Mock-confirm or mock-fail a payment when Stripe mock mode is on.
 * @param {string} paymentId - UUID of the payment
 * @param {"success"|"fail"} action
 */
export async function mockConfirmPayment(paymentId, action = "success") {
  const { data } = await api.post("/payments/api/payments/mock-confirm", {
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
  const { data } = await api.post(`/payments/api/payments/verify-session/${sessionId}`);
  return data;
}
