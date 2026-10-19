-- SmartCRM PostgreSQL Relational Schema DDL
-- Phase 1: Database Architecture Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if re-initializing (in dependency order)
DROP TABLE IF EXISTS predictive_scores CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users & RBAC
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'sales_rep',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Customers / Accounts
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    health_score INTEGER NOT NULL DEFAULT 80 CHECK (health_score BETWEEN 0 AND 100),
    churn_risk VARCHAR(20) NOT NULL DEFAULT 'Low',
    sentiment VARCHAR(20) NOT NULL DEFAULT 'Positive',
    mrr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_company ON customers(company);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_health ON customers(health_score);
CREATE INDEX idx_customers_churn ON customers(churn_risk);

-- 3. Deals / Pipeline Opportunities
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(50) NOT NULL DEFAULT 'Lead',
    win_probability INTEGER NOT NULL DEFAULT 20 CHECK (win_probability BETWEEN 0 AND 100),
    expected_close_date TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_stage ON deals(stage);

-- 4. Multichannel Interactions
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL, -- Email, Chat, Call, Meeting, Note
    direction VARCHAR(20) NOT NULL DEFAULT 'Inbound', -- Inbound, Outbound
    subject VARCHAR(255),
    raw_content TEXT NOT NULL,
    summary TEXT,
    sentiment_score NUMERIC(4, 3) NOT NULL DEFAULT 0.000, -- -1.000 to +1.000
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_customer ON interactions(customer_id);
CREATE INDEX idx_interactions_channel ON interactions(channel);
CREATE INDEX idx_interactions_created ON interactions(created_at DESC);

-- 5. Activities & Tasks
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'Task', -- Task, Call, Meeting, Email
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Cancelled
    priority VARCHAR(20) NOT NULL DEFAULT 'Normal', -- Normal, High, Urgent
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_customer ON activities(customer_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_due ON activities(due_date);

-- 6. Predictive AI Scores & Audits
CREATE TABLE predictive_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    lead_score NUMERIC(5, 2) NOT NULL,
    churn_probability NUMERIC(4, 3) NOT NULL,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0-scikit',
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictive_customer ON predictive_scores(customer_id);
CREATE INDEX idx_predictive_generated ON predictive_scores(generated_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_modtime
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_deals_modtime
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
