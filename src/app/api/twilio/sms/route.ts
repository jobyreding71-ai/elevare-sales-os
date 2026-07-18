import { NextResponse } from "next/server";
import { sendSMS, sendWelcomeSMS, sendAppointmentReminder, sendFollowUpSMS } from "@/lib/services/twilio";

// POST /api/twilio/sms - Send an SMS message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, type } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    if (!message && !type) {
      return NextResponse.json(
        { error: "Either message content or message type is required" },
        { status: 400 }
      );
    }

    let result;

    // Handle different message types
    switch (type) {
      case "welcome":
        if (!body.firstName) {
          return NextResponse.json(
            { error: "First name is required for welcome message" },
            { status: 400 }
          );
        }
        result = await sendWelcomeSMS(to, body.firstName);
        break;

      case "appointment_reminder":
        if (!body.dateTime) {
          return NextResponse.json(
            { error: "Date/time is required for appointment reminder" },
            { status: 400 }
          );
        }
        result = await sendAppointmentReminder(to, body.leadName || "there", body.dateTime, body.location);
        break;

      case "follow_up":
        result = await sendFollowUpSMS(to, body.leadName || "there");
        break;

      default:
        // Custom message
        if (!message) {
          return NextResponse.json(
            { error: "Message content is required" },
            { status: 400 }
          );
        }
        result = await sendSMS(to, message);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully"
    });

  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}

// GET /api/twilio/sms - Health check
export async function GET() {
  const { isTwilioConfigured } = await import("@/lib/services/twilio");

  return NextResponse.json({
    status: "ok",
    twilio_configured: isTwilioConfigured()
  });
}
