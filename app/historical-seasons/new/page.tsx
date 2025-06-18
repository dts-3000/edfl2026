import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"

async function getClubs() {
  try {
    // Check if DATABASE_URL exists first
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not found")
      return { clubs: [], error: "DATABASE_URL not configured" }
    }

    const clubs = await sql`
      SELECT id, name, nickname 
      FROM clubs 
      ORDER BY name
    `
    return { clubs, error: null }
  } catch (error) {
    console.error("Error fetching clubs:", error)
    return { clubs: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function createSeason(formData: FormData) {
  "use server"

  try {
    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Please configure it in Vercel.")
    }

    // Extract and validate form data
    const yearStr = formData.get("year") as string
    if (!yearStr) {
      throw new Error("Year is required")
    }

    const year = Number.parseInt(yearStr)
    if (isNaN(year) || year < 1889 || year > new Date().getFullYear() + 5) {
      throw new Error("Please enter a valid year between 1889 and " + (new Date().getFullYear() + 5))
    }

    const name = formData.get("name") as string
    const division = (formData.get("division") as string) || "Premier Division"
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const grandFinalDate = formData.get("grandFinalDate") as string
    const premierClubId = formData.get("premierClubId") as string
    const runnerUpClubId = formData.get("runnerUpClubId") as string
    const woodenSpoonClubId = formData.get("woodenSpoonClubId") as string
    const leadingGoalkickerName = formData.get("leadingGoalkickerName") as string
    const leadingGoalkickerGoalsStr = formData.get("leadingGoalkickerGoals") as string
    const bestAndFairestWinner = formData.get("bestAndFairestWinner") as string
    const totalRoundsStr = formData.get("totalRounds") as string
    const finalsFormat = formData.get("finalsFormat") as string
    const seasonSummary = formData.get("seasonSummary") as string
    const active = formData.get("active") === "on"

    // Parse optional numbers
    const leadingGoalkickerGoals = leadingGoalkickerGoalsStr ? Number.parseInt(leadingGoalkickerGoalsStr) : null
    const totalRounds = totalRoundsStr ? Number.parseInt(totalRoundsStr) : null

    // Convert "none" selections to null
    const premierClub = premierClubId === "none" ? null : premierClubId
    const runnerUpClub = runnerUpClubId === "none" ? null : runnerUpClubId
    const woodenSpoonClub = woodenSpoonClubId === "none" ? null : woodenSpoonClubId

    console.log("Creating season:", { year, name, division, active })

    // Check if seasons table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'seasons'
      )
    `

    if (!tableCheck[0].exists) {
      throw new Error("Database tables not found. Please run the database setup first.")
    }

    // Insert the season
    const result = await sql`
      INSERT INTO seasons (
        year, name, division, start_date, end_date, grand_final_date,
        premier_club_id, runner_up_club_id, wooden_spoon_club_id,
        leading_goalkicker_name, leading_goalkicker_goals, best_and_fairest_winner,
        total_rounds, finals_format, season_summary, active,
        created_at, updated_at
      ) VALUES (
        ${year}, 
        ${name || null}, 
        ${division}, 
        ${startDate || null}, 
        ${endDate || null}, 
        ${grandFinalDate || null},
        ${premierClub}, 
        ${runnerUpClub}, 
        ${woodenSpoonClub},
        ${leadingGoalkickerName || null}, 
        ${leadingGoalkickerGoals}, 
        ${bestAndFairestWinner || null}, 
        ${totalRounds}, 
        ${finalsFormat || null}, 
        ${seasonSummary || null}, 
        ${active},
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const seasonId = result[0].id
    console.log("Season created successfully with ID:", seasonId)

    redirect(`/historical-seasons/${seasonId}`)
  } catch (error) {
    console.error("Detailed error creating season:", error)

    // Create a more specific error message
    let errorMessage = "Failed to create season"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    // For now, redirect to an error page with the message
    const encodedError = encodeURIComponent(errorMessage)
    redirect(`/historical-seasons/new?error=${encodedError}`)
  }
}

export default async function NewSeasonPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const { clubs, error: clubsError } = await getClubs()
  const formError = searchParams.error

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/historical-seasons">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Seasons
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Season</h1>
          <p className="text-muted-foreground">Create a new season record in the EDFL database</p>
        </div>
      </div>

      {/* Error Messages */}
      {formError && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Creating Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{decodeURIComponent(formError)}</p>
            <div className="flex space-x-3">
              <Link href="/test-connection">
                <Button size="sm">Test Database</Button>
              </Link>
              <Link href="/setup-database">
                <Button size="sm" variant="outline">
                  Setup Database
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {clubsError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Connection Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 mb-4">Could not load clubs: {clubsError}</p>
            <p className="text-sm text-yellow-600 mb-4">
              You can still create a season, but club selections won't be available.
            </p>
            <div className="flex space-x-3">
              <Link href="/test-connection">
                <Button size="sm">Test Connection</Button>
              </Link>
              <Link href="/setup-database">
                <Button size="sm" variant="outline">
                  Setup Database
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Season Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSeason} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  type="number"
                  name="year"
                  required
                  min="1889"
                  max={new Date().getFullYear() + 5}
                  placeholder="e.g., 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Season Name</Label>
                <Input type="text" name="name" placeholder="e.g., 2024 EDFL Premier Division" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Input type="text" name="division" defaultValue="Premier Division" placeholder="Premier Division" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalRounds">Total Rounds</Label>
                <Input type="number" name="totalRounds" min="1" max="30" placeholder="e.g., 18" />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Season Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input type="date" name="startDate" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input type="date" name="endDate" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grandFinalDate">Grand Final Date</Label>
                  <Input type="date" name="grandFinalDate" />
                </div>
              </div>
            </div>

            {/* Results - Only show if clubs loaded successfully */}
            {!clubsError && clubs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Season Results (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premierClubId">Premier</Label>
                    <Select name="premierClubId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select premier club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No selection</SelectItem>
                        {clubs.map((club: any) => (
                          <SelectItem key={club.id} value={club.id.toString()}>
                            {club.name} {club.nickname && `(${club.nickname})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runnerUpClubId">Runner-up</Label>
                    <Select name="runnerUpClubId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select runner-up club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No selection</SelectItem>
                        {clubs.map((club: any) => (
                          <SelectItem key={club.id} value={club.id.toString()}>
                            {club.name} {club.nickname && `(${club.nickname})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="woodenSpoonClubId">Wooden Spoon</Label>
                    <Select name="woodenSpoonClubId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select wooden spoon club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No selection</SelectItem>
                        {clubs.map((club: any) => (
                          <SelectItem key={club.id} value={club.id.toString()}>
                            {club.name} {club.nickname && `(${club.nickname})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Awards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Individual Awards (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leadingGoalkickerName">Leading Goalkicker</Label>
                  <Input type="text" name="leadingGoalkickerName" placeholder="Player name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadingGoalkickerGoals">Goals Kicked</Label>
                  <Input type="number" name="leadingGoalkickerGoals" min="0" max="200" placeholder="Number of goals" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestAndFairestWinner">Best & Fairest Winner</Label>
                  <Input type="text" name="bestAndFairestWinner" placeholder="Player name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalsFormat">Finals Format</Label>
                  <Input type="text" name="finalsFormat" placeholder="e.g., McIntyre Final 8" />
                </div>
              </div>
            </div>

            {/* Season Summary */}
            <div className="space-y-2">
              <Label htmlFor="seasonSummary">Season Summary</Label>
              <Textarea
                name="seasonSummary"
                placeholder="Write a summary of the season, key moments, notable events..."
                rows={4}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox name="active" defaultChecked={false} />
              <Label htmlFor="active">This is the current active season</Label>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Create Season</Button>
              <Link href="/historical-seasons">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
