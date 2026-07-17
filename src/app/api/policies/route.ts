import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/client";

// GET /api/policies - Get policies for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("lead_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    if (status) {
      query = query.eq("policy_status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ policies: data });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

// POST /api/policies - Create a new policy
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lead_id, carrier, product_type, face_amount, annual_premium, application_date, issue_date } = body;

    if (!lead_id || !carrier || !product_type || !face_amount || !annual_premium) {
      return NextResponse.json(
        { error: "lead_id, carrier, product_type, face_amount, and annual_premium are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("policies")
      .insert({
        lead_id,
        carrier,
        product_type,
        face_amount,
        annual_premium,
        application_date: application_date || null,
        issue_date: issue_date || null,
        policy_status: issue_date ? "active" : "pending",
        chargeback_risk: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ policy: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
