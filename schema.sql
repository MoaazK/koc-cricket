-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Teams Table
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  short_name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Players Table
create table players (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id),
  name text not null,
  role text check (role in ('batsman', 'bowler', 'all-rounder', 'keeper')),
  batting_style text,
  bowling_style text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Matches Table
create table matches (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date timestamp with time zone not null,
  venue text,
  status text check (status in ('upcoming', 'live', 'completed', 'abandoned')) default 'upcoming',
  home_team_id uuid references teams(id),
  away_team_id uuid references teams(id),
  toss_winner_id uuid references teams(id),
  toss_decision text check (toss_decision in ('bat', 'bowl')),
  winning_team_id uuid references teams(id),
  win_margin_type text check (win_margin_type in ('runs', 'wickets')),
  win_margin_value int,
  current_innings_no int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Innings Table
create table innings (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches(id) on delete cascade,
  team_id uuid references teams(id),
  innings_number int not null check (innings_number in (1, 2)),
  total_runs int default 0,
  wickets int default 0,
  overs numeric default 0.0,
  is_declared boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(match_id, innings_number)
);

-- Overs Table
create table overs (
  id uuid default uuid_generate_v4() primary key,
  innings_id uuid references innings(id) on delete cascade,
  over_number int not null, -- 1 to 20
  bowler_id uuid references players(id),
  runs_conceded int default 0,
  wickets_taken int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(innings_id, over_number)
);

-- Balls Table (The Atom)
create table balls (
  id uuid default uuid_generate_v4() primary key,
  over_id uuid references overs(id) on delete cascade,
  ball_number int not null, -- 1 to 6 (can be more for extras)
  striker_id uuid references players(id),
  non_striker_id uuid references players(id),
  bowler_id uuid references players(id),
  runs_batter int default 0,
  extras_type text check (extras_type in ('wide', 'noball', 'bye', 'legbye', 'penalty')),
  extras_runs int default 0,
  is_wicket boolean default false,
  wicket_type text check (wicket_type in ('bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket', 'retired')),
  player_dismissed_id uuid references players(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for Matches and Balls (for live score)
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table innings;
alter publication supabase_realtime add table overs;
alter publication supabase_realtime add table balls;
