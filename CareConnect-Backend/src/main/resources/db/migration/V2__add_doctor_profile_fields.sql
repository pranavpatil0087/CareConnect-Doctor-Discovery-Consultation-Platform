-- Migration to add professional doctor profile fields

ALTER TABLE doctor_profiles
ADD COLUMN IF NOT EXISTS degree VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS languages VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT;
