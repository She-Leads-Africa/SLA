-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Create updated courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    schedule VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    duration VARCHAR(100) NOT NULL,
    class_link VARCHAR(255) NOT NULL,
    tutor VARCHAR(255) NOT NULL,
    tutor_bio TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated applicants table with new fields
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_type VARCHAR(50), -- Rural, Semi-Urban, Urban
    academic_qualification VARCHAR(100) NOT NULL,
    student_level VARCHAR(50), -- For undergraduate students
    employment_status VARCHAR(50) NOT NULL, -- Unemployed, Self-employed, Employed, Student
    is_displaced BOOLEAN NOT NULL DEFAULT FALSE,
    has_disability BOOLEAN NOT NULL DEFAULT FALSE,
    disability_type VARCHAR(255),
    referral_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    pathway VARCHAR(100) NOT NULL,
    has_business BOOLEAN,
    business_age VARCHAR(50), -- less_than_3, more_than_3, no_business
    business_sector VARCHAR(255),
    company_name VARCHAR(255),
    taken_booster_course BOOLEAN NOT NULL DEFAULT FALSE,
    work_interest BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Course-specific experience fields
    has_formal_training BOOLEAN,
    familiarity_scale INTEGER, -- 1-5 scale
    has_used_tools BOOLEAN,
    tools_used TEXT,
    course_specific_answer TEXT, -- For various course-specific questions
    social_media_platforms TEXT, -- JSON array for digital marketing
    digital_strategies TEXT, -- JSON array for digital marketing
    expectations TEXT,
    application_ease_rating INTEGER, -- 1-5 scale
    
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    status_email_sent BOOLEAN DEFAULT FALSE,
    status_email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Documents table (for file uploads)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id),
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert updated course data
INSERT INTO courses (name, description, schedule, start_date, duration, class_link, tutor, tutor_bio, requirements, location)
VALUES 
('Video Editing', 'Learn professional video editing techniques using smartphone apps and desktop software.', 'Mondays and Wednesdays, 4:00 PM - 6:00 PM WAT', '2025-06-15', '8 weeks', 'https://meet.google.com/sla-video-editing', 'Chioma Eze', 'Award-winning video editor with 10+ years of experience in film and digital media.', 'Smartphone with video editing apps, stable internet connection', 'Virtual (Zoom)'),
('Graphics Design', 'Master the fundamentals of graphic design and create compelling visual content.', 'Tuesdays and Thursdays, 5:00 PM - 7:00 PM WAT', '2025-06-16', '10 weeks', 'https://meet.google.com/sla-graphics-design', 'Amina Ibrahim', 'Creative director with expertise in branding and digital design for major Nigerian brands.', 'Laptop with design software access, drawing tablet (optional)', 'Virtual (Zoom)'),
('Digital Marketing and Content Creation', 'Develop skills in digital marketing strategies and content creation for various platforms.', 'Fridays, 3:00 PM - 6:00 PM WAT and Saturdays, 10:00 AM - 1:00 PM WAT', '2025-06-18', '6 weeks', 'https://meet.google.com/sla-digital-marketing', 'Tunde Adebayo', 'Digital marketing consultant who has worked with startups and established businesses across Africa.', 'Laptop, smartphone with camera, social media accounts', 'Virtual (Zoom)'),
('Executive Virtual Assistant', 'Learn the skills needed to become a professional virtual assistant for executives.', 'Mondays and Fridays, 2:00 PM - 5:00 PM WAT', '2025-06-20', '8 weeks', 'https://meet.google.com/sla-virtual-assistant', 'Funmi Adebayo', 'Experienced virtual assistant trainer with expertise in executive support and digital tools.', 'Laptop, stable internet connection, productivity software access', 'Virtual (Zoom)'),
('Data Analysis', 'Master data analysis techniques using various tools and software.', 'Wednesdays and Saturdays, 1:00 PM - 4:00 PM WAT', '2025-06-22', '12 weeks', 'https://meet.google.com/sla-data-analysis', 'Dr. Kemi Ogundimu', 'Data scientist with PhD in Statistics and 8+ years of industry experience.', 'Laptop with Excel/Google Sheets, willingness to learn new software', 'Virtual (Zoom)');

-- Create indexes for better performance
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_course_id ON applications(course_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_applicant_id ON documents(applicant_id);
