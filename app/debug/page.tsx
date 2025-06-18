import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getDebugInfo() {
  const info = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    tablesExist: false,
    error: null as string | null,
  }

  try {
    if (process.env.DATABASE_URL) {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('clubs', 'seasons', 'league_history')
      `
      info.tablesExist = tables.length > 0
    }
  } catch (error: any) {
    info.error = error.message
  }

  return info
}

export default async function DebugPage() {
  const debugInfo = await getDebugInfo()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">🔍 Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>DATABASE_URL:</strong> {debugInfo.hasDbUrl ? "✅ Set" : "❌ Missing"}
            </div>
            <div>
              <strong>Environment:</strong> {debugInfo.nodeEnv}
            </div>
            <div>
              <strong>Tables Exist:</strong> {debugInfo.tablesExist ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Timestamp:</strong> {debugInfo.timestamp}
            </div>
          </div>

          {debugInfo.hasDbUrl && (
            <div>
              <strong>DB URL Preview:</strong> <code>{debugInfo.dbUrlPrefix}</code>
            </div>
          )}

          {debugInfo.error && (
            <div className="p-3 bg-red-100 rounded border border-red-200">
              <strong>Error:</strong> <code className="text-red-700">{debugInfo.error}</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
