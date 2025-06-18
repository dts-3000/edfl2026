-- Insert sample data for the EDFL

-- Insert some historical clubs
INSERT INTO clubs (name, founded_year, home_ground, colors, nickname, active) VALUES
('Essendon District', 1900, 'Essendon Recreation Reserve', 'Red and Black', 'Bombers', true),
('Moonee Valley', 1895, 'Moonee Valley Park', 'Blue and White', 'Eagles', true),
('Strathmore', 1920, 'Strathmore Community Park', 'Green and Gold', 'Magpies', true),
('Keilor', 1888, 'Keilor Park', 'Navy and Sky Blue', 'Blues', true),
('Aberfeldie', 1922, 'Aberfeldie Park', 'Red and White', 'Jets', true),
('Airport West', 1965, 'Essendon Airport Oval', 'Purple and Gold', 'Hawks', true),
('Avondale Heights', 1958, 'Avondale Heights Reserve', 'Maroon and Gold', 'Warriors', true),
('Doutta Stars', 1954, 'Cross Keys Reserve', 'Black and White', 'Stars', true)
ON CONFLICT DO NOTHING;

-- Insert some historical seasons
INSERT INTO seasons (year, name, start_date, end_date, total_rounds) VALUES
(2023, '2023 EDFL Premier Division', '2023-04-01', '2023-09-30', 18),
(2022, '2022 EDFL Premier Division', '2022-04-02', '2022-10-01', 18),
(2021, '2021 EDFL Premier Division', '2021-04-03', '2021-09-25', 16),
(2020, '2020 EDFL Premier Division (COVID-19 affected)', '2020-06-01', '2020-08-30', 10)
ON CONFLICT DO NOTHING;

-- Insert some league history events
INSERT INTO league_history (year, title, description, event_type) VALUES
(1889, 'League Formation', 'The Essendon District Football League was officially formed with 6 founding clubs.', 'milestone'),
(1920, 'First Grand Final', 'The first official EDFL Grand Final was held at Windy Hill.', 'milestone'),
(1965, 'League Expansion', 'The league expanded to include clubs from the airport district.', 'expansion'),
(1995, 'Centenary Celebrations', 'The EDFL celebrated its centenary with special commemorative matches.', 'milestone'),
(2010, 'Digital Scoreboard Installation', 'Modern digital scoreboards were installed at major grounds.', 'infrastructure')
ON CONFLICT DO NOTHING;
