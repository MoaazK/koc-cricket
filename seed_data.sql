-- Insert Teams
INSERT INTO teams (name, short_name, logo_url) VALUES
('Koç University', 'KU', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Ko%C3%A7_University_logo.svg/1200px-Ko%C3%A7_University_logo.svg.png'),
('Bilkent University', 'BIL', 'https://w3.bilkent.edu.tr/logo/ing-amblem.png'),
('Istanbul Technical University', 'ITU', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Istanbul_Technical_University_Emblem.svg/1200px-Istanbul_Technical_University_Emblem.svg.png'),
('Bogazici University', 'BOUN', 'https://upload.wikimedia.org/wikipedia/tr/e/e2/Bo%C4%9Fazi%C3%A7i_%C3%9Cniversitesi_Logosu.png');

-- Get Team IDs (assuming sequential insert or you can look them up after running above)
-- For this script to be robust, we'll use subqueries or just assume the user runs this on a fresh DB.
-- Ideally, we'd use DO blocks but standard SQL is safer for the editor.

-- Insert Players for Koç University
WITH team AS (SELECT id FROM teams WHERE name = 'Koç University' LIMIT 1)
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
((SELECT id FROM team), 'Ahmet Yilmaz', 'batsman', 'right-hand', NULL),
((SELECT id FROM team), 'Mehmet Demir', 'all-rounder', 'right-hand', 'right-arm fast'),
((SELECT id FROM team), 'Ali Kaya', 'bowler', 'right-hand', 'right-arm spin'),
((SELECT id FROM team), 'Can Ozturk', 'keeper', 'right-hand', NULL),
((SELECT id FROM team), 'Burak Celik', 'batsman', 'left-hand', NULL),
((SELECT id FROM team), 'Emre Sahin', 'all-rounder', 'right-hand', 'right-arm medium'),
((SELECT id FROM team), 'Gokhan Arslan', 'bowler', 'right-hand', 'left-arm fast'),
((SELECT id FROM team), 'Hakan Yildiz', 'batsman', 'right-hand', NULL),
((SELECT id FROM team), 'Ismail Kara', 'bowler', 'right-hand', 'right-arm fast'),
((SELECT id FROM team), 'Kemal Aydin', 'all-rounder', 'left-hand', 'left-arm spin'),
((SELECT id FROM team), 'Murat Polat', 'batsman', 'right-hand', NULL);

-- Insert Players for Bilkent University
WITH team AS (SELECT id FROM teams WHERE name = 'Bilkent University' LIMIT 1)
INSERT INTO players (team_id, name, role, batting_style, bowling_style) VALUES
((SELECT id FROM team), 'John Doe', 'batsman', 'right-hand', NULL),
((SELECT id FROM team), 'Jane Smith', 'all-rounder', 'right-hand', 'right-arm fast'),
((SELECT id FROM team), 'Michael Brown', 'bowler', 'right-hand', 'right-arm spin'),
((SELECT id FROM team), 'Chris Wilson', 'keeper', 'right-hand', NULL),
((SELECT id FROM team), 'David Lee', 'batsman', 'left-hand', NULL),
((SELECT id FROM team), 'Sarah White', 'all-rounder', 'right-hand', 'right-arm medium'),
((SELECT id FROM team), 'James Green', 'bowler', 'right-hand', 'left-arm fast'),
((SELECT id FROM team), 'Robert Black', 'batsman', 'right-hand', NULL),
((SELECT id FROM team), 'William Scott', 'bowler', 'right-hand', 'right-arm fast'),
((SELECT id FROM team), 'Mary Jones', 'all-rounder', 'left-hand', 'left-arm spin'),
((SELECT id FROM team), 'Patricia Davis', 'batsman', 'right-hand', NULL);
