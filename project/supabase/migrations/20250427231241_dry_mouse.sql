/*
  # Create Galactic Archives System

  1. New Tables
    - `galactic_archives`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `phase` (text)
      - `title` (text)
      - `content` (text)
      - `session_id` (uuid, references chat_sessions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `galactic_archives` table
    - Add policy for users to manage their own archives
*/

CREATE TABLE IF NOT EXISTS galactic_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text DEFAULT 'Phase 2',
  title text NOT NULL,
  content text NOT NULL,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE galactic_archives ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own archives
CREATE POLICY "Users can manage their own archives"
  ON galactic_archives
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to handle timestamp updates
CREATE OR REPLACE FUNCTION handle_archive_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER archive_updated
  BEFORE UPDATE ON galactic_archives
  FOR EACH ROW
  EXECUTE FUNCTION handle_archive_update();