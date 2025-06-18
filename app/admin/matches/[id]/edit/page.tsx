import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

interface MatchDetail {
  id: number
  season_id: number
  round_number: number
  match_date: string | null
  match_time: string | null
  home_club_id: number
  away_club_id: number
  venue: string | null
  match_type: string
  weather_conditions: string | null
  attendance: number | null
  home_club: string
  away_club: string
  home_score_goals: number | null
  home_score_behinds: number | null
  away_score_goals: number | null
  away_score_behinds: number | null
  best_on_ground: string | null
  umpires: string | null
  match_report: string | null
}

async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  try {
    const matches = await sql`
      SELECT 
        m.*,
        hc.name as home_club,
        ac.name as away_club,
        mr.home_score_goals,
        mr.home_score_behinds,
        mr.away_score_goals,
        mr.away_score_behinds,
        mr.best_on_ground,
        mr.match_report,
        mr.umpires
      FROM matches m
      JOIN clubs hc ON m.home_club_id = hc.id
      JOIN clubs ac ON m.away_club_id = ac.id
      LEFT JOIN match_results mr ON m.id = mr.match_id
      WHERE m.id = ${id}
    `
    return (matches[0] as MatchDetail) || null
  } catch (error) {
    return null
  }
}

async function getClubs() {
  try {
    const clubs = await sql`
      SELECT id, name, nickname 
      FROM clubs 
      WHERE active = true 
      ORDER BY name
    `
    return clubs
  } catch (error) {
    return []
  }
}

async function updateMatch(formData: FormData) {
  "use server"

  const matchId = formData.get("matchId") as string
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
    // Update match
    await sql`
      UPDATE matches SET
        round_number = ${roundNumber},
        match_date = ${matchDate || null},
        match_time = ${matchTime || null},
        home_club_id = ${homeClubId},
        away_club_id = ${awayClubId},
        venue = ${venue || null},
        match_type = ${matchType},
        weather_conditions = ${weatherConditions || null},
        attendance = ${attendance ? Number.parseInt(attendance) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${matchId}
    `

    // Update or insert match result
    if (homeGoals && homeBehinds && awayGoals && awayBehinds) {
      const homeTotal = Number.parseInt(homeGoals) * 6 + Number.parseInt(homeBehinds)
      const awayTotal = Number.parseInt(awayGoals) * 6 + Number.parseInt(awayBehinds)
      const winningClubId = homeTotal > awayTotal ? homeClubId : awayClubId
      const margin = Math.abs(homeTotal - awayTotal)

      // Check if match result exists
      const existingResult = await sql`
        SELECT id FROM match_results WHERE match_id = ${matchId}
      `

      if (existingResult.length > 0) {
        // Update existing result
        await sql`
          UPDATE match_results SET
            home_score_goals = ${Number.parseInt(homeGoals)},
            home_score_behinds = ${Number.parseInt(homeBehinds)},
            away_score_goals = ${Number.parseInt(awayGoals)},
            away_score_behinds = ${Number.parseInt(awayBehinds)},
            winning_club_id = ${winningClubId},
            margin = ${margin},
            best_on_ground = ${bestOnGround || null},
            umpires = ${umpires || null},
            match_report = ${matchReport || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE match_id = ${matchId}
        `
      } else {
        // Insert new result
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
    }

    redirect(`/matches/${matchId}`)
  } catch (error) {
    console.error("Error updating match:", error)
    throw new Error("Failed to update match")
  }
}

export default async function EditMatchPage({ params }: { params: { id: string } }) {
  const match = await getMatchDetail(params.id)
  const clubs = await getClubs()

  if (!match) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/matches/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Match
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Match</h1>
          <p className="text-muted-foreground">
            {match.home_club} vs {match.away_club} - Round {match.round_number}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Match Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateMatch} className="space-y-8">
            <input type="hidden" name="matchId" value={params.id} />

            {/* Match Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Match Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roundNumber">Round Number *</Label>
                  <Input type="number" name="roundNumber" required min="1" defaultValue={match.round_number} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchDate">Match Date</Label>
                  <Input
                    type="date"
                    name="matchDate"
                    defaultValue={match.match_date ? match.match_date.split("T")[0] : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchTime">Match Time</Label>
                  <Input type="time" name="matchTime" defaultValue={match.match_time || ""} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matchType">Match Type</Label>
                  <Select name="matchType" defaultValue={match.match_type}>
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
                  <Input type="text" name="venue" defaultValue={match.venue || ""} />
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeClubId">Home Team *</Label>
                  <Select name="homeClubId" required defaultValue={match.home_club_id.toString()}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="awayClubId">Away Team *</Label>
                  <Select name="awayClubId" required defaultValue={match.away_club_id.toString()}>
                    <SelectTrigger>
                      <SelectValue />
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

            {/* Score */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Match Result</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Home Team Score</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="homeGoals">Goals</Label>
                      <Input type="number" name="homeGoals" min="0" defaultValue={match.home_score_goals || ""} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="homeBehinds">Behinds</Label>
                      <Input type="number" name="homeBehinds" min="0" defaultValue={match.home_score_behinds || ""} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Away Team Score</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="awayGoals">Goals</Label>
                      <Input type="number" name="awayGoals" min="0" defaultValue={match.away_score_goals || ""} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="awayBehinds">Behinds</Label>
                      <Input type="number" name="awayBehinds" min="0" defaultValue={match.away_score_behinds || ""} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bestOnGround">Best on Ground</Label>
                  <Input type="text" name="bestOnGround" defaultValue={match.best_on_ground || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="umpires">Umpires</Label>
                  <Input type="text" name="umpires" defaultValue={match.umpires || ""} />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance</Label>
                  <Input type="number" name="attendance" min="0" defaultValue={match.attendance || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weatherConditions">Weather Conditions</Label>
                  <Input type="text" name="weatherConditions" defaultValue={match.weather_conditions || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchReport">Match Report</Label>
                <Textarea name="matchReport" defaultValue={match.match_report || ""} rows={4} />
              </div>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Update Match</Button>
              <Link href={`/matches/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
