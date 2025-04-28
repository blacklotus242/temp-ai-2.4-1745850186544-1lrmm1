/*
  # Fix Chat Messages RLS Policy

  1. Changes
    - Drop existing RLS policy for chat_messages
    - Create new, more permissive policy for chat_messages
    - Allow authenticated users to insert messages into their own chat sessions

  2. Security
    - Maintain security by checking session ownership
    - Only allow access to messages in user's own chat sessions
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage messages in their chat sessions" ON chat_messages;

-- Create new policy
CREATE POLICY "Users can manage messages in their chat sessions"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );