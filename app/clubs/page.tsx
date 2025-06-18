import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, MapPin, Calendar, Users, AlertCircle } from "lucide-react"

interface Club {
  id: number
  name: string
  founded_year: number | null
  home_ground: string | null
  colors: string | null
  nickname: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  active: boolean
}

async function getClubs(): Promise<{ clubs: Club[]; error: string | null }> {
  try {
    const clubs = await sql`
      SELECT * FROM clubs 
      ORDER BY name ASC
    `
    return { clubs: clubs as Club[], error: null }
  } catch (error: any) {
    if (error.message.includes('relation "clubs" does not exist')) {
      return { clubs: [], error: "database_not_setup" }
    }
    return { clubs: [], error: error.message }
  }
}

export default async function ClubsPage() {
  const { clubs, error } = await getClubs()

  // Handle database not set up
  if (error === "database_not_setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
          <p className="text-muted-foreground">Manage EDFL club information and details</p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Setup Required
            </CardTitle>
            <CardDescription className="text-yellow-600">
              The EDFL database tables haven't been created yet. You need to run the database setup scripts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded border">
              <h3 className="font-semibold mb-2">Quick Setup Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Go to the{" "}
                  <Link href="/test-connection" className="text-blue-600 underline">
                    Test Connection
                  </Link>{" "}
                  page
                </li>
                <li>Verify your database connection is working</li>
                <li>Run the database setup scripts to create tables</li>
                <li>Return here to see your EDFL clubs</li>
              </ol>
            </div>
            <div className="flex gap-3">
              <Link href="/test-connection">
                <Button>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">Go to Admin</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle other errors
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
          <p className="text-muted-foreground">Manage EDFL club information and details</p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Error
            </CardTitle>
            <CardDescription className="text-red-600">There was an error connecting to the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-red-100 rounded border border-red-200 mb-4">
              <code className="text-red-700 text-sm">{error}</code>
            </div>
            <Link href="/test-connection">
              <Button>
                <AlertCircle className="h-4 w-4 mr-2" />
                Diagnose Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Normal clubs display
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
          <p className="text-muted-foreground">Manage EDFL club information and details</p>
        </div>
        <Link href="/clubs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Club
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                  {club.nickname && <CardDescription className="text-lg font-medium">{club.nickname}</CardDescription>}
                </div>
                <Badge variant={club.active ? "default" : "secondary"}>{club.active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {club.founded_year && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Founded {club.founded_year}
                </div>
              )}
              {club.home_ground && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {club.home_ground}
                </div>
              )}
              {club.colors && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  Colors: {club.colors}
                </div>
              )}
              <div className="pt-2">
                <Link href={`/clubs/${club.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first club to the database.</p>
            <Link href="/clubs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Club
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
