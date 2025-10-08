-- =============================================
-- Initial Schema Migration
-- Account Strategy Planning Tool
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS accounts_created_at_idx ON public.accounts(created_at DESC);
CREATE INDEX IF NOT EXISTS accounts_name_idx ON public.accounts(name);

-- =============================================
-- STRATEGIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
  inputs JSONB NULL,
  priorities JSONB NULL,
  key_assets JSONB NULL,
  opportunities JSONB NULL,
  contacts JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS strategies_account_id_idx ON public.strategies(account_id);
CREATE INDEX IF NOT EXISTS strategies_user_id_idx ON public.strategies(user_id);
CREATE INDEX IF NOT EXISTS strategies_status_idx ON public.strategies(status);
CREATE INDEX IF NOT EXISTS strategies_created_at_idx ON public.strategies(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on both tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ACCOUNTS TABLE POLICIES
-- =============================================

-- Allow anonymous users to read all accounts (for prototype)
CREATE POLICY "Allow anonymous read access to accounts"
  ON public.accounts
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert accounts (for prototype)
CREATE POLICY "Allow anonymous insert access to accounts"
  ON public.accounts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users full access to accounts
CREATE POLICY "Allow authenticated users full access to accounts"
  ON public.accounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- STRATEGIES TABLE POLICIES
-- =============================================

-- Allow anonymous users to read all strategies (for prototype)
CREATE POLICY "Allow anonymous read access to strategies"
  ON public.strategies
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert strategies (for prototype)
CREATE POLICY "Allow anonymous insert access to strategies"
  ON public.strategies
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update strategies (for prototype)
CREATE POLICY "Allow anonymous update access to strategies"
  ON public.strategies
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users full access to strategies
CREATE POLICY "Allow authenticated users full access to strategies"
  ON public.strategies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS (Optional)
-- =============================================

-- Function to update updated_at timestamp (if needed later)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Insert sample accounts
INSERT INTO public.accounts (name) VALUES
  ('Johnson & Johnson'),
  ('Pfizer Inc.'),
  ('Merck & Co.'),
  ('AbbVie Inc.'),
  ('Bristol-Myers Squibb')
ON CONFLICT DO NOTHING;

-- Insert sample strategy (linked to first account)
INSERT INTO public.strategies (account_id, title, status)
SELECT 
  id,
  'Q4 2025 Oncology Strategy',
  'pending'
FROM public.accounts
WHERE name = 'Johnson & Johnson'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.accounts IS 'Stores pharmaceutical company accounts';
COMMENT ON TABLE public.strategies IS 'Stores AI-generated account strategies';

COMMENT ON COLUMN public.strategies.status IS 'Strategy generation status: pending, generating, complete, or failed';
COMMENT ON COLUMN public.strategies.inputs IS 'JSON object containing strategy generation inputs (URLs, focus areas, etc.)';
COMMENT ON COLUMN public.strategies.priorities IS 'JSON object containing AI-generated priorities';
COMMENT ON COLUMN public.strategies.key_assets IS 'JSON object containing AI-generated key assets/programs';
COMMENT ON COLUMN public.strategies.opportunities IS 'JSON object containing AI-generated opportunities';
COMMENT ON COLUMN public.strategies.contacts IS 'JSON object containing AI-generated key contacts';

