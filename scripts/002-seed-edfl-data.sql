-- Seed Data for EDFL Database
-- Realistic data for Essendon District Football League

-- Insert Clubs (based on real EDFL clubs)
INSERT INTO clubs (name, founded_year, home_ground, ground_address, colors, nickname, website, contact_email, president_name, active) VALUES
('Keilor Football Club', 1888, 'Keilor Park', '7 Keilor Park Drive, Keilor East VIC 3033', 'Navy Blue and Sky Blue', 'Blues', 'https://www.keilorfc.com.au', 'admin@keilorfc.com.au', 'John Smith', true),
('Strathmore Football Club', 1920, 'Strathmore Community Park', '52 Napier Street, Strathmore VIC 3041', 'Green and Gold', 'Mores', 'https://www.strathmore.com.au', 'president@strathmore.com.au', 'Sarah Johnson', true),
('Aberfeldie Football Club', 1922, 'Aberfeldie Park', '2A Vida Street, Aberfeldie VIC 3040', 'Red and White', 'Jets', 'https://www.aberfeldiefc.com.au', 'info@aberfeldiefc.com.au', 'Michael Brown', true),
('Airport West Football Club', 1965, 'Essendon Airport Oval', 'Keilor Park Drive, Tullamarine VIC 3043', 'Purple and Gold', 'Hawks', 'https://www.airportwestfc.com.au', 'secretary@airportwestfc.com.au', 'Lisa Wilson', true),
('Avondale Heights Football Club', 1958, 'Avondale Heights Reserve', 'Military Road, Avondale Heights VIC 3034', 'Maroon and Gold', 'Warriors', 'https://www.avondaleheights.com.au', 'contact@avondaleheights.com.au', 'David Miller', true),
('Doutta Stars Football Club', 1954, 'Cross Keys Reserve', 'Raleigh Road, Maribyrnong VIC 3032', 'Black and White', 'Stars', 'https://www.douttastars.com.au', 'admin@douttastars.com.au', 'Emma Davis', true),
('Moonee Valley Football Club', 1895, 'Moonee Valley Park', 'Queens Park, Moonee Ponds VIC 3039', 'Blue and White', 'Eagles', 'https://www.mooneevalleyfc.com.au', 'info@mooneevalleyfc.com.au', 'Robert Taylor', true),
('Pascoe Vale Football Club', 1960, 'Pascoe Vale Park', 'Prospect Street, Pascoe Vale VIC 3044', 'Red and Blue', 'Panthers', 'https://www.pascoevalefc.com.au', 'president@pascoevalefc.com.au', 'Jennifer White', true),
('Essendon Doutta Stars', 1954, 'Windy Hill', 'Napier Street, Essendon VIC 3040', 'Red and Black', 'Bombers', 'https://www.essendonfc.com.au', 'contact@essendonfc.com.au', 'Mark Thompson', true),
('Tullamarine Football Club', 1972, 'Tullamarine Park', 'Mickleham Road, Tullamarine VIC 3043', 'Yellow and Black', 'Demons', 'https://www.tullamarinefc.com.au', 'info@tullamarinefc.com.au', 'Karen Anderson', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Historical Seasons
INSERT INTO seasons (year, name, division, start_date, end_date, grand_final_date, total_rounds, finals_format, active) VALUES
(2024, '2024 EDFL Premier Division', 'Premier Division', '2024-04-06', '2024-09-28', '2024-09-28', 18, 'McIntyre Final 8', true),
(2023, '2023 EDFL Premier Division', 'Premier Division', '2023-04-01', '2023-09-30', '2023-09-30', 18, 'McIntyre Final 8', false),
(2022, '2022 EDFL Premier Division', 'Premier Division', '2022-04-02', '2022-10-01', '2022-10-01', 18, 'McIntyre Final 8', false),
(2021, '2021 EDFL Premier Division', 'Premier Division', '2021-04-03', '2021-09-25', '2021-09-25', 16, 'Final 6 (COVID-19 affected)', false),
(2020, '2020 EDFL Premier Division', 'Premier Division', '2020-06-01', '2020-08-30', '2020-08-30', 10, 'Final 4 (COVID-19 affected)', false),
(2019, '2019 EDFL Premier Division', 'Premier Division', '2019-04-06', '2019-09-28', '2019-09-28', 18, 'McIntyre Final 8', false),
(2018, '2018 EDFL Premier Division', 'Premier Division', '2018-04-07', '2018-09-29', '2018-09-29', 18, 'McIntyre Final 8', false)
ON CONFLICT (year) DO NOTHING;

-- Insert League History Events
INSERT INTO league_history (year, date_occurred, title, description, event_type, importance_level) VALUES
(1889, '1889-03-15', 'EDFL Foundation', 'The Essendon District Football League was officially formed with six founding clubs at a meeting held at the Essendon Town Hall.', 'milestone', 5),
(1920, '1920-09-18', 'First Official Grand Final', 'The first official EDFL Grand Final was held at Windy Hill, establishing the tradition that continues today.', 'milestone', 5),
(1945, '1945-04-25', 'Post-War Revival', 'The league resumed full operations after World War II, with many clubs rebuilding their teams as servicemen returned home.', 'milestone', 4),
(1965, '1965-05-01', 'Airport District Expansion', 'The league expanded to include clubs from the rapidly developing airport district, reflecting the growth of Melbourne''s northwest.', 'expansion', 4),
(1972, '1972-03-10', 'Introduction of Finals System', 'The modern finals system was introduced, replacing the previous championship playoff format.', 'rule_change', 3),
(1985, '1985-07-20', 'Floodlight Installation', 'The first floodlights were installed at major grounds, allowing for night matches and increased spectator attendance.', 'infrastructure', 3),
(1995, '1995-08-15', 'Centenary Celebrations', 'The EDFL celebrated its centenary with special commemorative matches and the publication of the official league history.', 'celebration', 4),
(2000, '2000-01-01', 'Millennium Season', 'The league entered the new millennium with record membership and the introduction of junior development programs.', 'milestone', 3),
(2010, '2010-06-12', 'Digital Revolution', 'Modern digital scoreboards and electronic timing systems were installed across all major venues.', 'infrastructure', 2),
(2020, '2020-03-23', 'COVID-19 Pandemic Impact', 'The season was significantly disrupted by the COVID-19 pandemic, with matches suspended and a shortened season format implemented.', 'tragedy', 4),
(2021, '2021-02-15', 'Return to Play Protocols', 'Comprehensive COVID-safe protocols were implemented to ensure the safe return of football during the pandemic.', 'rule_change', 3),
(2023, '2023-11-10', 'Women''s Division Launch', 'The EDFL officially launched its women''s division, marking a historic expansion of the competition.', 'expansion', 4)
ON CONFLICT DO NOTHING;

-- Insert Club Seasons for 2023 (example season with realistic data)
INSERT INTO club_seasons (club_id, season_id, wins, losses, draws, points_for, points_against, ladder_position, coach_name, captain_name) VALUES
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), (SELECT id FROM seasons WHERE year = 2023), 16, 2, 0, 2156, 1234, 1, 'Tony Shaw', 'Jake Mitchell'),
((SELECT id FROM clubs WHERE name = 'Strathmore Football Club'), (SELECT id FROM seasons WHERE year = 2023), 14, 4, 0, 1987, 1456, 2, 'Mark Harvey', 'Tom Wilson'),
((SELECT id FROM clubs WHERE name = 'Aberfeldie Football Club'), (SELECT id FROM seasons WHERE year = 2023), 12, 6, 0, 1876, 1567, 3, 'Paul Roos', 'Sam Johnson'),
((SELECT id FROM clubs WHERE name = 'Airport West Football Club'), (SELECT id FROM seasons WHERE year = 2023), 11, 7, 0, 1765, 1678, 4, 'Leigh Matthews', 'Chris Brown'),
((SELECT id FROM clubs WHERE name = 'Avondale Heights Football Club'), (SELECT id FROM seasons WHERE year = 2023), 10, 8, 0, 1654, 1789, 5, 'Kevin Sheedy', 'Matt Davis'),
((SELECT id FROM clubs WHERE name = 'Doutta Stars Football Club'), (SELECT id FROM seasons WHERE year = 2023), 8, 10, 0, 1543, 1890, 6, 'Mick Malthouse', 'Luke Taylor'),
((SELECT id FROM clubs WHERE name = 'Moonee Valley Football Club'), (SELECT id FROM seasons WHERE year = 2023), 6, 12, 0, 1432, 1987, 7, 'Denis Pagan', 'Ben Miller'),
((SELECT id FROM clubs WHERE name = 'Pascoe Vale Football Club'), (SELECT id FROM seasons WHERE year = 2023), 4, 14, 0, 1321, 2098, 8, 'Terry Wallace', 'Josh White'),
((SELECT id FROM clubs WHERE name = 'Essendon Doutta Stars'), (SELECT id FROM seasons WHERE year = 2023), 3, 15, 0, 1210, 2187, 9, 'Matthew Knights', 'Alex Thompson'),
((SELECT id FROM clubs WHERE name = 'Tullamarine Football Club'), (SELECT id FROM seasons WHERE year = 2023), 1, 17, 0, 1098, 2298, 10, 'James Hird', 'Ryan Anderson')
ON CONFLICT (club_id, season_id) DO NOTHING;

