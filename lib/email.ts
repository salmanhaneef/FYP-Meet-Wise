// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationParams {
  to: string;
  participantName?: string;
  meetingTitle: string;
  meetingDate: Date;
  meetingDuration: number;
  meetingLink: string;
  hostName: string;
}

export async function sendMeetingInvitation({
  to,
  participantName,
  meetingTitle,
  meetingDate,
  meetingDuration,
  meetingLink,
  hostName,
}: SendInvitationParams) {
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Meeting Invitation</h1>
        </div>
        <div class="content">
          <p>Hi ${participantName || 'there'},</p>
          <p><strong>${hostName}</strong> has invited you to join a meeting:</p>
          
          <div class="details">
            <div class="detail-row">
              <strong>Meeting:</strong> ${meetingTitle}
            </div>
            <div class="detail-row">
              <strong>Date:</strong> ${formattedDate}
            </div>
            <div class="detail-row">
              <strong>Time:</strong> ${formattedTime}
            </div>
            <div class="detail-row">
              <strong>Duration:</strong> ${meetingDuration} minutes
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${meetingLink}" class="button">
              Join Meeting
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Or copy this link: <br/>
            <code style="background: #eee; padding: 5px 10px; border-radius: 3px;">${meetingLink}</code>
          </p>
        </div>
        <div class="footer">
          <p>This invitation was sent by ${hostName}</p>
          <p>Powered by Your Meeting App</p>
        </div>
      </div>
    </body>
    </html>
  `;

 try {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || process.env.RESEND_EMAIL || 'onboarding@resend.dev',
    to,
    subject: `Meeting Invitation: ${meetingTitle}`,
    html: emailHtml,
  });

  if (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }

  console.log('✅ Email sent successfully:', data);
  return { success: true, messageId: data.id };
} catch (error) {
  console.error('❌ Unexpected error:', error);
  return { success: false, error };
}
}