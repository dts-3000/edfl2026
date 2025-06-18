"use client"

import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Database, Table, Users } from "lucide-react"
import Link from "next/link"

async function testDatabaseConnection() {
  const results = {
    hasEnvVar: !!process.env.DATABASE_URL,
    envVarPreview: process.env.DATABASE_URL?.substring(0, 30) + "...",
    canConnect: false,
    tablesExist: false,
    clubsCount: 0,
    seasonsCount: 0,
    error: null as string | null,
    timestamp: new Date().toISOString(),
  }

  if (!results.hasEnvVar) {
    results.error = "DATABASE_URL environment variable is not set"
    return results
  }

  try {
    // Test basic connection
    const connectionTest = await sql`SELECT 1 as test`
    results.canConnect = connectionTest.length > 0

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clubs', 'seasons', 'league_history', 'matches')
      ORDER BY table_name
    `

    results.tablesExist = tables.length > 0

    if (results.tablesExist) {
      // Count records in main tables
      try {
        const clubsResult = await sql`SELECT COUNT(*) as count FROM clubs`
        results.clubsCount = Number(clubsResult[0].count)
      } catch (e) {
        console.log("Could not count clubs")
      }

      try {
        const seasonsResult = await sql`SELECT COUNT(*) as count FROM seasons`
        results.seasonsCount = Number(seasonsResult[0].count)
      } catch (e) {
        console.log("Could not count seasons")
      }
    }
  } catch (error: any) {
    results.error = error.message
    console.error("Database test error:", error)
  }

  return results
}

export default async function TestConnectionPage() {
  const testResults = await testDatabaseConnection()

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            ← Back to Home
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">🔍 Database Connection Test</h1>
          <p className="text-muted-foreground">Testing EDFL database connectivity and setup</p>
        </div>
      </div>

      {/* Environment Variable Check */}
      <Card className={testResults.hasEnvVar ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardHeader>
          <CardTitle className={`flex items-center ${testResults.hasEnvVar ? "text-green-700" : "text-red-700"}`}>
            {testResults.hasEnvVar ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
            Environment Variable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className={testResults.hasEnvVar ? "text-green-600" : "text-red-600"}>
              DATABASE_URL: {testResults.hasEnvVar ? "✅ Set" : "❌ Missing"}
            </p>
            {testResults.hasEnvVar && (
              <p className="text-sm text-gray-600">
                Preview: <code>{testResults.envVarPreview}</code>
              </p>
            )}
            {!testResults.hasEnvVar && (
              <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                <p className="text-red-700 font-semibold">Action Required:</p>
                <ol className="text-red-600 text-sm mt-2 space-y-1">
                  <li>1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>2. Add DATABASE_URL with your Neon connection string</li>
                  <li>3. Redeploy the application</li>
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card className={testResults.canConnect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardHeader>
          <CardTitle className={`flex items-center ${testResults.canConnect ? "text-green-700" : "text-red-700"}`}>
            <Database className="h-5 w-5 mr-2" />
            Database Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={testResults.canConnect ? "text-green-600" : "text-red-600"}>
            Connection: {testResults.canConnect ? "✅ Successful" : "❌ Failed"}
          </p>
          {testResults.error && (
            <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {testResults.error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables Check */}
      <Card className={testResults.tablesExist ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardHeader>
          <CardTitle className={`flex items-center ${testResults.tablesExist ? "text-green-700" : "text-yellow-700"}`}>
            <Table className="h-5 w-5 mr-2" />
            Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={testResults.tablesExist ? "text-green-600" : "text-yellow-600"}>
            Tables: {testResults.tablesExist ? "✅ Found" : "⚠️ Missing"}
          </p>
          {!testResults.tablesExist && testResults.canConnect && (
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-200">
              <p className="text-yellow-700 font-semibold">Setup Required:</p>
              <p className="text-yellow-600 text-sm mt-1">
                Database tables need to be created. Run the database setup.
              </p>
              <Link href="/setup-database" className="mt-2 inline-block">
                <Button size="sm">Setup Database</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Summary */}
      {testResults.tablesExist && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Users className="h-5 w-5 mr-2" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Clubs:</strong> {testResults.clubsCount}
              </div>
              <div>
                <strong>Seasons:</strong> {testResults.seasonsCount}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!testResults.hasEnvVar && (
              <Button asChild>
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Configure in Vercel
                </a>
              </Button>
            )}
            {testResults.canConnect && !testResults.tablesExist && (
              <Link href="/setup-database">
                <Button>Setup Database</Button>
              </Link>
            )}
            {testResults.tablesExist && (
              <Link href="/historical-seasons/new">
                <Button>Add Season</Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-700">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Timestamp: {testResults.timestamp}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
