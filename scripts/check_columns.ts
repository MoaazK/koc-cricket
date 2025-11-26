
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking via INSERT...');
    // Try to insert a dummy record with new_batter_id. It will fail due to FK or other constraints, but we check for "column does not exist" error.
    const { error } = await supabase.from('balls').insert({
        over_id: '00000000-0000-0000-0000-000000000000', // Dummy
        ball_number: 1,
        striker_id: '00000000-0000-0000-0000-000000000000',
        non_striker_id: '00000000-0000-0000-0000-000000000000',
        bowler_id: '00000000-0000-0000-0000-000000000000',
        runs_batter: 0,
        new_batter_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error) {
        console.log('Error:', error.message);
        if (error.message.includes('column "new_batter_id" of relation "balls" does not exist')) {
            console.log('RESULT: Column MISSING');
        } else {
            console.log('RESULT: Column EXISTS (or other error)');
        }
    } else {
        console.log('RESULT: Column EXISTS (Insert succeeded??)');
    }
}

check();
