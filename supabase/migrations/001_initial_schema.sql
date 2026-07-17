-- Elevare Sales OS - Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'agent', 'manager', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    date_of_birth DATE,
    marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Separated')),
    children_count INTEGER DEFAULT 0,
    occupation TEXT,
    annual_income NUMERIC(12, 2),
    state TEXT,
    city TEXT,
    zip_code TEXT,
    lead_source TEXT,
    lead_status TEXT NOT NULL DEFAULT 'active' CHECK (lead_status IN ('active', 'inactive', 'converted', 'lost')),
    pipeline_stage TEXT NOT NULL DEFAULT 'new_lead',
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_owner_id ON leads(owner_id);
CREATE INDEX idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX idx_leads_lead_status ON leads(lead_status);
CREATE INDEX idx_leads_lead_source ON leads(lead_source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);

-- ============================================
-- CALLS TABLE
-- ============================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    twilio_call_sid TEXT,
    duration_seconds INTEGER,
    recording_url TEXT,
    transcript TEXT,
    ai_summary TEXT,
    ai_objections JSONB,
    ai_buying_signals JSONB,
    ai_next_actions JSONB,
    sentiment_score INTEGER CHECK (sentiment_score >= -100 AND sentiment_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- POLICIES TABLE
-- ============================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    carrier TEXT NOT NULL,
    product_type TEXT NOT NULL,
    face_amount NUMERIC(12, 2) NOT NULL,
    annual_premium NUMERIC(10, 2) NOT NULL,
    application_date DATE,
    issue_date DATE,
    policy_status TEXT NOT NULL DEFAULT 'pending' CHECK (policy_status IN ('pending', 'active', 'lapsed', 'cancelled', 'expired', 'in_force')),
    chargeback_risk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_lead_id ON policies(lead_id);
CREATE INDEX idx_policies_status ON policies(policy_status);
CREATE INDEX idx_policies_issue_date ON policies(issue_date);
CREATE INDEX idx_policies_carrier ON policies(carrier);

-- ============================================
-- COMMISSIONS TABLE
-- ============================================
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gross_premium NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    renewal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_date DATE,
    chargeback_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    commission_status TEXT NOT NULL DEFAULT 'pending' CHECK (commission_status IN ('pending', 'paid', 'chargeback', 'recalled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_policy_id ON commissions(policy_id);
CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(commission_status);
CREATE INDEX idx_commissions_paid_date ON commissions(paid_date);

-- ============================================
-- LEAD ACTIVITIES TABLE
-- ============================================
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'sms', 'email', 'note', 'appointment', 'application', 'ai_action', 'stage_change', 'task')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_activities_user_id ON lead_activities(user_id);
CREATE INDEX idx_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_activities_created_at ON lead_activities(created_at DESC);

-- ============================================
-- AI COACHING REPORTS TABLE
-- ============================================
CREATE TABLE ai_coaching_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    talk_ratio NUMERIC(5, 2),
    question_count INTEGER,
    objection_handling_score INTEGER CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    empathy_score INTEGER CHECK (empathy_score >= 0 AND empathy_score <= 100),
    closing_score INTEGER CHECK (closing_score >= 0 AND closing_score <= 100),
    missed_opportunities JSONB,
    recommended_improvements JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaching_call_id ON ai_coaching_reports(call_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_reports ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can see users, only admins can modify
CREATE POLICY "Users are viewable by authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Leads: Users can only see/modify their own leads, owners can see all
CREATE POLICY "Users can view their own leads" ON leads
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Users can insert their own leads" ON leads
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own leads" ON leads
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own leads" ON leads
    FOR DELETE USING (owner_id = auth.uid());

-- Calls: Users can only see their own calls
CREATE POLICY "Users can view their own calls" ON calls
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can insert their own calls" ON calls
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own calls" ON calls
    FOR UPDATE USING (user_id = auth.uid());

-- Tasks: Users can see tasks assigned to them or their leads
CREATE POLICY "Users can view relevant tasks" ON tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can insert tasks" ON tasks
    FOR INSERT WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (assigned_to = auth.uid());

-- Appointments: Similar to calls
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own appointments" ON appointments
    FOR DELETE USING (user_id = auth.uid());

-- Policies: Users can see policies for their leads
CREATE POLICY "Users can view policies for their leads" ON policies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can insert policies for their leads" ON policies
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can update policies for their leads" ON policies
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

-- Commissions: Users can only see their own commissions
CREATE POLICY "Users can view their own commissions" ON commissions
    FOR SELECT USING (user_id = auth.uid());

-- Lead Activities: Users can see activities for their leads
CREATE POLICY "Users can view activities for their leads" ON lead_activities
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can insert activities for their leads" ON lead_activities
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND owner_id = auth.uid())
    );

-- AI Coaching Reports: Viewable by call owner
CREATE POLICY "Users can view coaching reports for their calls" ON ai_coaching_reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM calls WHERE id = call_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert coaching reports for their calls" ON ai_coaching_reports
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM calls WHERE id = call_id AND user_id = auth.uid())
    );
