
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from root .env if present, otherwise rely on process.env
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Environment Variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourses() {
    console.log('Checking courses table...');
    const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching courses:', error);
    } else {
        console.log(`Found ${count} courses in the database.`);
    }

    // Also check if we can read one
    const { data, error: readError } = await supabase
        .from('courses')
        .select('title')
        .limit(3);

    if (readError) {
        console.error('Error reading courses:', readError);
    } else {
        console.log('Sample courses:', data);
    }
}

checkCourses();
