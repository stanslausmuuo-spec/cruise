import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, otp: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: "Cruise <noreply@cruise.app>",
      to: email,
      subject: "Your Cruise Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C9A84C 0%, #B8860B 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Cruise</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0; font-size: 16px;">Premium P2P Car Rental</p>
            </div>
            <div style="background: #ffffff; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
              <p style="color: #4a4a6a; margin: 0 0 24px; font-size: 16px;">
                Welcome to Cruise! Please use the verification code below to complete your registration.
              </p>
              <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #e9ecef;">
                <span style="font-size: 36px; font-weight: 700; color: #C9A84C; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              <p style="color: #4a4a6a; margin: 24px 0 0; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 32px 0;">
              <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
                © 2024 Cruise. All rights reserved.<br>
                Premium P2P Car Rental Marketplace
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: "Cruise <noreply@cruise.app>",
      to: email,
      subject: "Reset Your Cruise Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C9A84C 0%, #B8860B 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Cruise</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0; font-size: 16px;">Premium P2P Car Rental</p>
            </div>
            <div style="background: #ffffff; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="color: #4a4a6a; margin: 0 0 24px; font-size: 16px;">
                You requested to reset your password. Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C 0%, #B8860B 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #4a4a6a; margin: 24px 0 0; font-size: 14px;">
                This link will expire in <strong>1 hour</strong>. If you didn't request this, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 32px 0;">
              <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
                © 2024 Cruise. All rights reserved.<br>
                Premium P2P Car Rental Marketplace
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}