
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
    console.log('Starting database reset...');

    // 1. Delete all data (Order matters due to foreign keys)
    console.log('Deleting existing data...');

    // Delete innings first (depends on matches)
    const { error: errInnings } = await supabase.from('innings').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (errInnings) console.error('Error deleting innings:', errInnings);

    // Delete matches (depends on teams)
    const { error: errMatches } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errMatches) console.error('Error deleting matches:', errMatches);

    // Delete players (depends on teams)
    const { error: errPlayers } = await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errPlayers) console.error('Error deleting players:', errPlayers);

    // Delete teams
    const { error: errTeams } = await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errTeams) console.error('Error deleting teams:', errTeams);

    console.log('Data deletion complete.');

    // 2. Seed Teams
    console.log('Seeding teams...');
    const teamsData = [
        { name: 'Koç University', short_name: 'KU' },
        { name: 'Bilkent University', short_name: 'BIL' },
        { name: 'Istanbul Technical University', short_name: 'ITU' },
        { name: 'Bogazici University', short_name: 'BOUN' }
    ];

    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .insert(teamsData)
        .select();

    if (teamsError) {
        console.error('Error seeding teams:', teamsError);
        return;
    }

    // 3. Seed Players
    console.log('Seeding players...');
    const kuTeam = teams.find(t => t.name === 'Koç University');
    const bilTeam = teams.find(t => t.name === 'Bilkent University');

    if (kuTeam) {
        const kuPlayers = [
            { team_id: kuTeam.id, name: 'Ahmet Yilmaz', role: 'batsman', batting_style: 'Right-hand bat' },
            { team_id: kuTeam.id, name: 'Mehmet Demir', role: 'all-rounder', batting_style: 'Right-hand bat', bowling_style: 'Right-arm fast' },
            { team_id: kuTeam.id, name: 'Ali Kaya', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Right-arm spin' },
            { team_id: kuTeam.id, name: 'Can Ozturk', role: 'keeper', batting_style: 'Right-hand bat' },
            { team_id: kuTeam.id, name: 'Burak Celik', role: 'batsman', batting_style: 'Left-hand bat' },
            { team_id: kuTeam.id, name: 'Emre Sahin', role: 'all-rounder', batting_style: 'Right-hand bat', bowling_style: 'Right-arm medium' },
            { team_id: kuTeam.id, name: 'Gokhan Arslan', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Left-arm fast' },
            { team_id: kuTeam.id, name: 'Hakan Yildiz', role: 'batsman', batting_style: 'Right-hand bat' },
            { team_id: kuTeam.id, name: 'Ismail Kara', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Right-arm fast' },
            { team_id: kuTeam.id, name: 'Kemal Aydin', role: 'all-rounder', batting_style: 'Left-hand bat', bowling_style: 'Left-arm spin' },
            { team_id: kuTeam.id, name: 'Murat Polat', role: 'batsman', batting_style: 'Right-hand bat' }
        ];
        await supabase.from('players').insert(kuPlayers);
    }

    if (bilTeam) {
        const bilPlayers = [
            { team_id: bilTeam.id, name: 'John Doe', role: 'batsman', batting_style: 'Right-hand bat' },
            { team_id: bilTeam.id, name: 'Jane Smith', role: 'all-rounder', batting_style: 'Right-hand bat', bowling_style: 'Right-arm fast' },
            { team_id: bilTeam.id, name: 'Michael Brown', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Right-arm spin' },
            { team_id: bilTeam.id, name: 'Chris Wilson', role: 'keeper', batting_style: 'Right-hand bat' },
            { team_id: bilTeam.id, name: 'David Lee', role: 'batsman', batting_style: 'Left-hand bat' },
            { team_id: bilTeam.id, name: 'Sarah White', role: 'all-rounder', batting_style: 'Right-hand bat', bowling_style: 'Right-arm medium' },
            { team_id: bilTeam.id, name: 'James Green', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Left-arm fast' },
            { team_id: bilTeam.id, name: 'Robert Black', role: 'batsman', batting_style: 'Right-hand bat' },
            { team_id: bilTeam.id, name: 'William Scott', role: 'bowler', batting_style: 'Right-hand bat', bowling_style: 'Right-arm fast' },
            { team_id: bilTeam.id, name: 'Mary Jones', role: 'all-rounder', batting_style: 'Left-hand bat', bowling_style: 'Left-arm spin' },
            { team_id: bilTeam.id, name: 'Patricia Davis', role: 'batsman', batting_style: 'Right-hand bat' }
        ];
        await supabase.from('players').insert(bilPlayers);
    }

    console.log('Database reset and seeded successfully!');
}

resetDatabase();
