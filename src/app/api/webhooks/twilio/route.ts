import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/webhooks/twilio - Handle Twilio webhooks
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;
    const recordingUrl = formData.get("RecordingUrl") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;

    console.log("Twilio webhook received:", {
      callSid,
      callStatus,
      callDuration,
      recordingUrl,
      from,
      to,
    });

    // Handle different call statuses
    switch (callStatus) {
      case "completed":
        // Update call record with duration and recording
        if (callSid) {
          await supabase
            .from("calls")
            .update({
              duration_seconds: callDuration ? parseInt(callDuration) : null,
              recording_url: recordingUrl,
            })
            .eq("twilio_call_sid", callSid);
        }
        break;

      case "no-answer":
      case "busy":
      case "failed":
        // Log missed call activity and trigger automation
        console.log(`Call ${callSid} ended with status: ${callStatus}`);
        // Here you would trigger the "missed call" automation workflow
        break;

      default:
        console.log(`Unhandled call status: ${callStatus}`);
    }

    // Return 200 to acknowledge receipt
    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
