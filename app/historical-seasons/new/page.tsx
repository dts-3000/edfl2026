import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Trophy } from "lucide-react"
import { redirect } from "next/navigation"

async function getClubs() {
  try {
    const clubs = await sql`
      SELECT id, name, nickname 
      FROM clubs 
      ORDER BY name
    `
    return clubs
  } catch (error) {
    return []
  }
}

async function createSeason(formData: FormData) {
  "use server"

  const year = Number.parseInt(formData.get("year") as string)
  const name = formData.get("name") as string
  const division = formData.get("division") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const grandFinalDate = formData.get("grandFinalDate") as string
  const premierClubId = formData.get("premierClubId") as string
  const runnerUpClubId = formData.get("runnerUpClubId") as string
  const woodenSpoonClubId = formData.get("woodenSpoonClubId") as string
  const leadingGoalkickerName = formData.get("leadingGoalkickerName") as string
  const leadingGoalkickerGoals = formData.get("leadingGoalkickerGoals") as string
  const bestAndFairestWinner = formData.get("bestAndFairestWinner") as string
  const totalRounds = formData.get("totalRounds") as string
  const finalsFormat = formData.get("finalsFormat") as string
  const seasonSummary = formData.get("seasonSummary") as string
  const active = formData.get("active") === "on"

  try {
    const result = await sql`
      INSERT INTO seasons (
        year, name, division, start_date, end_date, grand_final_date,
        premier_club_id, runner_up_club_id, wooden_spoon_club_id,
        leading_goalkicker_name, leading_goalkicker_goals, best_and_fairest_winner,
        total_rounds, finals_format, season_summary, active,
        created_at, updated_at
      ) VALUES (
        ${year}, ${name || null}, ${division || "Premier Division"}, 
        ${startDate || null}, ${endDate || null}, ${grandFinalDate || null},
        ${premierClubId || null}, ${runnerUpClubId || null}, ${woodenSpoonClubId || null},
        ${leadingGoalkickerName || null}, ${leadingGoalkickerGoals ? Number.parseInt(leadingGoalkickerGoals) : null}, 
        ${bestAndFairestWinner || null}, ${totalRounds ? Number.parseInt(totalRounds) : null}, 
        ${finalsFormat || null}, ${seasonSummary || null}, ${active},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const seasonId = result[0].id
    redirect(`/historical-seasons/${seasonId}`)
  } catch (error) {
    console.error("Error creating season:", error)
    throw new Error("Failed to create season")
  }
}

export default async function NewSeasonPage() {
  const clubs = await getClubs()

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
                  max={new Date().getFullYear() + 1}
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
                <Input type="number" name="totalRounds" min="1" placeholder="e.g., 18" />
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

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Season Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premierClubId">Premier</Label>
                  <Select name="premierClubId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select premier club" />
                    </SelectTrigger>
                    <SelectContent>
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

            {/* Awards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Individual Awards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leadingGoalkickerName">Leading Goalkicker</Label>
                  <Input type="text" name="leadingGoalkickerName" placeholder="Player name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadingGoalkickerGoals">Goals Kicked</Label>
                  <Input type="number" name="leadingGoalkickerGoals" min="0" placeholder="Number of goals" />
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
