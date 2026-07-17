import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/client";

// GET /api/appointments - Get appointments for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id") || user.id;
    const status = searchParams.get("status");
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");
    const leadId = searchParams.get("lead_id");

    let query = supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    if (fromDate) {
      query = query.gte("start_time", fromDate);
    }

    if (toDate) {
      query = query.lte("start_time", toDate);
    }

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ appointments: data });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lead_id, appointment_type, start_time, end_time, location, notes } = body;

    if (!lead_id || !appointment_type || !start_time || !end_time) {
      return NextResponse.json(
        { error: "lead_id, appointment_type, start_time, and end_time are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        lead_id,
        user_id: user.id,
        appointment_type,
        start_time,
        end_time,
        location: location || null,
        notes: notes || null,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PATCH /api/appointments - Update an appointment
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, appointment_type, start_time, end_time, location, notes, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("appointments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (appointment_type) updateData.appointment_type = appointment_type;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const { data, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ appointment: data });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