-- Update 2023 season with premiers
UPDATE seasons SET 
    premier_club_id = (SELECT id FROM clubs WHERE name = 'Keilor Football Club'),
    runner_up_club_id = (SELECT id FROM clubs WHERE name = 'Strathmore Football Club'),
    wooden_spoon_club_id = (SELECT id FROM clubs WHERE name = 'Tullamarine Football Club'),
    leading_goalkicker_name = 'Jake Mitchell (Keilor)',
    leading_goalkicker_goals = 87,
    best_and_fairest_winner = 'Tom Wilson (Strathmore)'
WHERE year = 2023;

-- Insert some sample matches for 2024 season
INSERT INTO matches (season_id, round_number, match_date, match_time, home_club_id, away_club_id, venue, match_type) VALUES
((SELECT id FROM seasons WHERE year = 2024), 1, '2024-04-06', '14:00', 
 (SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 
 (SELECT id FROM clubs WHERE name = 'Strathmore Football Club'), 
 'Keilor Park', 'Regular'),
((SELECT id FROM seasons WHERE year = 2024), 1, '2024-04-06', '14:00', 
 (SELECT id FROM clubs WHERE name = 'Aberfeldie Football Club'), 
 (SELECT id FROM clubs WHERE name = 'Airport West Football Club'), 
 'Aberfeldie Park', 'Regular'),
((SELECT id FROM seasons WHERE year = 2024), 1, '2024-04-06', '14:00', 
 (SELECT id FROM clubs WHERE name = 'Avondale Heights Football Club'), 
 (SELECT id FROM clubs WHERE name = 'Doutta Stars Football Club'), 
 'Avondale Heights Reserve', 'Regular')
ON CONFLICT DO NOTHING;

-- Insert some match results
INSERT INTO match_results (match_id, home_score_goals, home_score_behinds, away_score_goals, away_score_behinds, winning_club_id, margin, best_on_ground) VALUES
((SELECT id FROM matches WHERE round_number = 1 AND home_club_id = (SELECT id FROM clubs WHERE name = 'Keilor Football Club')), 
 15, 8, 12, 10, 
 (SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 
 16, 'Jake Mitchell'),
((SELECT id FROM matches WHERE round_number = 1 AND home_club_id = (SELECT id FROM clubs WHERE name = 'Aberfeldie Football Club')), 
 11, 12, 13, 8, 
 (SELECT id FROM clubs WHERE name = 'Airport West Football Club'), 
 8, 'Chris Brown'),
((SELECT id FROM matches WHERE round_number = 1 AND home_club_id = (SELECT id FROM clubs WHERE name = 'Avondale Heights Football Club')), 
 18, 6, 9, 15, 
 (SELECT id FROM clubs WHERE name = 'Avondale Heights Football Club'), 
 39, 'Matt Davis')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'EDFL Sample Data Inserted Successfully!' as status,
       (SELECT COUNT(*) FROM clubs) as clubs_count,
       (SELECT COUNT(*) FROM seasons) as seasons_count,
       (SELECT COUNT(*) FROM league_history) as history_events_count,
       (SELECT COUNT(*) FROM club_seasons) as club_seasons_count,
       (SELECT COUNT(*) FROM matches) as matches_count;
