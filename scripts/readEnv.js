
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

console.log('VITE_SUPABASE_URL=' + process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY=' + process.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_GROQ_API_KEY=' + process.env.VITE_GROQ_API_KEY);
