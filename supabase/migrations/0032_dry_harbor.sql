-- Drop existing views
DROP VIEW IF EXISTS slot_details CASCADE;
DROP VIEW IF EXISTS position_details CASCADE;

-- Recreate slot_details view with correct check-in counting
CREATE VIEW slot_details AS
SELECT 
  s.id,
  s.position_id,
  s.start_time,
  s.end_time,
  s.capacity,
  s.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'user', json_build_object(
          'id', v.id,
          'email', v.email,
          'created_at', v.created_at
        ),
        'checked_in', sv.checked_in,
        'check_in_time', sv.check_in_time,
        'name', v.name
      )
      ORDER BY v.email
    ) FILTER (WHERE v.id IS NOT NULL),
    '[]'::json
  ) as volunteer_list,
  COUNT(sv.volunteer_id) FILTER (WHERE sv.checked_in = true) as checked_in_count
FROM position_slots s
LEFT JOIN slot_volunteers sv ON s.id = sv.slot_id
LEFT JOIN volunteers v ON sv.volunteer_id = v.id
GROUP BY s.id;

-- Recreate position_details view with correct check-in counting
CREATE VIEW position_details AS
SELECT 
  p.id,
  p.event_id,
  p.name,
  p.start_time,
  p.end_time,
  p.volunteers_needed,
  p.created_at,
  p.latitude,
  p.longitude,
  p.address,
  COALESCE(
    json_agg(
      json_build_object(
        'user', json_build_object(
          'id', v.id,
          'email', v.email,
          'created_at', v.created_at
        ),
        'checked_in', sv.checked_in,
        'check_in_time', sv.check_in_time,
        'name', v.name
      )
      ORDER BY v.email
    ) FILTER (WHERE v.id IS NOT NULL),
    '[]'::json
  ) as volunteer_list,
  (
    SELECT COUNT(DISTINCT sv2.volunteer_id)
    FROM position_slots ps2
    JOIN slot_volunteers sv2 ON ps2.id = sv2.slot_id
    WHERE ps2.position_id = p.id AND sv2.checked_in = true
  ) as checked_in_count
FROM positions p
LEFT JOIN position_slots ps ON p.id = ps.position_id
LEFT JOIN slot_volunteers sv ON ps.id = sv.slot_id
LEFT JOIN volunteers v ON sv.volunteer_id = v.id
GROUP BY p.id;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slot_volunteers_checked_in ON slot_volunteers(checked_in);
CREATE INDEX IF NOT EXISTS idx_slot_volunteers_check_in_time ON slot_volunteers(check_in_time);