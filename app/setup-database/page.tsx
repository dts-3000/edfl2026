"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react"

interface SetupResult {
  connectionTest: boolean
  schemaCreated: boolean
  dataSeeded: boolean
  error: string | null
  details: string[]
}

export default function SetupDatabasePage() {
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runSetup = async () => {
    setIsRunning(true)
    setSetupResult(null)

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      setSetupResult(result)
    } catch (error) {
      setSetupResult({
        connectionTest: false,
        schemaCreated: false,
        dataSeeded: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: [],
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Database Setup</h1>
        <p className="text-muted-foreground">Automatic setup of the EDFL database schema and sample data</p>
      </div>

      <div className="grid gap-6">
        {/* Setup Button */}
        {!setupResult && (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Setup Database</CardTitle>
              <CardDescription>
                This will create all necessary tables and add sample data to your EDFL database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runSetup} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Database Setup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Setup Results */}
        {setupResult && (
          <>
            <Card className={setupResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <CardHeader>
                <CardTitle className={`flex items-center ${setupResult.error ? "text-red-700" : "text-green-700"}`}>
                  {setupResult.error ? (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {setupResult.error ? "Setup Failed" : "Setup Completed Successfully"}
                </CardTitle>
                <CardDescription className={setupResult.error ? "text-red-600" : "text-green-600"}>
                  {setupResult.error
                    ? "There was an error during database setup"
                    : "Your EDFL database is ready to use"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {setupResult.error ? (
                  <div className="p-3 bg-red-100 rounded border border-red-200 mb-4">
                    <code className="text-red-700 text-sm">{setupResult.error}</code>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {setupResult.details.map((detail, index) => (
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
              <Card
                className={setupResult.connectionTest ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
              >
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm ${setupResult.connectionTest ? "text-green-700" : "text-red-700"}`}>
                    {setupResult.connectionTest ? "✅" : "❌"} Connection Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-xs ${setupResult.connectionTest ? "text-green-600" : "text-red-600"}`}>
                    {setupResult.connectionTest ? "Database connected" : "Connection failed"}
                  </p>
                </CardContent>
              </Card>

              <Card className={setupResult.schemaCreated ? "border-green-200 bg-green-50" : "border-gray-200"}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm ${setupResult.schemaCreated ? "text-green-700" : "text-gray-500"}`}>
                    {setupResult.schemaCreated ? "✅" : "⏳"} Schema Creation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-xs ${setupResult.schemaCreated ? "text-green-600" : "text-gray-500"}`}>
                    {setupResult.schemaCreated ? "Tables created" : "Pending"}
                  </p>
                </CardContent>
              </Card>

              <Card className={setupResult.dataSeeded ? "border-green-200 bg-green-50" : "border-gray-200"}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm ${setupResult.dataSeeded ? "text-green-700" : "text-gray-500"}`}>
                    {setupResult.dataSeeded ? "✅" : "⏳"} Data Seeding
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-xs ${setupResult.dataSeeded ? "text-green-600" : "text-gray-500"}`}>
                    {setupResult.dataSeeded ? "Sample data added" : "Pending"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            {!setupResult.error && (
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

            {/* Try Again */}
            <Card>
              <CardContent className="pt-6">
                <Button onClick={runSetup} disabled={isRunning} className="w-full" variant="outline">
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running setup...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Run Setup Again
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
