/**
 * Twilio Service for SMS and Voice functionality
 * Uses direct Twilio REST API calls instead of SDK
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const TWILIO_API_URL = "https://api.twilio.com/2010-04-01";

/**
 * Send an SMS message using Twilio REST API
 */
export async function sendSMS(to: string, body: string): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return {
      success: false,
      error: "Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.local"
    };
  }

  if (!to || !/^\+[1-9]\d{1,14}$/.test(to)) {
    return {
      success: false,
      error: "Invalid phone number format. Use E.164 format (e.g., +1234567890)"
    };
  }

  if (!body || body.trim().length === 0) {
    return {
      success: false,
      error: "Message body cannot be empty"
    };
  }

  const messageBody = body.length > 160 ? body.substring(0, 157) + "..." : body;

  try {
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", twilioPhoneNumber);
    formData.append("Body", messageBody);

    const response = await fetch(`${TWILIO_API_URL}/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to send SMS"
      };
    }

    console.log(`SMS sent successfully: ${data.sid}`);
    return {
      success: true,
      messageSid: data.sid
    };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS"
    };
  }
}

/**
 * Initiate an outbound phone call
 */
export async function makeCall(to: string, twimlUrl?: string): Promise<{ success: boolean; callSid?: string; error?: string }> {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return {
      success: false,
      error: "Twilio not configured"
    };
  }

  if (!to || !/^\+[1-9]\d{1,14}$/.test(to)) {
    return {
      success: false,
      error: "Invalid phone number format"
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", twilioPhoneNumber);
    formData.append("Twiml", twimlUrl || `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello. This is a call from Elevare Sales OS. Please hold.</Say>
</Response>`);

    const response = await fetch(`${TWILIO_API_URL}/Accounts/${accountSid}/Calls.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to initiate call"
      };
    }

    return {
      success: true,
      callSid: data.sid
    };
  } catch (error) {
    console.error("Failed to initiate call:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate call"
    };
  }
}

/**
 * Send a welcome SMS to a new lead
 */
export async function sendWelcomeSMS(phone: string, firstName: string): Promise<{ success: boolean; error?: string }> {
  const message = `Hi ${firstName}! Thanks for your interest in life insurance. I'm here to help you find the perfect coverage for your family. Looking forward to our conversation!`;
  const result = await sendSMS(phone, message);
  return { success: result.success, error: result.error };
}

/**
 * Send an appointment reminder SMS
 */
export async function sendAppointmentReminder(phone: string, leadName: string, dateTime: string, location?: string): Promise<{ success: boolean; error?: string }> {
  let message = `Hi ${leadName}! Reminder: You have an appointment for ${dateTime}.`;
  if (location) message += ` Location: ${location}`;
  message += " Reply CONFIRM to confirm.";
  const result = await sendSMS(phone, message);
  return { success: result.success, error: result.error };
}

/**
 * Send a follow-up SMS after a call
 */
export async function sendFollowUpSMS(phone: string, leadName: string): Promise<{ success: boolean; error?: string }> {
  const message = `Hi ${leadName}, thanks for taking my call today! I'll send over some quotes for you to review. Feel free to call or text if you have questions.`;
  const result = await sendSMS(phone, message);
  return { success: result.success, error: result.error };
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
