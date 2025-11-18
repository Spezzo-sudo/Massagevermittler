import sgMail from '@sendgrid/mail';

export type NotificationChannel = 'email' | 'whatsapp';

export type EmailPayload = {
  recipient: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
};

export type WhatsAppPayload = {
  recipient: string; // Phone number in format: +1234567890
  message: string;
};

export type NotificationPayload = EmailPayload | WhatsAppPayload;

/**
 * Initialize SendGrid client (singleton pattern)
 */
function getSendGridClient() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY environment variable is not set');
  }
  sgMail.setApiKey(apiKey);
  return sgMail;
}

/**
 * Send transactional email via SendGrid
 */
export async function sendEmail(payload: EmailPayload) {
  try {
    const sgClient = getSendGridClient();
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error('SENDGRID_FROM_EMAIL environment variable is not set');
    }

    const msg = {
      to: payload.recipient,
      from: fromEmail,
      subject: payload.subject,
      html: payload.htmlContent,
      text: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
    };

    const response = await sgClient.send(msg);
    console.info(`[Email] Sent to ${payload.recipient}: ${payload.subject}`, {
      messageId: response[0].headers['x-message-id'],
    });

    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('[Email Error]', {
      recipient: payload.recipient,
      subject: payload.subject,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Send WhatsApp notification via Twilio
 */
export async function sendWhatsApp(payload: WhatsAppPayload) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !whatsappNumber) {
      throw new Error('Twilio environment variables are not set');
    }

    // Twilio API call
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from: whatsappNumber, // e.g., 'whatsapp:+1234567890'
      to: `whatsapp:${payload.recipient}`, // e.g., 'whatsapp:+1234567890'
      body: payload.message,
    });

    console.info(`[WhatsApp] Sent to ${payload.recipient}`, {
      messageId: message.sid,
    });

    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('[WhatsApp Error]', {
      recipient: payload.recipient,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Main dispatcher: route to correct notification channel
 */
export async function sendNotification(channel: NotificationChannel, payload: NotificationPayload) {
  if (channel === 'email') {
    if (!('htmlContent' in payload)) {
      throw new Error('Email payload must include htmlContent');
    }
    return sendEmail(payload as EmailPayload);
  }

  if (channel === 'whatsapp') {
    if (!('message' in payload) || 'subject' in payload) {
      throw new Error('WhatsApp payload must include message and not subject');
    }
    return sendWhatsApp(payload as WhatsAppPayload);
  }

  throw new Error(`Unknown notification channel: ${channel}`);
}
