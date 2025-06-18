import { neon } from "@neondatabase/serverless"

async function testDatabaseConnection() {
  const results = {
    envCheck: false,
    connectionTest: false,
    queryTest: false,
    tablesExist: false,
    error: null as string | null,
    details: {} as any,
  }

  try {
    // Step 1: Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    results.envCheck = true

    // Step 2: Parse connection string
    const dbUrl = process.env.DATABASE_URL
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/)

    if (urlMatch) {
      results.details = {
        user: urlMatch[1],
        host: urlMatch[3],
        database: urlMatch[4].split("?")[0],
        hasSSL: dbUrl.includes("sslmode=require"),
      }
    }

    // Step 3: Test basic connection
    const sql = neon(process.env.DATABASE_URL)
    const connectionResult = await sql`
      SELECT 
        NOW() as server_time,
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version
    `
    results.connectionTest = true
    results.details.serverInfo = connectionResult[0]

    // Step 4: Test simple query
    await sql`SELECT 1 as test_query`
    results.queryTest = true

    // Step 5: Check if EDFL tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clubs', 'seasons', 'league_history', 'club_seasons', 'matches', 'match_results')
      ORDER BY table_name
    `
    results.details.tables = tables.map((t) => t.table_name)
    results.tablesExist = tables.length > 0

    // Step 6: If tables exist, get sample data counts
    if (results.tablesExist) {
      const counts = await sql`
        SELECT 
          (SELECT COUNT(*) FROM clubs) as clubs_count,
          (SELECT COUNT(*) FROM seasons) as seasons_count,
          (SELECT COUNT(*) FROM league_history) as history_count
      `
      results.details.dataCounts = counts[0]
    }
  } catch (error: any) {
    results.error = error.message
  }

  return results
}

export default async function TestConnectionPage() {
  const testResults = await testDatabaseConnection()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 EDFL Database Connection Test</h1>
        <p className="text-muted-foreground">
          Comprehensive diagnostic tool to verify your database connection and setup
        </p>
      </div>

      <div className="grid gap-6">
        {/* Environment Check */}
        <div
          className={`p-6 border rounded-lg ${testResults.envCheck ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            {testResults.envCheck ? "✅" : "❌"} Environment Variable Check
          </h2>
          <p className={testResults.envCheck ? "text-green-700" : "text-red-700"}>
            {testResults.envCheck ? "DATABASE_URL is set correctly" : "DATABASE_URL is missing or invalid"}
          </p>
          {testResults.details.user && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h3 className="font-medium mb-2">Connection Details:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>User:</strong> {testResults.details.user}
                </div>
                <div>
                  <strong>Database:</strong> {testResults.details.database}
                </div>
                <div>
                  <strong>Host:</strong> {testResults.details.host}
                </div>
                <div>
                  <strong>SSL:</strong> {testResults.details.hasSSL ? "Enabled ✅" : "Disabled ❌"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Test */}
        <div
          className={`p-6 border rounded-lg ${testResults.connectionTest ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            {testResults.connectionTest ? "✅" : "❌"} Database Connection Test
          </h2>
          <p className={testResults.connectionTest ? "text-green-700" : "text-red-700"}>
            {testResults.connectionTest ? "Successfully connected to Neon database" : "Failed to connect to database"}
          </p>
          {testResults.details.serverInfo && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h3 className="font-medium mb-2">Server Information:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Server Time:</strong> {new Date(testResults.details.serverInfo.server_time).toLocaleString()}
                </div>
                <div>
                  <strong>Database:</strong> {testResults.details.serverInfo.database_name}
                </div>
                <div>
                  <strong>User:</strong> {testResults.details.serverInfo.current_user}
                </div>
                <div>
                  <strong>PostgreSQL:</strong> {testResults.details.serverInfo.postgres_version.split(" ")[1]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Query Test */}
        <div
          className={`p-6 border rounded-lg ${testResults.queryTest ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            {testResults.queryTest ? "✅" : "❌"} Query Execution Test
          </h2>
          <p className={testResults.queryTest ? "text-green-700" : "text-red-700"}>
            {testResults.queryTest
              ? "Database queries are executing successfully"
              : "Database queries failed to execute"}
          </p>
        </div>

        {/* Tables Check */}
        <div
          className={`p-6 border rounded-lg ${testResults.tablesExist ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
        >
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            {testResults.tablesExist ? "✅" : "⚠️"} EDFL Database Schema
          </h2>
          <p className={testResults.tablesExist ? "text-green-700" : "text-yellow-700"}>
            {testResults.tablesExist
              ? "EDFL database tables are properly set up"
              : "EDFL tables not found - database setup required"}
          </p>

          {testResults.details.tables && testResults.details.tables.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h3 className="font-medium mb-2">Found Tables ({testResults.details.tables.length}/6):</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {["clubs", "seasons", "league_history", "club_seasons", "matches", "match_results"].map((table) => (
                  <div
                    key={table}
                    className={testResults.details.tables.includes(table) ? "text-green-600" : "text-red-600"}
                  >
                    {testResults.details.tables.includes(table) ? "✅" : "❌"} {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults.details.dataCounts && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h3 className="font-medium mb-2">Data Summary:</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <strong>Clubs:</strong> {testResults.details.dataCounts.clubs_count}
                </div>
                <div>
                  <strong>Seasons:</strong> {testResults.details.dataCounts.seasons_count}
                </div>
                <div>
                  <strong>History:</strong> {testResults.details.dataCounts.history_count}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {testResults.error && (
          <div className="p-6 border rounded-lg bg-red-50 border-red-200">
            <h2 className="text-xl font-semibold mb-3 text-red-700">❌ Error Details</h2>
            <div className="bg-red-100 p-4 rounded border border-red-200 mb-4">
              <code className="text-red-700 text-sm break-all">{testResults.error}</code>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-red-700">🔧 Troubleshooting Steps:</h3>

              {testResults.error.includes("DATABASE_URL") && (
                <div className="p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-red-600">Environment Variable Issue:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    <li>Go to Vercel project Settings → Environment Variables</li>
                    <li>Add DATABASE_URL with your Neon connection string</li>
                    <li>Make sure it's enabled for Production, Preview, and Development</li>
                    <li>Redeploy your application</li>
                  </ul>
                </div>
              )}

              {testResults.error.includes("password authentication") && (
                <div className="p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-red-600">Authentication Issue:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    <li>Reset your password in Neon console</li>
                    <li>Update DATABASE_URL in Vercel with the new connection string</li>
                    <li>Ensure the password in the connection string is correct</li>
                  </ul>
                </div>
              )}

              {testResults.error.includes("timeout") && (
                <div className="p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-red-600">Connection Timeout:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    <li>Check if your Neon database is active (not paused)</li>
                    <li>Verify your internet connection</li>
                    <li>Try again in a few minutes</li>
                  </ul>
                </div>
              )}

              {testResults.error.includes("relation") && testResults.error.includes("does not exist") && (
                <div className="p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-red-600">Missing Tables:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    <li>Run the database schema creation script (001-create-edfl-schema.sql)</li>
                    <li>Run the seed data script (002-seed-edfl-data.sql)</li>
                    <li>Check the scripts ran without errors</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">🚀 Next Steps</h2>
          <div className="space-y-2">
            {!testResults.envCheck && (
              <div className="flex items-center text-blue-700">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs mr-2">1</span>
                Set DATABASE_URL in Vercel environment variables
              </div>
            )}
            {testResults.envCheck && !testResults.connectionTest && (
              <div className="flex items-center text-blue-700">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs mr-2">2</span>
                Reset your Neon database password and update Vercel
              </div>
            )}
            {testResults.connectionTest && !testResults.tablesExist && (
              <div className="flex items-center text-blue-700">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs mr-2">3</span>
                Run database setup scripts to create EDFL tables
              </div>
            )}
            {testResults.tablesExist && testResults.details.dataCounts && (
              <div className="flex items-center text-green-700">
                <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs mr-2">✓</span>
                Your EDFL app is ready! Visit the{" "}
                <a href="/clubs" className="underline">
                  Clubs page
                </a>{" "}
                to see your data.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border rounded-lg bg-gray-50 border-gray-200">
          <h2 className="text-xl font-semibold mb-3">🔗 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="/" className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-sm font-medium">Home</div>
            </a>
            <a href="/clubs" className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-1">🏟️</div>
              <div className="text-sm font-medium">Clubs</div>
            </a>
            <a
              href="/league-history"
              className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-1">📚</div>
              <div className="text-sm font-medium">History</div>
            </a>
            <a href="/admin" className="p-3 bg-white border rounded text-center hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-1">⚙️</div>
              <div className="text-sm font-medium">Admin</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
