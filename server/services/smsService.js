import twilio from 'twilio';
import AWS from 'aws-sdk';

// Configuration - load from environment variables
const SMS_PROVIDER = 'twilio'; // 'twilio' or 'aws'

// Twilio Configuration
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// AWS SNS Configuration
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Initialize clients
let twilioClient;
let snsClient;

if (SMS_PROVIDER === 'twilio' && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else if (SMS_PROVIDER === 'aws' && AWS_REGION) {
  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  });
  snsClient = new AWS.SNS({ apiVersion: '2010-03-31' });
}

/**
 * Send SMS using configured provider
 * @param {string} to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} message - SMS message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendSMS = async (to, message) => {
  // Basic validation
  if (!to || !message) {
    return { success: false, error: 'Recipient and message are required' };
  }

  // Clean phone number (remove all non-digit characters except leading +)
  const cleanedTo = to.replace(/(?!^\+)\D/g, '');

  try {
    if ( twilioClient) {
      // Send via Twilio
      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: cleanedTo
      });
      
      return { 
        success: true, 
        messageId: result.sid,
        provider: 'twilio'
      };
    } else if (SMS_PROVIDER === 'aws' && snsClient) {
      // Send via AWS SNS
      const params = {
        Message: message,
        PhoneNumber: cleanedTo
      };
      
      const result = await snsClient.publish(params).promise();
      
      return { 
        success: true, 
        messageId: result.MessageId,
        provider: 'aws'
      };
    } else {
      // No provider configured - log to console (for development)
      console.log(`[DEV SMS] To: ${cleanedTo}, Message: ${message}`);
      return { 
        success: true, 
        messageId: 'simulated-' + Math.random().toString(36).substring(2, 9),
        provider: 'simulated'
      };
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send SMS',
      provider: SMS_PROVIDER
    };
  }
};

/**
 * Format OTP message
 * @param {string} otp - The OTP code
 * @param {string} appName - Your application name
 * @param {number} expiryMinutes - OTP expiry time in minutes
 * @returns {string} Formatted SMS message
 */
export const formatOTPMessage = (otp, appName = 'EduTalks', expiryMinutes = 10) => {
  return `${appName} verification code: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
};

/**
 * Check if SMS service is properly configured
 * @returns {boolean}
 */
export const isSMSConfigured = () => {
  if (SMS_PROVIDER === 'twilio') {
    return !!TWILIO_ACCOUNT_SID && !!TWILIO_AUTH_TOKEN && !!TWILIO_PHONE_NUMBER;
  } else if (SMS_PROVIDER === 'aws') {
    return !!AWS_REGION && !!AWS_ACCESS_KEY_ID && !!AWS_SECRET_ACCESS_KEY;
  }
  return false;
};

// Helper function to validate phone number format
export const isValidPhoneNumber = (phone) => {
  // Basic international phone number validation (E.164 format)
  const regex = /^\+[1-9]\d{1,14}$/;
  return regex.test(phone);
};