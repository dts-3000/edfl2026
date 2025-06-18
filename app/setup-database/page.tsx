"use client"

import { neon } from "@neondatabase/serverless"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, CheckCircle, AlertCircle } from "lucide-react"

async function setupDatabase() {
  const results = {
    connectionTest: false,
    schemaCreated: false,
    dataSeeded: false,
    error: null as string | null,
    details: [] as string[],
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const sql = neon(process.env.DATABASE_URL)

    // Test connection
    await sql`SELECT 1`
    results.connectionTest = true
    results.details.push("✅ Database connection successful")

    // Create schema
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
          social_media JSONB,
          notes TEXT,
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

      // Create Club Seasons table
      await sql`
        CREATE TABLE club_seasons (
          id SERIAL PRIMARY KEY,
          club_id INTEGER NOT NULL REFERENCES clubs(id),
          season_id INTEGER NOT NULL REFERENCES seasons(id),
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          draws INTEGER DEFAULT 0,
          points_for INTEGER DEFAULT 0,
          points_against INTEGER DEFAULT 0,
          percentage DECIMAL(6,2),
          ladder_position INTEGER,
          finals_position VARCHAR(50),
          coach_name VARCHAR(255),
          captain_name VARCHAR(255),
          best_and_fairest VARCHAR(255),
          leading_goalkicker VARCHAR(255),
          leading_goalkicker_goals INTEGER,
          season_notes TEXT,
          UNIQUE(club_id, season_id)
        )
      `
      results.details.push("✅ Created club_seasons table")

      // Create Matches table
      await sql`
        CREATE TABLE matches (
          id SERIAL PRIMARY KEY,
          season_id INTEGER NOT NULL REFERENCES seasons(id),
          round_number INTEGER,
          match_date DATE,
          match_time TIME,
          home_club_id INTEGER NOT NULL REFERENCES clubs(id),
          away_club_id INTEGER NOT NULL REFERENCES clubs(id),
          venue VARCHAR(255),
          match_type VARCHAR(50) DEFAULT 'Regular',
          weather_conditions VARCHAR(100),
          attendance INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT different_clubs CHECK (home_club_id != away_club_id)
        )
      `
      results.details.push("✅ Created matches table")

      // Create Match Results table
      await sql`
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
          margin INTEGER,
          best_on_ground VARCHAR(255),
          goal_kickers JSONB,
          match_report TEXT,
          umpires VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.details.push("✅ Created match_results table")

      results.schemaCreated = true
      results.details.push("🎉 Database schema created successfully")
    } catch (error: any) {
      throw new Error(`Schema creation failed: ${error.message}`)
    }

    // Seed data
    try {
      // Insert sample clubs
      await sql`
        INSERT INTO clubs (name, founded_year, home_ground, ground_address, colors, nickname, website, contact_email, president_name, active) VALUES
        ('Keilor Football Club', 1888, 'Keilor Park', '7 Keilor Park Drive, Keilor East VIC 3033', 'Navy Blue and Sky Blue', 'Blues', 'https://www.keilorfc.com.au', 'admin@keilorfc.com.au', 'John Smith', true),
        ('Strathmore Football Club', 1920, 'Strathmore Community Park', '52 Napier Street, Strathmore VIC 3041', 'Green and Gold', 'Mores', 'https://www.strathmore.com.au', 'president@strathmore.com.au', 'Sarah Johnson', true),
        ('Aberfeldie Football Club', 1922, 'Aberfeldie Park', '2A Vida Street, Aberfeldie VIC 3040', 'Red and White', 'Jets', 'https://www.aberfeldiefc.com.au', 'info@aberfeldiefc.com.au', 'Michael Brown', true),
        ('Airport West Football Club', 1965, 'Essendon Airport Oval', 'Keilor Park Drive, Tullamarine VIC 3043', 'Purple and Gold', 'Hawks', 'https://www.airportwestfc.com.au', 'secretary@airportwestfc.com.au', 'Lisa Wilson', true),
        ('Avondale Heights Football Club', 1958, 'Avondale Heights Reserve', 'Military Road, Avondale Heights VIC 3034', 'Maroon and Gold', 'Warriors', 'https://www.avondaleheights.com.au', 'contact@avondaleheights.com.au', 'David Miller', true)
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
  } catch (error: any) {
    results.error = error.message
  }

  return results
}

