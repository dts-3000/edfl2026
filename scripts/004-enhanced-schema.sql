-- Enhanced EDFL Database Schema
-- Add tables for detailed match management, club achievements, and player records

-- Add columns to existing tables first
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS club_history TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS established_details TEXT;

-- Create Club Achievements table
CREATE TABLE IF NOT EXISTS club_achievements (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id),
    achievement_type VARCHAR(50) NOT NULL, -- 'premiership', 'runner_up', 'best_and_fairest', 'leading_goalkicker'
    year INTEGER NOT NULL,
    season_id INTEGER REFERENCES seasons(id),
    player_name VARCHAR(255), -- For individual awards
    details TEXT, -- Additional details about the achievement
    goals_kicked INTEGER, -- For leading goalkicker
    votes_received INTEGER, -- For best and fairest
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Club Players table (for VFL/AFL players and record holders)
CREATE TABLE IF NOT EXISTS club_players (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id),
    player_name VARCHAR(255) NOT NULL,
    player_type VARCHAR(50) NOT NULL, -- 'vfl_afl', 'record_holder', 'hall_of_fame'
    years_active VARCHAR(100), -- e.g., "1995-2003"
    games_played INTEGER,
    goals_kicked INTEGER,
    vfl_afl_club VARCHAR(255), -- Which VFL/AFL club they played for
    debut_year INTEGER,
    record_type VARCHAR(100), -- e.g., "Most Games", "Most Goals", "Club Champion"
    record_details TEXT,
    notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Match Comments table (for newspaper cuttings and commentary)
CREATE TABLE IF NOT EXISTS match_comments (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    comment_type VARCHAR(50) NOT NULL, -- 'newspaper', 'commentary', 'photo', 'program'
    title VARCHAR(255),
    content TEXT,
    source VARCHAR(255), -- e.g., "Herald Sun", "Local Observer"
    date_published DATE,
    author VARCHAR(255),
    image_url VARCHAR(500), -- For newspaper cuttings or photos
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Season Rounds table (to organize matches by rounds)
CREATE TABLE IF NOT EXISTS season_rounds (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    round_number INTEGER NOT NULL,
    round_name VARCHAR(100), -- e.g., "Round 1", "Elimination Final", "Grand Final"
    round_date DATE,
    is_finals BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(season_id, round_number)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_achievements_club ON club_achievements(club_id);
CREATE INDEX IF NOT EXISTS idx_club_achievements_type ON club_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_club_achievements_year ON club_achievements(year);
CREATE INDEX IF NOT EXISTS idx_club_players_club ON club_players(club_id);
CREATE INDEX IF NOT EXISTS idx_club_players_type ON club_players(player_type);
CREATE INDEX IF NOT EXISTS idx_match_comments_match ON match_comments(match_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_type ON match_comments(comment_type);
CREATE INDEX IF NOT EXISTS idx_season_rounds_season ON season_rounds(season_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_club_achievements_updated_at 
    BEFORE UPDATE ON club_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_club_players_updated_at 
    BEFORE UPDATE ON club_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_match_comments_updated_at 
    BEFORE UPDATE ON match_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO club_achievements (club_id, achievement_type, year, player_name, details) VALUES
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 'premiership', 2023, NULL, '2023 EDFL Premier Division Premiers'),
((SELECT id FROM clubs WHERE name = 'Strathmore Football Club'), 'runner_up', 2023, NULL, '2023 EDFL Premier Division Runner-up'),
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 'best_and_fairest', 2023, 'Jake Mitchell', 'Club Best & Fairest winner'),
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 'leading_goalkicker', 2023, 'Tom Wilson', 'Leading goalkicker with 67 goals', 67)
ON CONFLICT DO NOTHING;

INSERT INTO club_players (club_id, player_name, player_type, years_active, games_played, vfl_afl_club, debut_year, notes) VALUES
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 'Michael Long', 'vfl_afl', '1985-1990', 98, 'Essendon', 1990, 'Brownlow Medallist, played 190 AFL games'),
((SELECT id FROM clubs WHERE name = 'Strathmore Football Club'), 'James Hird', 'vfl_afl', '1988-1992', 76, 'Essendon', 1992, 'Essendon Captain, Brownlow Medallist'),
((SELECT id FROM clubs WHERE name = 'Keilor Football Club'), 'Bill Thompson', 'record_holder', '1975-1995', 387, NULL, NULL, 'Club games record holder', 'Most games played for Keilor FC')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Enhanced EDFL Database Schema Created Successfully!' as status,
       'Added club achievements, players, match comments, and season rounds' as details;
