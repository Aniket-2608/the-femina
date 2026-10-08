import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

export const getMailTransporter = async () => {
  if (transporter) return transporter;

  if (ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } else {
    // Ethereal test account for local development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Mailer] Ethereal local test email account configured: ${testAccount.user}`);
  }

  return transporter;
};

export const sendEmailOtp = async (toEmail: string, otp: string, userName: string = 'Valued Customer') => {
  try {
    const mailer = await getMailTransporter();
    const info = await mailer.sendMail({
      from: ENV.EMAIL_FROM,
      to: toEmail,
      subject: 'Your Verification Code — The Femina Exclusive',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: auto; padding: 30px; border: 1px solid #EABFB7; border-radius: 8px; background-color: #FAF7F2;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4A0E17; font-family: 'Georgia', serif; letter-spacing: 2px; margin-bottom: 4px;">THE FEMINA EXCLUSIVE</h1>
            <p style="color: #8C382D; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Haute Couture & Luxury Female Fashion</p>
          </div>
          <div style="background-color: #ffffff; padding: 25px; border-radius: 6px; box-shadow: 0 4px 12px rgba(74, 14, 23, 0.05);">
            <p style="color: #333333; font-size: 15px;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #555555; font-size: 14px; line-height: 1.6;">Thank you for choosing The Femina Exclusive. Please use the verification code below to confirm your account and proceed with your luxury shopping experience:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4A0E17; background-color: #FAF0EE; padding: 12px 28px; border-radius: 6px; border: 1px dashed #C96859; display: inline-block;">${otp}</span>
            </div>
            <p style="color: #777777; font-size: 12px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not initiate this request, please disregard this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #888888; font-size: 11px;">
            <p>© 2026 The Femina Exclusive. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mailer] OTP email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer] Failed to send email OTP:', error);
    return false;
  }
};
