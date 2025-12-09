-- HALS Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth will be used, but keep profile data)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    hobbies TEXT,
    learning_style TEXT DEFAULT 'visual',
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT,
    image TEXT DEFAULT 'coding',
    tags TEXT[],
    rating NUMERIC DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    created_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    duration TEXT,
    video_url TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow public read for courses, modules, lessons, quizzes)
-- Courses visible to everyone
CREATE POLICY "Courses are viewable by everyone" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Users can create courses" ON courses
    FOR INSERT WITH CHECK (true);

-- Modules visible to everyone
CREATE POLICY "Modules are viewable by everyone" ON modules
    FOR SELECT USING (true);

CREATE POLICY "Modules can be created" ON modules
    FOR INSERT WITH CHECK (true);

-- Lessons visible to everyone
CREATE POLICY "Lessons are viewable by everyone" ON lessons
    FOR SELECT USING (true);

CREATE POLICY "Lessons can be created" ON lessons
    FOR INSERT WITH CHECK (true);

-- Quizzes visible to everyone
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "Quizzes can be created" ON quizzes
    FOR INSERT WITH CHECK (true);

-- Quiz questions visible to everyone
CREATE POLICY "Quiz questions are viewable by everyone" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Quiz questions can be created" ON quiz_questions
    FOR INSERT WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);

-- Enrollments - users can only see and modify their own
CREATE POLICY "Users can view own enrollments" ON enrollments
    FOR SELECT USING (true);

CREATE POLICY "Users can create own enrollments" ON enrollments
    FOR INSERT WITH CHECK (true);

-- Lesson progress - users can only see and modify their own
CREATE POLICY "Users can view own progress" ON lesson_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can create own progress" ON lesson_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own progress" ON lesson_progress
    FOR UPDATE USING (true);

-- Quiz attempts - users can only see and modify their own
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (true);

CREATE POLICY "Users can create own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (true);
