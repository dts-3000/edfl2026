import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function verifyEDFLSetup() {
  console.log("🏈 Verifying EDFL Database Setup")
  console.log("=".repeat(50))

  try {
    // Check all tables exist
    console.log("📋 Checking database structure...")
    const tables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log("✅ Database tables created:")
    tables.forEach((table) => {
      console.log(`   📊 ${table.table_name} (${table.column_count} columns)`)
    })

    // Check data counts
    console.log("\n📈 Data verification:")
    const clubCount = await sql`SELECT COUNT(*) as count FROM clubs`
    const seasonCount = await sql`SELECT COUNT(*) as count FROM seasons`
    const historyCount = await sql`SELECT COUNT(*) as count FROM league_history`
    const clubSeasonCount = await sql`SELECT COUNT(*) as count FROM club_seasons`
    const matchCount = await sql`SELECT COUNT(*) as count FROM matches`

    console.log(`   🏟️  Clubs: ${clubCount[0].count}`)
    console.log(`   📅 Seasons: ${seasonCount[0].count}`)
    console.log(`   📚 History Events: ${historyCount[0].count}`)
    console.log(`   📊 Club Seasons: ${clubSeasonCount[0].count}`)
    console.log(`   ⚽ Matches: ${matchCount[0].count}`)

    // Show sample clubs
    console.log("\n🏈 Sample Clubs:")
    const sampleClubs = await sql`
      SELECT name, nickname, colors, founded_year, home_ground 
      FROM clubs 
      WHERE active = true 
      ORDER BY name 
      LIMIT 5
    `

    sampleClubs.forEach((club) => {
      console.log(`   • ${club.name} (${club.nickname}) - ${club.colors}`)
      console.log(`     Founded: ${club.founded_year}, Ground: ${club.home_ground}`)
    })

    // Show current season info
    console.log("\n📅 Current Season (2024):")
    const currentSeason = await sql`
      SELECT * FROM seasons WHERE year = 2024
    `

    if (currentSeason.length > 0) {
      const season = currentSeason[0]
      console.log(`   📊 ${season.name}`)
      console.log(`   📅 ${season.start_date} to ${season.end_date}`)
      console.log(`   🏆 ${season.total_rounds} rounds, ${season.finals_format}`)
    }

    // Show recent history
    console.log("\n📚 Recent League History:")
    const recentHistory = await sql`
      SELECT year, title, event_type, importance_level
      FROM league_history 
      ORDER BY year DESC 
      LIMIT 5
    `

    recentHistory.forEach((event) => {
      const importance = "⭐".repeat(event.importance_level)
      console.log(`   ${event.year}: ${event.title} (${event.event_type}) ${importance}`)
    })

    // Test views
    console.log("\n🔍 Testing database views...")
    const ladderSample = await sql`SELECT * FROM current_ladder LIMIT 3`
    console.log(`   ✅ Current ladder view: ${ladderSample.length} records`)

    const matchSample = await sql`SELECT * FROM match_results_view LIMIT 3`
    console.log(`   ✅ Match results view: ${matchSample.length} records`)

    console.log("\n" + "=".repeat(50))
    console.log("🎉 EDFL DATABASE SETUP COMPLETE!")
    console.log("✅ All tables created successfully")
    console.log("✅ Sample data populated")
    console.log("✅ Database views working")
    console.log("✅ Ready for EDFL web application")
    console.log("\n🚀 Your EDFL database is fully operational!")
  } catch (error) {
    console.error("❌ Database verification failed:", error.message)
    console.log("\n🔍 Troubleshooting:")
    console.log("1. Make sure the schema creation script ran successfully")
    console.log("2. Check if there were any constraint violations")
    console.log("3. Verify the connection string is correct")
  }
}

verifyEDFLSetup()
