import sgMail from '@sendgrid/mail';

// Initialize SendGrid with the API key from environment variables
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn("SENDGRID_API_KEY is not defined in the environment variables.");
}

export interface MailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

/**
 * Generic function to send an email using SendGrid.
 */
export const sendMail = async ({ to, subject, html, text }: MailOptions) => {
    if (!process.env.SENDGRID_FROM_EMAIL) {
        throw new Error('SENDGRID_FROM_EMAIL is not configured.');
    }

    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email successfully sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        if (error instanceof Error && 'response' in error) {
            console.error((error as any).response.body);
        }
        return { success: false, error: 'Failed to send email.' };
    }
};

/**
 * Template for a test email
 */
export const sendTestEmail = async (to: string) => {
    const subject = 'Test Email from Skillprint';
    const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #ea580c;">Hello from Skillprint!</h2>
      <p>This is a test email sent using Twilio SendGrid.</p>
      <p>If you are seeing this formatted text, HTML email support is working perfectly!</p>
      <br />
      <p>Best regards,<br/>The Skillprint Team</p>
    </div>
  `;
    const text = `
    Hello from Skillprint!
    
    This is a test email sent using Twilio SendGrid.
    If you are seeing this raw text, the fallback text email support is working perfectly!
    
    Best regards,
    The Skillprint Team
  `;

    return sendMail({ to, subject, html, text });
};
