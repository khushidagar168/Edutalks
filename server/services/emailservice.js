// server/services/emailService.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - EduTalks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #334155;">
              Hello ${fullName},
            </p>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #334155;">
              You requested a password reset for your EduTalks account. Use the OTP below to reset your password:
            </p>
            
            <div style="background-color: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="margin: 0; font-size: 32px; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </h2>
            </div>
            
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">
              This OTP is valid for 10 minutes only. If you didn't request this password reset, please ignore this email.
            </p>
            
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">
              For security reasons, do not share this OTP with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              This is an automated email from EduTalks. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful - EduTalks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Successful</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #334155;">
              Hello ${fullName},
            </p>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #334155;">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              This is an automated email from EduTalks. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};