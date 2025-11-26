
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMatch() {
    console.log('Creating Match...');

    // 1. Get Teams
    const { data: teams } = await supabase.from('teams').select('id, name');
    if (!teams || teams.length < 2) {
        console.error('Not enough teams found. Run reset_db.ts first.');
        return;
    }

    const homeTeam = teams[0];
    const awayTeam = teams[1];

    console.log(`Creating match: ${homeTeam.name} vs ${awayTeam.name}`);

    // 2. Create Match
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
            title: 'Test Match',
            date: new Date().toISOString(),
            status: 'live',
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            toss_winner_id: homeTeam.id,
            toss_decision: 'bat',
            current_innings_no: 1
        })
        .select()
        .single();

    if (matchError) {
        console.error('Error creating match:', matchError);
        return;
    }

    console.log('Match created:', match.id);

    // 3. Create Innings
    const { data: innings, error: inningsError } = await supabase
        .from('innings')
        .insert({
            match_id: match.id,
            innings_number: 1,
            team_id: homeTeam.id,
            total_runs: 0,
            wickets: 0,
            overs: 0
        })
        .select()
        .single();

    if (inningsError) {
        console.error('Error creating innings:', inningsError);
        return;
    }

    console.log('Innings created:', innings.id);
    console.log('Done. Match ID:', match.id);
}

createMatch();
