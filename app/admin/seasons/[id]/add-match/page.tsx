import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

interface Season {
  id: number
  year: number
  name: string | null
}

interface Club {
  id: number
  name: string
  nickname: string | null
}

async function getSeason(id: string): Promise<Season | null> {
  try {
    const seasons = await sql`SELECT id, year, name FROM seasons WHERE id = ${id}`
    return (seasons[0] as Season) || null
  } catch (error) {
    return null
  }
}

async function getClubs(): Promise<Club[]> {
  try {
    const clubs = await sql`
      SELECT id, name, nickname 
      FROM clubs 
      WHERE active = true 
      ORDER BY name
    `
    return clubs as Club[]
  } catch (error) {
    return []
  }
}

async function addMatch(formData: FormData) {
  "use server"

  const seasonId = formData.get("seasonId") as string
  const roundNumber = Number.parseInt(formData.get("roundNumber") as string)
  const matchDate = formData.get("matchDate") as string
  const matchTime = formData.get("matchTime") as string
  const homeClubId = formData.get("homeClubId") as string
  const awayClubId = formData.get("awayClubId") as string
  const venue = formData.get("venue") as string
  const matchType = formData.get("matchType") as string
  const weatherConditions = formData.get("weatherConditions") as string
  const attendance = formData.get("attendance") as string

  // Score details
  const homeGoals = formData.get("homeGoals") as string
  const homeBehinds = formData.get("homeBehinds") as string
  const awayGoals = formData.get("awayGoals") as string
  const awayBehinds = formData.get("awayBehinds") as string
  const bestOnGround = formData.get("bestOnGround") as string
  const umpires = formData.get("umpires") as string
  const matchReport = formData.get("matchReport") as string

  try {
    // Insert match
    const matchResult = await sql`
      INSERT INTO matches (
        season_id, round_number, match_date, match_time, home_club_id, 
        away_club_id, venue, match_type, weather_conditions, attendance
      ) VALUES (
        ${seasonId}, ${roundNumber}, ${matchDate || null}, ${matchTime || null}, 
        ${homeClubId}, ${awayClubId}, ${venue || null}, ${matchType}, 
        ${weatherConditions || null}, ${attendance ? Number.parseInt(attendance) : null}
      ) RETURNING id
    `

    const matchId = matchResult[0].id

    // Insert match result if scores provided
    if (homeGoals && homeBehinds && awayGoals && awayBehinds) {
      const homeTotal = Number.parseInt(homeGoals) * 6 + Number.parseInt(homeBehinds)
      const awayTotal = Number.parseInt(awayGoals) * 6 + Number.parseInt(awayBehinds)
      const winningClubId = homeTotal > awayTotal ? homeClubId : awayClubId
      const margin = Math.abs(homeTotal - awayTotal)

      await sql`
        INSERT INTO match_results (
          match_id, home_score_goals, home_score_behinds, away_score_goals, 
          away_score_behinds, winning_club_id, margin, best_on_ground, 
          umpires, match_report
        ) VALUES (
          ${matchId}, ${Number.parseInt(homeGoals)}, ${Number.parseInt(homeBehinds)}, 
          ${Number.parseInt(awayGoals)}, ${Number.parseInt(awayBehinds)}, ${winningClubId}, 
          ${margin}, ${bestOnGround || null}, ${umpires || null}, ${matchReport || null}
        )
      `
    }

    redirect(`/historical-seasons/${seasonId}`)
  } catch (error) {
    console.error("Error adding match:", error)
    throw new Error("Failed to add match")
  }
}

export default async function AddMatchPage({ params }: { params: { id: string } }) {
  const season = await getSeason(params.id)
  const clubs = await getClubs()

  if (!season) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/historical-seasons/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Season
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Match</h1>
          <p className="text-muted-foreground">
            {season.year} - {season.name || "EDFL Season"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            New Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addMatch} className="space-y-8">
            <input type="hidden" name="seasonId" value={params.id} />

            {/* Match Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roundNumber">Round Number *</Label>
                  <Input type="number" name="roundNumber" required min="1" placeholder="1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchDate">Match Date</Label>
                  <Input type="date" name="matchDate" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchTime">Match Time</Label>
                  <Input type="time" name="matchTime" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matchType">Match Type</Label>
                  <Select name="matchType" defaultValue="Regular">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Season</SelectItem>
                      <SelectItem value="Elimination Final">Elimination Final</SelectItem>
                      <SelectItem value="Semi Final">Semi Final</SelectItem>
                      <SelectItem value="Preliminary Final">Preliminary Final</SelectItem>
                      <SelectItem value="Grand Final">Grand Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input type="text" name="venue" placeholder="Ground name" />
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeClubId">Home Team *</Label>
                  <Select name="homeClubId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id.toString()}>
                          {club.name} {club.nickname && `(${club.nickname})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayClubId">Away Team *</Label>
                  <Select name="awayClubId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id.toString()}>
                          {club.name} {club.nickname && `(${club.nickname})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Score (Optional) */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Match Result (Optional)</h3>
              <p className="text-sm text-muted-foreground">You can add the score now or edit the match later</p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Home Team Score</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="homeGoals">Goals</Label>
                      <Input type="number" name="homeGoals" min="0" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="homeBehinds">Behinds</Label>
                      <Input type="number" name="homeBehinds" min="0" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Away Team Score</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="awayGoals">Goals</Label>
                      <Input type="number" name="awayGoals" min="0" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="awayBehinds">Behinds</Label>
                      <Input type="number" name="awayBehinds" min="0" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bestOnGround">Best on Ground</Label>
                  <Input type="text" name="bestOnGround" placeholder="Player name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="umpires">Umpires</Label>
                  <Input type="text" name="umpires" placeholder="Umpire names" />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance</Label>
                  <Input type="number" name="attendance" min="0" placeholder="Number of spectators" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weatherConditions">Weather Conditions</Label>
                  <Input type="text" name="weatherConditions" placeholder="e.g., Fine, Wet, Windy" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchReport">Match Report</Label>
                <Textarea
                  name="matchReport"
                  placeholder="Write a summary of the match, key moments, standout performances..."
                  rows={4}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Add Match</Button>
              <Link href={`/historical-seasons/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
