-- Create tables for the SLA application form

-- Courses table
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

-- Applicants table
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    academic_qualification VARCHAR(100) NOT NULL,
    is_displaced BOOLEAN NOT NULL DEFAULT FALSE,
    has_disability BOOLEAN NOT NULL DEFAULT FALSE,
    disability_type VARCHAR(255),
    has_jobberman_certificate BOOLEAN NOT NULL DEFAULT FALSE,
    referral_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    pathway VARCHAR(100) NOT NULL,
    has_business BOOLEAN,
    company_name VARCHAR(255),
    taken_booster_course BOOLEAN NOT NULL DEFAULT FALSE,
    work_interest BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    status_email_sent BOOLEAN DEFAULT FALSE,
    status_email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Documents table (for future use)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id),
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample course data
INSERT INTO courses (name, description, schedule, start_date, duration, class_link, tutor, tutor_bio, requirements, location)
VALUES 
('Video Editing', 'Learn professional video editing techniques using industry-standard software.', 'Mondays and Wednesdays, 4:00 PM - 6:00 PM WAT', '2025-06-15', '8 weeks', 'https://meet.google.com/sla-video-editing', 'Chioma Eze', 'Award-winning video editor with 10+ years of experience in film and digital media.', 'Laptop with at least 8GB RAM, stable internet connection', 'Virtual (Zoom)'),
('Graphics Design', 'Master the fundamentals of graphic design and create compelling visual content.', 'Tuesdays and Thursdays, 5:00 PM - 7:00 PM WAT', '2025-06-16', '10 weeks', 'https://meet.google.com/sla-graphics-design', 'Amina Ibrahim', 'Creative director with expertise in branding and digital design for major Nigerian brands.', 'Laptop with Adobe Creative Suite, drawing tablet (optional)', 'Virtual (Zoom)'),
('Digital Marketing/Content Creation', 'Develop skills in digital marketing strategies and content creation for various platforms.', 'Fridays, 3:00 PM - 6:00 PM WAT and Saturdays, 10:00 AM - 1:00 PM WAT', '2025-06-18', '6 weeks', 'https://meet.google.com/sla-digital-marketing', 'Tunde Adebayo', 'Digital marketing consultant who has worked with startups and established businesses across Africa.', 'Laptop, smartphone with camera, social media accounts', 'Virtual (Zoom)');

-- Create indexes for better performance
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_course_id ON applications(course_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_applicant_id ON documents(applicant_id);
