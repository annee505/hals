import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get connection string from argument
const connectionString = process.argv[2];

if (!connectionString) {
    console.error('Please provide the connection string as an argument.');
    console.error('Usage: node scripts/runSchema.js "postgresql://..."');
    process.exit(1);
}

const client = new pg.Client({
    connectionString,
});

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Reading schema file...');
        const sqlPath = path.join(__dirname, '../supabase-schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing schema...');
        await client.query(sql);

        console.log('✅ Schema executed successfully!');
    } catch (err) {
        console.error('❌ Error executing schema:', err);
    } finally {
        await client.end();
    }
}

run();
