
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
    console.log('Adding new_batter_id column...');

    const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE balls ADD COLUMN IF NOT EXISTS new_batter_id UUID REFERENCES players(id);'
    });

    if (error) {
        // Fallback if exec_sql RPC is not available (common in some setups)
        // We can't easily run DDL via client unless we have a specific function.
        // But wait, I can use the SQL Editor in the browser? No, I am an agent.
        // I can try to use the `postgres` library if I had connection string.
        // But I only have Supabase URL/Key.

        console.error('RPC exec_sql failed:', error);
        console.log('Trying to check if column exists by selecting it...');

        const { error: selectError } = await supabase.from('balls').select('new_batter_id').limit(1);
        if (selectError) {
            console.error('Column likely missing and cannot add via RPC:', selectError);
            console.log('CRITICAL: You must add "new_batter_id" column to "balls" table manually or via a migration tool.');
        } else {
            console.log('Column already exists!');
        }
    } else {
        console.log('Column added successfully (or already existed).');
    }
}

addColumn();
