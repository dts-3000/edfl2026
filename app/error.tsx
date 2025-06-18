"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-red-600">
            <p className="text-sm mb-2">An error occurred while processing your request.</p>
            {error.message && (
              <div className="p-3 bg-red-100 rounded border border-red-200">
                <code className="text-xs break-all">{error.message}</code>
              </div>
            )}
            {error.digest && <p className="text-xs text-red-500 mt-2">Error ID: {error.digest}</p>}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-red-700">Possible causes:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• Database connection issue</li>
              <li>• Missing environment variables</li>
              <li>• Invalid form data</li>
              <li>• Server configuration problem</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          <div className="pt-3 border-t border-red-200">
            <p className="text-xs text-red-500">
              If this problem persists, check your database connection and environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
