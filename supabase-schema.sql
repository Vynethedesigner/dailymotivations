-- ═══════════════════════════════════════════════════════
-- Daily Motivations — Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Motivations Table ──
CREATE TABLE IF NOT EXISTS motivations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subscribers Table ──
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_motivations_status ON motivations(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- ── Row Level Security ──
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved motivations
CREATE POLICY "Public can read approved motivations" ON motivations
  FOR SELECT USING (status = 'approved');

-- Allow public to insert (submit) motivations
CREATE POLICY "Public can submit motivations" ON motivations
  FOR INSERT WITH CHECK (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access to motivations" ON motivations
  FOR ALL USING (auth.role() = 'service_role');

-- Allow service role full access to subscribers
CREATE POLICY "Service role has full access to subscribers" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public to insert subscribers (subscription)
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- ── Seed Data (some starter motivations) ──
INSERT INTO motivations (text, author, is_anonymous, status) VALUES
  ('The only way to do great work is to love what you do.', 'Steve Jobs', false, 'approved'),
  ('In the middle of difficulty lies opportunity.', 'Albert Einstein', false, 'approved'),
  ('You are never too old to set another goal or to dream a new dream.', 'C.S. Lewis', false, 'approved'),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', false, 'approved'),
  ('It does not matter how slowly you go as long as you do not stop.', 'Confucius', false, 'approved'),
  ('Everything you''ve ever wanted is on the other side of fear.', 'George Addair', false, 'approved'),
  ('Start where you are. Use what you have. Do what you can.', 'Arthur Ashe', false, 'approved'),
  ('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson', false, 'approved'),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', false, 'approved'),
  ('The best time to plant a tree was 20 years ago. The second best time is now.', NULL, true, 'approved'),
  ('Your limitation—it''s only your imagination.', NULL, true, 'approved'),
  ('Push yourself, because no one else is going to do it for you.', NULL, true, 'approved'),
  ('Great things never come from comfort zones.', NULL, true, 'approved'),
  ('Dream it. Wish it. Do it.', NULL, true, 'approved'),
  ('Don''t stop when you''re tired. Stop when you''re done.', NULL, true, 'approved');

-- ── Updated_at Trigger ──
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_motivations_modtime
    BEFORE UPDATE ON motivations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
