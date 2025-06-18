import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trophy, Calendar, AlertCircle } from "lucide-react"

interface Season {
  id: number
  year: number
  name: string | null
  start_date: string | null
  end_date: string | null
  total_rounds: number | null
  premier_club_name: string | null
  runner_up_club_name: string | null
}

async function getSeasons(): Promise<{ seasons: Season[]; error: string | null }> {
  try {
    const seasons = await sql`
      SELECT 
        s.*,
        pc.name as premier_club_name,
        rc.name as runner_up_club_name
      FROM seasons s
      LEFT JOIN clubs pc ON s.premier_club_id = pc.id
      LEFT JOIN clubs rc ON s.runner_up_club_id = rc.id
      ORDER BY s.year DESC
    `
    return { seasons: seasons as Season[], error: null }
  } catch (error: any) {
    if (
      error.message.includes('relation "seasons" does not exist') ||
      error.message.includes('relation "clubs" does not exist')
    ) {
      return { seasons: [], error: "database_not_setup" }
    }
    return { seasons: [], error: error.message }
  }
}

export default async function HistoricalSeasonsPage() {
  const { seasons, error } = await getSeasons()

  // Handle database not set up
  if (error === "database_not_setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historical Seasons</h1>
          <p className="text-muted-foreground">Track seasons, results, and championship history</p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 mb-4">
              The EDFL database tables need to be created before you can view historical seasons.
            </p>
            <Link href="/test-connection">
              <Button>
                <AlertCircle className="h-4 w-4 mr-2" />
                Set Up Database
              </Button>
            </Link>
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
          <h1 className="text-3xl font-bold">Historical Seasons</h1>
          <p className="text-muted-foreground">Track seasons, results, and championship history</p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Error
            </CardTitle>
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

  // Normal seasons display
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historical Seasons</h1>
          <p className="text-muted-foreground">Track seasons, results, and championship history</p>
        </div>
        <Link href="/historical-seasons/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Season
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season) => (
          <Card key={season.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">{season.year}</CardTitle>
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              {season.name && <CardDescription className="text-base">{season.name}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3">
              {season.start_date && season.end_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                </div>
              )}
              {season.total_rounds && <p className="text-sm text-muted-foreground">{season.total_rounds} rounds</p>}
              {season.premier_club_name && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">Premier: {season.premier_club_name}</p>
                  {season.runner_up_club_name && (
                    <p className="text-sm text-muted-foreground">Runner-up: {season.runner_up_club_name}</p>
                  )}
                </div>
              )}
              <div className="pt-2">
                <Link href={`/historical-seasons/${season.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {seasons.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No seasons found</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking the league's history by adding season information.
            </p>
            <Link href="/historical-seasons/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Season
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
