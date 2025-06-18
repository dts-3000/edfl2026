-- EDFL Database Schema Creation
-- Essendon District Football League Management System

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS match_results CASCADE;
DROP TABLE IF EXISTS club_seasons CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS league_history CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;

-- Create Clubs table
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    founded_year INTEGER,
    home_ground VARCHAR(255),
    ground_address TEXT,
    colors VARCHAR(255),
    nickname VARCHAR(255),
    website VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    president_name VARCHAR(255),
    coach_name VARCHAR(255),
    active BOOLEAN DEFAULT true,
    logo_url VARCHAR(500),
    social_media JSONB, -- Store Facebook, Instagram, Twitter handles
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Seasons table
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    name VARCHAR(255),
    division VARCHAR(100) DEFAULT 'Premier Division',
    start_date DATE,
    end_date DATE,
    grand_final_date DATE,
    premier_club_id INTEGER REFERENCES clubs(id),
    runner_up_club_id INTEGER REFERENCES clubs(id),
    wooden_spoon_club_id INTEGER REFERENCES clubs(id),
    leading_goalkicker_name VARCHAR(255),
    leading_goalkicker_goals INTEGER,
    best_and_fairest_winner VARCHAR(255),
    total_rounds INTEGER,
    finals_format VARCHAR(100),
    season_summary TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create League History table
CREATE TABLE league_history (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    date_occurred DATE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'milestone', 'rule_change', 'expansion', 'merger', 'championship', 'tragedy', 'celebration'
    related_club_id INTEGER REFERENCES clubs(id),
    related_season_id INTEGER REFERENCES seasons(id),
    importance_level INTEGER DEFAULT 3, -- 1-5 scale (5 being most important)
    image_url VARCHAR(500),
    source_reference VARCHAR(500), -- Where this information came from
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Club Seasons junction table (clubs participating in seasons)
CREATE TABLE club_seasons (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id),
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    percentage DECIMAL(6,2), -- Calculated as (points_for / points_against) * 100
    ladder_position INTEGER,
    finals_position VARCHAR(50), -- 'Eliminated Final', 'Semi Final', 'Preliminary Final', 'Grand Final', 'Premier'
    coach_name VARCHAR(255),
    captain_name VARCHAR(255),
    best_and_fairest VARCHAR(255),
    leading_goalkicker VARCHAR(255),
    leading_goalkicker_goals INTEGER,
    season_notes TEXT,
    UNIQUE(club_id, season_id)
);

-- Create Matches table (for detailed match records)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    round_number INTEGER,
    match_date DATE,
    match_time TIME,
    home_club_id INTEGER NOT NULL REFERENCES clubs(id),
    away_club_id INTEGER NOT NULL REFERENCES clubs(id),
    venue VARCHAR(255),
    match_type VARCHAR(50) DEFAULT 'Regular', -- 'Regular', 'Final', 'Semi Final', 'Preliminary Final', 'Grand Final'
    weather_conditions VARCHAR(100),
    attendance INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_clubs CHECK (home_club_id != away_club_id)
);

-- Create Match Results table (scores and details)
CREATE TABLE match_results (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    home_score_goals INTEGER DEFAULT 0,
    home_score_behinds INTEGER DEFAULT 0,
    home_score_total INTEGER GENERATED ALWAYS AS (home_score_goals * 6 + home_score_behinds) STORED,
    away_score_goals INTEGER DEFAULT 0,
    away_score_behinds INTEGER DEFAULT 0,
    away_score_total INTEGER GENERATED ALWAYS AS (away_score_goals * 6 + away_score_behinds) STORED,
    winning_club_id INTEGER REFERENCES clubs(id),
    margin INTEGER, -- Winning margin in points
    best_on_ground VARCHAR(255),
    goal_kickers JSONB, -- Store goal kickers and their goals as JSON
    match_report TEXT,
    umpires VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_clubs_active ON clubs(active);
CREATE INDEX idx_seasons_year ON seasons(year);
CREATE INDEX idx_seasons_active ON seasons(active);
CREATE INDEX idx_league_history_year ON league_history(year);
CREATE INDEX idx_league_history_event_type ON league_history(event_type);
CREATE INDEX idx_league_history_importance ON league_history(importance_level);
CREATE INDEX idx_club_seasons_season ON club_seasons(season_id);
CREATE INDEX idx_club_seasons_club ON club_seasons(club_id);
CREATE INDEX idx_club_seasons_ladder ON club_seasons(ladder_position);
CREATE INDEX idx_matches_season ON matches(season_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_clubs ON matches(home_club_id, away_club_id);
CREATE INDEX idx_match_results_match ON match_results(match_id);
CREATE INDEX idx_match_results_winner ON match_results(winning_club_id);

-- Create triggers to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_league_history_updated_at BEFORE UPDATE ON league_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_results_updated_at BEFORE UPDATE ON match_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy ladder calculations
CREATE OR REPLACE VIEW current_ladder AS
SELECT 
    cs.*,
    c.name as club_name,
    c.nickname,
    c.colors,
    s.year as season_year,
    (cs.wins * 4 + cs.draws * 2) as points, -- 4 points for win, 2 for draw
    CASE 
        WHEN cs.points_against = 0 THEN 0 
        ELSE ROUND((cs.points_for::DECIMAL / cs.points_against::DECIMAL) * 100, 2) 
    END as calculated_percentage
FROM club_seasons cs
JOIN clubs c ON cs.club_id = c.id
JOIN seasons s ON cs.season_id = s.id
WHERE s.active = true
ORDER BY 
    (cs.wins * 4 + cs.draws * 2) DESC, -- Points first
    CASE 
        WHEN cs.points_against = 0 THEN 0 
        ELSE (cs.points_for::DECIMAL / cs.points_against::DECIMAL) * 100 
    END DESC, -- Then percentage
    cs.points_for DESC; -- Then points for

-- Create a view for match results with club names
CREATE OR REPLACE VIEW match_results_view AS
SELECT 
    m.id as match_id,
    m.round_number,
    m.match_date,
    m.match_time,
    m.venue,
    m.match_type,
    hc.name as home_club,
    hc.nickname as home_nickname,
    ac.name as away_club,
    ac.nickname as away_nickname,
    mr.home_score_goals,
    mr.home_score_behinds,
    mr.home_score_total,
    mr.away_score_goals,
    mr.away_score_behinds,
    mr.away_score_total,
    wc.name as winning_club,
    mr.margin,
    mr.best_on_ground,
    s.year as season_year,
    s.name as season_name
FROM matches m
JOIN clubs hc ON m.home_club_id = hc.id
JOIN clubs ac ON m.away_club_id = ac.id
JOIN seasons s ON m.season_id = s.id
LEFT JOIN match_results mr ON m.id = mr.match_id
LEFT JOIN clubs wc ON mr.winning_club_id = wc.id
ORDER BY m.match_date DESC, m.match_time DESC;

-- Add some constraints and checks
ALTER TABLE club_seasons ADD CONSTRAINT positive_stats 
    CHECK (wins >= 0 AND losses >= 0 AND draws >= 0 AND points_for >= 0 AND points_against >= 0);

ALTER TABLE match_results ADD CONSTRAINT positive_scores 
    CHECK (home_score_goals >= 0 AND home_score_behinds >= 0 AND away_score_goals >= 0 AND away_score_behinds >= 0);

ALTER TABLE league_history ADD CONSTRAINT valid_importance 
    CHECK (importance_level >= 1 AND importance_level <= 5);

-- Success message
SELECT 'EDFL Database Schema Created Successfully!' as status;
