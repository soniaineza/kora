'use strict';

/**
 * SMS message templates. Pure functions so they can be unit-tested and reused
 * by both the SMS service and the notification service.
 */

function otp(code) {
  return `Kora Verification Code: ${code}. This code expires in 5 minutes.`;
}

function welcome(fullName) {
  const name = fullName ? `${fullName}, ` : '';
  return `${name}Welcome to Kora! Your driving exam preparation account is ready. Visit kora.rw to start practising.`;
}

function paymentConfirmation({ plan, amount, reference }) {
  const planPart = plan ? ` for the ${plan} package` : '';
  const refPart = reference ? ` (Ref: ${reference})` : '';
  return `Kora: Payment of ${amount} RWF${planPart} received successfully. Your package is now active${refPart}. Thank you!`;
}

function lessonReminder({ time, venue }) {
  const when = time ? ` at ${time}` : '';
  const where = venue ? ` at ${venue}` : '';
  return `Kora Reminder: You have a driving lesson${when}${where}. Please arrive on time. Reply STOP to opt out.`;
}

function examReminder({ time }) {
  const when = time ? ` scheduled for ${time}` : '';
  return `Kora Reminder: Your driving exam is${when}. Bring your ID and arrive 30 minutes early. Good luck!`;
}

function result({ score, total, passed }) {
  const verdict = passed ? 'Congratulations, you passed!' : 'Unfortunately you did not pass this time. Keep practising.';
  return `Kora Result: You scored ${score}/${total}. ${verdict}`;
}

function paymentFailed({ reason }) {
  return `Kora: Your payment could not be completed. Reason: ${reason || 'Unknown error'}. Please try again or contact support.`;
}

function subscriptionReminder({ packageName, expiresAt }) {
  const date = new Date(expiresAt).toLocaleDateString('en-RW');
  return `Kora Reminder: Your ${packageName} subscription expires on ${date}. Renew to continue accessing all features.`;
}

module.exports = { otp, welcome, paymentConfirmation, paymentFailed, subscriptionReminder, lessonReminder, examReminder, result };
