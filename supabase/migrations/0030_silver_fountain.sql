/*
  # Add location support to positions

  1. New Columns
    - `latitude` (double precision) - Position's latitude coordinate
    - `longitude` (double precision) - Position's longitude coordinate
    - `address` (text) - Human-readable address

  2. Changes
    - Add location columns to positions table
    - Add index for location-based queries
    - Drop and recreate view to handle new columns
*/

-- First drop the existing view
DROP VIEW IF EXISTS position_details;

-- Add location columns
ALTER TABLE positions
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision,
ADD COLUMN address text;

-- Add index for location-based queries
CREATE INDEX idx_positions_location 
ON positions(latitude, longitude);

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