/**
 * Notification service - high-level API for sending typed notifications
 */

import { sendNotification } from '../notifications';
import {
  bookingConfirmationEmail,
  therapistNewBookingEmail,
  therapistApplicationApprovedEmail,
  bookingConfirmationWhatsApp,
  therapistBookingAcceptanceWhatsApp,
  type BookingConfirmationData,
  type TherapistNewBookingData,
  type TherapistApplicationApprovedData,
} from './templates';

/**
 * Notify customer that booking is confirmed
 */
export async function notifyBookingConfirmed(email: string, data: BookingConfirmationData) {
  const template = bookingConfirmationEmail(data);
  await sendNotification('email', {
    recipient: email,
    ...template,
  });
  console.info('[Notification] Booking confirmation email sent', { email, bookingId: data.bookingId });
}

/**
 * Notify customer via WhatsApp that booking is confirmed
 */
export async function notifyBookingConfirmedWhatsApp(phoneNumber: string, data: BookingConfirmationData) {
  const template = bookingConfirmationWhatsApp(data);
  await sendNotification('whatsapp', {
    recipient: phoneNumber,
    ...template,
  });
  console.info('[Notification] Booking confirmation WhatsApp sent', { phoneNumber, bookingId: data.bookingId });
}

/**
 * Notify therapist of new booking request
 */
export async function notifyTherapistNewBooking(email: string, data: TherapistNewBookingData) {
  const template = therapistNewBookingEmail(data);
  await sendNotification('email', {
    recipient: email,
    ...template,
  });
  console.info('[Notification] New booking email sent to therapist', { email });
}

/**
 * Notify therapist of accepted booking via WhatsApp
 */
export async function notifyTherapistBookingAcceptanceWhatsApp(
  phoneNumber: string,
  data: { customerName: string; appointmentDate: string; appointmentTime: string }
) {
  const template = therapistBookingAcceptanceWhatsApp(data);
  await sendNotification('whatsapp', {
    recipient: phoneNumber,
    ...template,
  });
  console.info('[Notification] Booking acceptance WhatsApp sent to therapist', { phoneNumber });
}

/**
 * Notify therapist that application was approved
 */
export async function notifyTherapistApplicationApproved(email: string, data: TherapistApplicationApprovedData) {
  const template = therapistApplicationApprovedEmail(data);
  await sendNotification('email', {
    recipient: email,
    ...template,
  });
  console.info('[Notification] Application approved email sent', { email });
}

/**
 * Generic notification sender for custom messages
 */
export async function sendCustomEmail(email: string, subject: string, htmlContent: string, textContent?: string) {
  await sendNotification('email', {
    recipient: email,
    subject,
    htmlContent,
    textContent,
  });
  console.info('[Notification] Custom email sent', { email, subject });
}

/**
 * Generic WhatsApp sender
 */
export async function sendCustomWhatsApp(phoneNumber: string, message: string) {
  await sendNotification('whatsapp', {
    recipient: phoneNumber,
    message,
  });
  console.info('[Notification] Custom WhatsApp sent', { phoneNumber });
}

/**
 * Batch send notifications with error handling and retry logic
 */
export async function sendNotificationBatch(notifications: Array<{ type: 'email' | 'whatsapp'; send: () => Promise<any> }>, maxRetries = 3) {
  const results = [];

  for (const notification of notifications) {
    let retries = 0;
    let lastError: any;

    while (retries < maxRetries) {
      try {
        const result = await notification.send();
        results.push({ success: true, result });
        break;
      } catch (error) {
        lastError = error;
        retries++;
        if (retries < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries - 1) * 1000));
        }
      }
    }

    if (retries === maxRetries) {
      results.push({ success: false, error: lastError });
    }
  }

  return results;
}
