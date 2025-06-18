import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, Upload, Trash2, RefreshCw } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-muted-foreground">System administration and data management tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Management
            </CardTitle>
            <CardDescription>Manage database operations and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Database Statistics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              View Database Schema
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Data Import/Export
            </CardTitle>
            <CardDescription>Import and export league data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
