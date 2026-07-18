import { NextResponse } from "next/server";

// POST /api/twilio/voice - Handle incoming/outgoing Twilio voice calls with Media Streams
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;

    console.log("Voice call initiated:", { callSid, from, to });

    // Get the base URL for WebSocket connection
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "ws" : "wss";
    const baseUrl = `https://${host}`;

    // TwiML response with Media Streams enabled
    // This streams audio to our WebSocket server for real-time processing
    const twiml = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${protocol}://${host}/api/twilio/stream"
            track="inbound_track"
            status="on">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="direction" value="inbound" />
    </Stream>
  </Start>
  <Say voice="alice">Connecting your call with AI sales assistant. Please wait.</Say>
  <Dial>
    <Number>${to}</Number>
  </Dial>
</Response>`.trim();

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error in voice handler:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">An error occurred. Please try again.</Say>
  <Hangup />
</Response>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }
}

// GET /api/twilio/voice - TwiML for initiating outbound calls
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get("phone");
  const leadId = searchParams.get("leadId");

  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "ws" : "wss";

  const twiml = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${protocol}://${host}/api/twilio/stream?leadId=${leadId}"
            track="both_tracks"
            status="on">
      <Parameter name="leadId" value="${leadId || ""}" />
      <Parameter name="direction" value="outbound" />
    </Stream>
  </Start>
  <Say voice="alice">Connecting your call. Please speak clearly.</Say>
  <Dial record="record-from-ringing" recordingStatusCallback="/api/webhooks/twilio">
    <Number statusCallbackEvent="initiated ringing completed"
            statusCallback="${protocol}://${host}/api/webhooks/twilio">
      ${phoneNumber}
    </Number>
  </Dial>
</Response>`.trim();

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
