/**
 * Sync Auth Users to Database
 * 
 * This script syncs users from Supabase Auth to the users table.
 * Run this to fix orphaned auth users that don't have database profiles.
 * 
 * Usage: node scripts/syncAuthUsers.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables!');
    console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.log('\nTo get your service role key:');
    console.log('1. Go to Supabase Dashboard → Settings → API');
    console.log('2. Copy the "service_role" key (NOT anon key)');
    console.log('3. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
}

// Use service role key to access auth.users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncAuthUsers() {
    console.log('🔄 Starting auth user sync...\n');

    try {
        // Get all auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError.message);
            console.log('\nMake sure you\'re using the service_role key, not the anon key!');
            return;
        }

        console.log(`Found ${authUsers.users.length} users in Supabase Auth\n`);

        // Get all users in database
        const { data: dbUsers, error: dbError } = await supabase
            .from('users')
            .select('id, email');

        if (dbError) {
            console.error('Error fetching database users:', dbError.message);
            return;
        }

        console.log(`Found ${dbUsers.length} users in database\n`);

        // Find orphaned auth users (in auth but not in db)
        const dbEmails = new Set(dbUsers.map(u => u.email.toLowerCase()));
        const dbIds = new Set(dbUsers.map(u => u.id));

        const orphanedUsers = authUsers.users.filter(authUser => {
            return !dbIds.has(authUser.id) && !dbEmails.has(authUser.email.toLowerCase());
        });

        console.log(`Found ${orphanedUsers.length} orphaned auth users\n`);

        if (orphanedUsers.length === 0) {
            console.log('✅ All auth users are synced with database!');
            return;
        }

        // Sync orphaned users to database
        console.log('Syncing orphaned users to database...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const authUser of orphanedUsers) {
            const userMeta = authUser.user_metadata || {};

            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: authUser.id,
                    email: authUser.email,
                    name: userMeta.name || authUser.email?.split('@')[0] || 'User',
                    hobbies: userMeta.hobbies || '',
                    learning_style: userMeta.learning_style || 'visual',
                    goal: userMeta.goal || ''
                });

            if (insertError) {
                console.log(`❌ Failed to sync ${authUser.email}: ${insertError.message}`);
                errorCount++;
            } else {
                console.log(`✅ Synced: ${authUser.email}`);
                successCount++;
            }
        }

        console.log(`\n📊 Sync complete!`);
        console.log(`   ✅ Successfully synced: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

syncAuthUsers();
