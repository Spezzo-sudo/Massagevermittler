type NotificationChannel = 'email' | 'whatsapp';

type NotificationPayload = {
  recipient: string;
  subject: string;
  message: string;
};

/** Dispatches transactional notifications (mock implementation for now). */
export async function sendNotification(channel: NotificationChannel, payload: NotificationPayload) {
  console.info(`Would send ${channel} notification to ${payload.recipient}: ${payload.subject}`);
  return { success: true };
}
