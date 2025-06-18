import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

interface Club {
  id: number
  name: string
  nickname: string | null
}

async function getClub(id: string): Promise<Club | null> {
  try {
    const clubs = await sql`SELECT id, name, nickname FROM clubs WHERE id = ${id}`
    return (clubs[0] as Club) || null
  } catch (error) {
    return null
  }
}

async function getSeasons() {
  try {
    const seasons = await sql`
      SELECT id, year, name 
      FROM seasons 
      ORDER BY year DESC
    `
    return seasons
  } catch (error) {
    return []
  }
}

async function addAchievement(formData: FormData) {
  "use server"

  const clubId = formData.get("clubId") as string
  const achievementType = formData.get("achievementType") as string
  const year = Number.parseInt(formData.get("year") as string)
  const seasonId = formData.get("seasonId") as string
  const playerName = formData.get("playerName") as string
  const details = formData.get("details") as string
  const goalsKicked = formData.get("goalsKicked") as string
  const votesReceived = formData.get("votesReceived") as string

  try {
    await sql`
      INSERT INTO club_achievements (
        club_id, achievement_type, year, season_id, player_name, details, 
        goals_kicked, votes_received
      ) VALUES (
        ${clubId}, ${achievementType}, ${year}, 
        ${seasonId || null}, ${playerName || null}, ${details || null},
        ${goalsKicked ? Number.parseInt(goalsKicked) : null}, 
        ${votesReceived ? Number.parseInt(votesReceived) : null}
      )
    `
    redirect(`/clubs/${clubId}`)
  } catch (error) {
    console.error("Error adding achievement:", error)
    throw new Error("Failed to add achievement")
  }
}

export default async function AddAchievementPage({ params }: { params: { id: string } }) {
  const club = await getClub(params.id)
  const seasons = await getSeasons()

  if (!club) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/clubs/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Club
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Achievement</h1>
          <p className="text-muted-foreground">
            {club.name} {club.nickname && `"${club.nickname}"`}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            New Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAchievement} className="space-y-6">
            <input type="hidden" name="clubId" value={params.id} />

            {/* Achievement Type */}
            <div className="space-y-2">
              <Label htmlFor="achievementType">Achievement Type *</Label>
              <Select name="achievementType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select achievement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premiership">🏆 Premiership</SelectItem>
                  <SelectItem value="runner_up">🥈 Runner-up</SelectItem>
                  <SelectItem value="best_and_fairest">🏅 Best & Fairest</SelectItem>
                  <SelectItem value="leading_goalkicker">⚽ Leading Goalkicker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                type="number"
                name="year"
                min="1889"
                max={new Date().getFullYear()}
                required
                placeholder="e.g., 2023"
              />
            </div>

            {/* Season */}
            <div className="space-y-2">
              <Label htmlFor="seasonId">Season (Optional)</Label>
              <Select name="seasonId">
                <SelectTrigger>
                  <SelectValue placeholder="Link to a specific season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season: any) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.year} - {season.name || "EDFL Season"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                type="text"
                name="playerName"
                placeholder="For individual awards (Best & Fairest, Leading Goalkicker)"
              />
              <p className="text-sm text-muted-foreground">Leave blank for team achievements like premierships</p>
            </div>

            {/* Goals Kicked */}
            <div className="space-y-2">
              <Label htmlFor="goalsKicked">Goals Kicked</Label>
              <Input type="number" name="goalsKicked" min="0" placeholder="For leading goalkicker awards" />
            </div>

            {/* Votes Received */}
            <div className="space-y-2">
              <Label htmlFor="votesReceived">Votes Received</Label>
              <Input type="number" name="votesReceived" min="0" placeholder="For Best & Fairest awards" />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea name="details" placeholder="Any additional information about this achievement..." rows={3} />
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Add Achievement</Button>
              <Link href={`/clubs/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
