-- Create course_questions table
CREATE TABLE IF NOT EXISTS course_questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_options TEXT, -- JSON string for multiple choice options
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON course_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_display_order ON course_questions(display_order);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_questions_updated_at 
    BEFORE UPDATE ON course_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
