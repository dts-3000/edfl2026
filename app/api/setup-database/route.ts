import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  const results = {
    connectionTest: false,
    schemaCreated: false,
    dataSeeded: false,
    error: null as string | null,
    details: [] as string[],
  }

  try {
    // Step 1: Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    results.details.push("✅ DATABASE_URL found")

    // Step 2: Test basic connection
    await sql`SELECT 1`
    results.connectionTest = true
    results.details.push("✅ Database connection successful")

    // Step 3: Create schema
    try {
      // Drop existing tables if they exist (in correct order due to foreign keys)
      await sql`DROP TABLE IF EXISTS match_results CASCADE`
      await sql`DROP TABLE IF EXISTS club_seasons CASCADE`
      await sql`DROP TABLE IF EXISTS matches CASCADE`
      await sql`DROP TABLE IF EXISTS league_history CASCADE`
      await sql`DROP TABLE IF EXISTS seasons CASCADE`
      await sql`DROP TABLE IF EXISTS clubs CASCADE`
      results.details.push("🧹 Cleaned up existing tables")

      // Create Clubs table
      await sql`
        CREATE TABLE clubs (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          founded_year INTEGER,
          home_ground VARCHAR(255),
          colors VARCHAR(255),
          nickname VARCHAR(255),
          website VARCHAR(500),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(20),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.details.push("✅ Created clubs table")

      // Create Seasons table
      await sql`
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
        )
      `
      results.details.push("✅ Created seasons table")

      // Create League History table
      await sql`
        CREATE TABLE league_history (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          date_occurred DATE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL,
          related_club_id INTEGER REFERENCES clubs(id),
          related_season_id INTEGER REFERENCES seasons(id),
          importance_level INTEGER DEFAULT 3,
          image_url VARCHAR(500),
          source_reference VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.details.push("✅ Created league_history table")

      results.schemaCreated = true
      results.details.push("🎉 Database schema created successfully")
    } catch (error: any) {
      throw new Error(`Schema creation failed: ${error.message}`)
    }

    // Step 4: Seed data
    try {
      // Insert sample clubs
      await sql`
        INSERT INTO clubs (name, founded_year, home_ground, colors, nickname, website, contact_email, active) VALUES
        ('Keilor Football Club', 1888, 'Keilor Park', 'Navy Blue and Sky Blue', 'Blues', 'https://www.keilorfc.com.au', 'admin@keilorfc.com.au', true),
        ('Strathmore Football Club', 1920, 'Strathmore Community Park', 'Green and Gold', 'Mores', 'https://www.strathmore.com.au', 'president@strathmore.com.au', true),
        ('Aberfeldie Football Club', 1922, 'Aberfeldie Park', 'Red and White', 'Jets', 'https://www.aberfeldiefc.com.au', 'info@aberfeldiefc.com.au', true),
        ('Airport West Football Club', 1965, 'Essendon Airport Oval', 'Purple and Gold', 'Hawks', 'https://www.airportwestfc.com.au', 'secretary@airportwestfc.com.au', true),
        ('Avondale Heights Football Club', 1958, 'Avondale Heights Reserve', 'Maroon and Gold', 'Warriors', 'https://www.avondaleheights.com.au', 'contact@avondaleheights.com.au', true)
        ON CONFLICT (name) DO NOTHING
      `
      results.details.push("✅ Inserted sample clubs")

      // Insert sample seasons
      await sql`
        INSERT INTO seasons (year, name, division, start_date, end_date, grand_final_date, total_rounds, finals_format, active) VALUES
        (2024, '2024 EDFL Premier Division', 'Premier Division', '2024-04-06', '2024-09-28', '2024-09-28', 18, 'McIntyre Final 8', true),
        (2023, '2023 EDFL Premier Division', 'Premier Division', '2023-04-01', '2023-09-30', '2023-09-30', 18, 'McIntyre Final 8', false),
        (2022, '2022 EDFL Premier Division', 'Premier Division', '2022-04-02', '2022-10-01', '2022-10-01', 18, 'McIntyre Final 8', false)
        ON CONFLICT (year) DO NOTHING
      `
      results.details.push("✅ Inserted sample seasons")

      // Insert sample league history
      await sql`
        INSERT INTO league_history (year, date_occurred, title, description, event_type, importance_level) VALUES
        (1889, '1889-03-15', 'EDFL Foundation', 'The Essendon District Football League was officially formed with six founding clubs at a meeting held at the Essendon Town Hall.', 'milestone', 5),
        (1920, '1920-09-18', 'First Official Grand Final', 'The first official EDFL Grand Final was held at Windy Hill, establishing the tradition that continues today.', 'milestone', 5),
        (2023, '2023-11-10', 'Women''s Division Launch', 'The EDFL officially launched its women''s division, marking a historic expansion of the competition.', 'expansion', 4)
        ON CONFLICT DO NOTHING
      `
      results.details.push("✅ Inserted sample league history")

      results.dataSeeded = true
      results.details.push("🎉 Sample data inserted successfully")
    } catch (error: any) {
      throw new Error(`Data seeding failed: ${error.message}`)
    }

    results.details.push("🚀 EDFL database setup complete!")
  } catch (error: any) {
    results.error = error.message
    console.error("Database setup error:", error)
  }

  return NextResponse.json(results)
}
