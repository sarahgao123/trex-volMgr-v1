-- First drop the existing view
DROP VIEW IF EXISTS position_details;

-- Add location columns if they don't exist
DO $$ 
BEGIN
  -- Check and add latitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'positions' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE positions ADD COLUMN latitude double precision;
  END IF;

  -- Check and add longitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'positions' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE positions ADD COLUMN longitude double precision;
  END IF;

  -- Check and add address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'positions' AND column_name = 'address'
  ) THEN
    ALTER TABLE positions ADD COLUMN address text;
  END IF;
END $$;

-- Add index for location-based queries if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'positions' AND indexname = 'idx_positions_location'
  ) THEN
    CREATE INDEX idx_positions_location ON positions(latitude, longitude);
  END IF;
END $$;

-- Recreate the view with all columns
CREATE VIEW position_details AS
SELECT 
  p.id,
  p.event_id,
  p.name,
  p.start_time,
  p.end_time,
  p.volunteers_needed,
  p.volunteers_checked_in,
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
        'name', v.name
      )
      ORDER BY v.email
    ) FILTER (WHERE v.id IS NOT NULL),
    '[]'::json
  ) as volunteers
FROM positions p
LEFT JOIN position_slots ps ON p.id = ps.position_id
LEFT JOIN slot_volunteers sv ON ps.id = sv.slot_id
LEFT JOIN volunteers v ON sv.volunteer_id = v.id
GROUP BY p.id;