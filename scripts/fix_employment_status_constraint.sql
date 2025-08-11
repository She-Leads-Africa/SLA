-- Fix database constraints and add missing columns

-- First, let's see what constraints exist and remove problematic ones
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS check_employment_status;
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS check_location_type;
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS check_academic_qualification;
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS check_student_level;
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS check_referral_source;

-- Add missing columns to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS location_type VARCHAR(50);
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS student_level VARCHAR(50);
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) DEFAULT 'unemployed';

-- Add missing columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS business_age VARCHAR(50);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS business_sector VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_formal_training BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS familiarity_scale INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_used_tools BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tools_used TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_specific_answer TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS social_media_platforms JSONB DEFAULT '[]';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS digital_strategies JSONB DEFAULT '[]';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS expectations TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_ease_rating INTEGER;

-- Add flexible check constraints that allow common values
ALTER TABLE applicants ADD CONSTRAINT check_employment_status 
CHECK (employment_status IN ('employed', 'unemployed', 'self_employed', 'student', 'other') OR employment_status IS NULL);

ALTER TABLE applicants ADD CONSTRAINT check_location_type 
CHECK (location_type IN ('urban', 'semi_urban', 'rural', 'suburban') OR location_type IS NULL);

ALTER TABLE applicants ADD CONSTRAINT check_academic_qualification 
CHECK (academic_qualification IN ('primary', 'secondary', 'undergraduate', 'bachelors', 'masters', 'phd', 'diploma', 'certificate', 'other') OR academic_qualification IS NULL);

ALTER TABLE applicants ADD CONSTRAINT check_student_level 
CHECK (student_level IN ('100_level', '200_level', '300_level', '400_level', '500_level', '600_level', 'graduate', 'postgraduate') OR student_level IS NULL);

ALTER TABLE applicants ADD CONSTRAINT check_referral_source 
CHECK (referral_source IN ('sla_website', 'sla_instagram', 'sla_twitter', 'sla_facebook', 'sla_linkedin', 'friend_referral', 'google_search', 'others') OR referral_source IS NULL);

-- Add constraints for applications table
ALTER TABLE applications ADD CONSTRAINT check_pathway 
CHECK (pathway IN ('professional', 'entrepreneurial') OR pathway IS NULL);

ALTER TABLE applications ADD CONSTRAINT check_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted') OR status IS NULL);

ALTER TABLE applications ADD CONSTRAINT check_business_age 
CHECK (business_age IN ('no_business', 'less_than_1_year', '1_to_3_years', 'more_than_3_years') OR business_age IS NULL);

-- Update existing records to have valid values
UPDATE applicants SET employment_status = 'unemployed' WHERE employment_status IS NULL OR employment_status = '';
UPDATE applicants SET location_type = 'urban' WHERE location_type IS NULL OR location_type = '';
UPDATE applicants SET academic_qualification = 'other' WHERE academic_qualification IS NULL OR academic_qualification = '';
UPDATE applicants SET referral_source = 'others' WHERE referral_source IS NULL OR referral_source = '';

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_applicants_employment_status ON applicants(employment_status);
CREATE INDEX IF NOT EXISTS idx_applicants_location_type ON applicants(location_type);
CREATE INDEX IF NOT EXISTS idx_applications_business_age ON applications(business_age);
CREATE INDEX IF NOT EXISTS idx_applications_familiarity_scale ON applications(familiarity_scale);
