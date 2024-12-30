-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view slot volunteers" ON slot_volunteers;
DROP POLICY IF EXISTS "Event owners can manage slot volunteers" ON slot_volunteers;
DROP POLICY IF EXISTS "Anyone can view volunteers" ON volunteers;
DROP POLICY IF EXISTS "Event owners can manage volunteers" ON volunteers;

-- Create new policies for volunteers table
CREATE POLICY "Public read access for volunteers"
  ON volunteers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage volunteers"
  ON volunteers FOR ALL
  TO authenticated
  USING (true);

-- Create new policies for slot_volunteers table
CREATE POLICY "Public read access for slot volunteers"
  ON slot_volunteers FOR SELECT
  USING (true);

CREATE POLICY "Allow check-ins for registered volunteers"
  ON slot_volunteers FOR UPDATE
  USING (true)
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteers v
      WHERE v.id = slot_volunteers.volunteer_id
    )
  );

CREATE POLICY "Authenticated users can manage slot volunteers"
  ON slot_volunteers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM position_slots ps
      JOIN positions p ON p.id = ps.position_id
      JOIN events e ON e.id = p.event_id
      WHERE ps.id = slot_volunteers.slot_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can delete slot volunteers"
  ON slot_volunteers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM position_slots ps
      JOIN positions p ON p.id = ps.position_id
      JOIN events e ON e.id = p.event_id
      WHERE ps.id = slot_volunteers.slot_id
      AND e.user_id = auth.uid()
    )
  );