export default async function SetupDatabasePage() {
  const setupResults = await setupDatabase()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Database Setup</h1>
        <p className="text-muted-foreground">Automatic setup of the EDFL database schema and sample data</p>
      </div>

      <div className="grid gap-6">
        {/* Setup Results */}
        <Card className={setupResults.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader>
            <CardTitle className={`flex items-center ${setupResults.error ? "text-red-700" : "text-green-700"}`}>
              {setupResults.error ? <AlertCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              {setupResults.error ? "Setup Failed" : "Setup Completed Successfully"}
            </CardTitle>
            <CardDescription className={setupResults.error ? "text-red-600" : "text-green-600"}>
              {setupResults.error ? "There was an error during database setup" : "Your EDFL database is ready to use"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {setupResults.error ? (
              <div className="p-3 bg-red-100 rounded border border-red-200 mb-4">
                <code className="text-red-700 text-sm">{setupResults.error}</code>
              </div>
            ) : (
              <div className="space-y-2">
                {setupResults.details.map((detail, index) => (
                  <div key={index} className="text-sm text-green-700">
                    {detail}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={setupResults.connectionTest ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm ${setupResults.connectionTest ? "text-green-700" : "text-red-700"}`}>
                {setupResults.connectionTest ? "✅" : "❌"} Connection Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={`text-xs ${setupResults.connectionTest ? "text-green-600" : "text-red-600"}`}>
                {setupResults.connectionTest ? "Database connected" : "Connection failed"}
              </p>
            </CardContent>
          </Card>

          <Card className={setupResults.schemaCreated ? "border-green-200 bg-green-50" : "border-gray-200"}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm ${setupResults.schemaCreated ? "text-green-700" : "text-gray-500"}`}>
                {setupResults.schemaCreated ? "✅" : "⏳"} Schema Creation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={`text-xs ${setupResults.schemaCreated ? "text-green-600" : "text-gray-500"}`}>
                {setupResults.schemaCreated ? "Tables created" : "Pending"}
              </p>
            </CardContent>
          </Card>

          <Card className={setupResults.dataSeeded ? "border-green-200 bg-green-50" : "border-gray-200"}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm ${setupResults.dataSeeded ? "text-green-700" : "text-gray-500"}`}>
                {setupResults.dataSeeded ? "✅" : "⏳"} Data Seeding
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={`text-xs ${setupResults.dataSeeded ? "text-green-600" : "text-gray-500"}`}>
                {setupResults.dataSeeded ? "Sample data added" : "Pending"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        {!setupResults.error && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">🎉 Setup Complete!</CardTitle>
              <CardDescription className="text-blue-600">
                Your EDFL database is now ready. You can start using the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  href="/clubs"
                  className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">🏟️</div>
                  <div className="text-sm font-medium">View Clubs</div>
                </Link>
                <Link
                  href="/league-history"
                  className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-sm font-medium">League History</div>
                </Link>
                <Link
                  href="/historical-seasons"
                  className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-sm font-medium">Seasons</div>
                </Link>
                <Link
                  href="/test-connection"
                  className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-sm font-medium">Test Connection</div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Recovery */}
        {setupResults.error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-700">🔧 Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded border">
                <h4 className="font-medium text-yellow-600 mb-2">Common Solutions:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                  <li>Check that DATABASE_URL is set in Vercel environment variables</li>
                  <li>Verify your Neon database is active and not paused</li>
                  <li>Try refreshing this page to retry setup</li>
                  <li>Check the Test Connection page for detailed diagnostics</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Link href="/test-connection">
                  <Button variant="outline">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </Link>
                <Button onClick={() => window.location.reload()}>
                  <Play className="h-4 w-4 mr-2" />
                  Retry Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
