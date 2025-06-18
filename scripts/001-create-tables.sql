-- Create the main tables for the EDFL database

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    founded_year INTEGER,
    home_ground VARCHAR(255),
    colors VARCHAR(255),
    nickname VARCHAR(255),
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    premier_club_id INTEGER REFERENCES clubs(id),
    runner_up_club_id INTEGER REFERENCES clubs(id),
    wooden_spoon_club_id INTEGER REFERENCES clubs(id),
    total_rounds INTEGER,
    finals_format VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- League history events table
CREATE TABLE IF NOT EXISTS league_history (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- 'milestone', 'rule_change', 'expansion', 'merger', etc.
    related_club_id INTEGER REFERENCES clubs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Club seasons (junction table for clubs participating in seasons)
CREATE TABLE IF NOT EXISTS club_seasons (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id),
    season_id INTEGER REFERENCES seasons(id),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    ladder_position INTEGER,
    finals_position VARCHAR(50), -- 'Preliminary Final', 'Grand Final', etc.
    UNIQUE(club_id, season_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);
CREATE INDEX IF NOT EXISTS idx_league_history_year ON league_history(year);
CREATE INDEX IF NOT EXISTS idx_club_seasons_season ON club_seasons(season_id);
CREATE INDEX IF NOT EXISTS idx_club_seasons_club ON club_seasons(club_id);
