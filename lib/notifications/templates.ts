/**
 * Email templates for various notification types
 */

export interface BookingConfirmationData {
  customerName: string;
  serviceName: string;
  therapistName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  amount: number;
  currency: string;
  bookingId: string;
  cancelUrl?: string;
}

export function bookingConfirmationEmail(data: BookingConfirmationData) {
  return {
    subject: `Buchung bestätigt #${data.bookingId}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; line-height: 1.6; }
            .detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Massage gebucht!</h1>
            </div>

            <div class="content">
              <p>Hallo ${data.customerName},</p>
              <p>deine Massage ist bestätigt. Ein Therapeut wird dir WhatsApp-Meldung (und eine SMS falls nötig) erhalten:</p>

              <div class="detail">
                <strong>Service:</strong>
                <span>${data.serviceName}</span>
              </div>
              <div class="detail">
                <strong>Therapeut:in:</strong>
                <span>${data.therapistName}</span>
              </div>
              <div class="detail">
                <strong>Datum:</strong>
                <span>${data.appointmentDate}</span>
              </div>
              <div class="detail">
                <strong>Uhrzeit:</strong>
                <span>${data.appointmentTime}</span>
              </div>
              <div class="detail">
                <strong>Ort:</strong>
                <span>${data.location}</span>
              </div>

              <div class="amount">
                ${data.amount} ${data.currency}
              </div>

              <p style="background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <strong>Was kommt jetzt?</strong><br>
                1. Wir suchen den besten Therapeuten/die beste Therapeutin in deiner Nähe<br>
                2. Du erhältst eine Bestätigung per WhatsApp (ca. 5-10 Min)<br>
                3. Die Massage beginnt zur vereinbarten Zeit
              </p>

              ${data.cancelUrl ? `
                <p style="text-align: center;">
                  <a href="${data.cancelUrl}" style="color: #ef4444;">Diese Buchung stornieren</a>
                </p>
              ` : ''}
            </div>

            <div class="footer">
              <p>Island Massage Delivery – Ko Phangan<br>
              Diese Nachricht wurde automatisch generiert. Bitte nicht antworten.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `Massage gebucht!\n\nService: ${data.serviceName}\nTherapeutin: ${data.therapistName}\nDatum: ${data.appointmentDate}\nUhrzeit: ${data.appointmentTime}\nOrt: ${data.location}\nPreis: ${data.amount} ${data.currency}`,
  };
}

export interface TherapistNewBookingData {
  therapistName: string;
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  notes?: string;
  acceptUrl?: string;
  declineUrl?: string;
}

export function therapistNewBookingEmail(data: TherapistNewBookingData) {
  return {
    subject: `Neue Massage-Anfrage: ${data.customerName}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; line-height: 1.6; }
            .detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .buttons { display: flex; gap: 12px; margin: 20px 0; }
            .button { flex: 1; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; font-weight: bold; }
            .accept { background: #10b981; color: white; }
            .decline { background: #ef4444; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Neue Buchungsanfrage!</h1>
            </div>

            <div class="content">
              <p>Hallo ${data.therapistName},</p>
              <p>${data.customerName} hat deine Dienste angefordert:</p>

              <div class="detail">
                <strong>Service:</strong>
                <span>${data.serviceName}</span>
              </div>
              <div class="detail">
                <strong>Datum:</strong>
                <span>${data.appointmentDate}</span>
              </div>
              <div class="detail">
                <strong>Uhrzeit:</strong>
                <span>${data.appointmentTime}</span>
              </div>
              <div class="detail">
                <strong>Ort:</strong>
                <span>${data.location}</span>
              </div>

              ${data.notes ? `
                <p><strong>Notizen vom Kunden:</strong><br>
                "${data.notes}"</p>
              ` : ''}

              <div class="buttons">
                ${data.acceptUrl ? `
                  <a href="${data.acceptUrl}" class="button accept">✓ Annehmen</a>
                ` : ''}
                ${data.declineUrl ? `
                  <a href="${data.declineUrl}" class="button decline">✗ Ablehnen</a>
                ` : ''}
              </div>

              <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
                Bitte antworte so schnell wie möglich, damit wir keinen anderen Therapeuten/andere Therapeutin zuweisen müssen!
              </p>
            </div>

            <div style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Island Massage Delivery – Ko Phangan<br>
              Diese Nachricht wurde automatisch generiert.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export interface TherapistApplicationApprovedData {
  therapistName: string;
  profileUrl?: string;
}

export function therapistApplicationApprovedEmail(data: TherapistApplicationApprovedData) {
  return {
    subject: 'Dein Profil wurde freigeschaltet! 🎉',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; line-height: 1.6; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Willkommen bei Island Massage Delivery!</h1>
            </div>

            <div class="content">
              <p>Hallo ${data.therapistName},</p>
              <p>dein Profil wurde überprüft und freigeschalten! Du kannst jetzt Buchungen erhalten.</p>

              <p>Die nächsten Schritte:</p>
              <ul>
                <li>Ergänze deine Services und Verfügbarkeit im Portal</li>
                <li>Warte auf die ersten Anfragen – wir senden sie per Email</li>
                <li>Akzeptiere oder lehne Anfragen ab – schnell reagieren ist wichtig!</li>
              </ul>

              ${data.profileUrl ? `
                <p style="text-align: center;">
                  <a href="${data.profileUrl}" class="button">Zum Profil-Portal →</a>
                </p>
              ` : ''}

              <p style="background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <strong>Wichtig:</strong> Halte dein Profil und deine Verfügbarkeit aktuell, damit Kunden dich finden können!
              </p>
            </div>

            <div style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Island Massage Delivery – Ko Phangan<br>
              Diese Nachricht wurde automatisch generiert.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * WhatsApp message templates
 */

export function bookingConfirmationWhatsApp(data: BookingConfirmationData) {
  return {
    message: `✓ Deine Massage ist gebucht! 🧘\n\n📅 ${data.appointmentDate} um ${data.appointmentTime}\n🧖 ${data.serviceName}\n💶 ${data.amount} ${data.currency}\n\nDu erhältst gleich die Bestätigung des/der Therapeuten per WhatsApp. Fragen? Antworte auf diese Nachricht!`,
  };
}

export function therapistBookingAcceptanceWhatsApp(data: { customerName: string; appointmentDate: string; appointmentTime: string }) {
  return {
    message: `✓ ${data.customerName} wartet auf dich!\n\n📅 ${data.appointmentDate}\n🕐 ${data.appointmentTime}\n\nBitte rechtzeitig ankommen und Set mitbringen. Viel Erfolg! 💪`,
  };
}
