"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-600">A critical error occurred in the EDFL application.</p>

              {error.message && (
                <div className="p-3 bg-red-100 rounded border border-red-200">
                  <code className="text-xs break-all">{error.message}</code>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">Quick fixes:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>1. Check DATABASE_URL in Vercel settings</li>
                  <li>2. Verify database tables exist</li>
                  <li>3. Try refreshing the page</li>
                </ul>
              </div>

              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
