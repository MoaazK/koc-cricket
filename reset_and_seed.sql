
-- Reset and Seed Script for Koç University Cricket Club
-- Usage: Run this in the Supabase SQL Editor

-- 1. Clean up existing data
TRUNCATE TABLE balls, overs, innings, matches, players, teams CASCADE;

-- 2. Seed Teams
INSERT INTO teams (id, name, short_name, logo_url) VALUES
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Koç University', 'KU', 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Ko%C3%A7_University_logo.svg/1200px-Ko%C3%A7_University_logo.svg.png'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Bilkent University', 'BIL', 'https://w3.bilkent.edu.tr/logo/ing-amblem.png'),
('60315893-b5e5-4afb-a6e4-71948dbedbcd', 'Istanbul Technical University', 'ITU', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Istanbul_Technical_University_Emblem.svg/1200px-Istanbul_Technical_University_Emblem.svg.png'),
('c2edb494-8a8c-4ebd-8a9c-15ebb42b1805', 'Bogazici University', 'BOUN', 'https://upload.wikimedia.org/wikipedia/tr/e/e2/Bo%C4%9Fazi%C3%A7i_%C3%9Cniversitesi_Logosu.png');

-- 3. Seed Players

-- Koç University Players
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Ahmet Yilmaz', 'batsman', 'Right-hand bat', NULL),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Mehmet Demir', 'all-rounder', 'Right-hand bat', 'Right-arm fast'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Ali Kaya', 'batsman', 'Left-hand bat', NULL),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Can Ozturk', 'bowler', 'Right-hand bat', 'Right-arm spin'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Burak Celik', 'keeper', 'Right-hand bat', NULL),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Emre Aydin', 'all-rounder', 'Right-hand bat', 'Right-arm medium'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Gokhan Arslan', 'bowler', 'Right-hand bat', 'Left-arm fast'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Hakan Polat', 'batsman', 'Right-hand bat', NULL),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Ismail Koc', 'bowler', 'Right-hand bat', 'Right-arm spin'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Kemal Sahin', 'all-rounder', 'Left-hand bat', 'Left-arm spin'),
('bc5f046b-5a25-4133-b50d-b0e956c86f62', 'Murat Yildiz', 'batsman', 'Right-hand bat', NULL);

-- Bilkent University Players
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'John Smith', 'batsman', 'Right-hand bat', NULL),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Michael Brown', 'bowler', 'Right-hand bat', 'Right-arm fast'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'David Wilson', 'all-rounder', 'Right-hand bat', 'Right-arm medium'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'James Taylor', 'keeper', 'Left-hand bat', NULL),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Robert Anderson', 'batsman', 'Right-hand bat', NULL),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'William Thomas', 'bowler', 'Right-hand bat', 'Right-arm spin'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Richard Jackson', 'all-rounder', 'Right-hand bat', 'Left-arm fast'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Charles White', 'batsman', 'Right-hand bat', NULL),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Joseph Harris', 'bowler', 'Right-hand bat', 'Right-arm medium'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Thomas Martin', 'all-rounder', 'Left-hand bat', 'Left-arm spin'),
('22d9ca11-6330-4d68-be00-6e0296c44ef1', 'Christopher Thompson', 'batsman', 'Right-hand bat', NULL);

-- ITU Players (Partial)
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
('60315893-b5e5-4afb-a6e4-71948dbedbcd', 'ITU Captain', 'all-rounder', 'Right-hand bat', 'Right-arm fast'),
('60315893-b5e5-4afb-a6e4-71948dbedbcd', 'ITU Keeper', 'keeper', 'Right-hand bat', NULL);

-- BOUN Players (Partial)
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
('c2edb494-8a8c-4ebd-8a9c-15ebb42b1805', 'BOUN Captain', 'all-rounder', 'Right-hand bat', 'Right-arm fast'),
('c2edb494-8a8c-4ebd-8a9c-15ebb42b1805', 'BOUN Keeper', 'keeper', 'Right-hand bat', NULL);
