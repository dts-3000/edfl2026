import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
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

async function addPlayer(formData: FormData) {
  "use server"

  const clubId = formData.get("clubId") as string
  const playerName = formData.get("playerName") as string
  const playerType = formData.get("playerType") as string
  const yearsActive = formData.get("yearsActive") as string
  const gamesPlayed = formData.get("gamesPlayed") as string
  const goalsKicked = formData.get("goalsKicked") as string
  const vflAflClub = formData.get("vflAflClub") as string
  const debutYear = formData.get("debutYear") as string
  const recordType = formData.get("recordType") as string
  const recordDetails = formData.get("recordDetails") as string
  const notes = formData.get("notes") as string

  try {
    await sql`
      INSERT INTO club_players (
        club_id, player_name, player_type, years_active, games_played, 
        goals_kicked, vfl_afl_club, debut_year, record_type, record_details, notes
      ) VALUES (
        ${clubId}, ${playerName}, ${playerType}, ${yearsActive || null}, 
        ${gamesPlayed ? Number.parseInt(gamesPlayed) : null}, 
        ${goalsKicked ? Number.parseInt(goalsKicked) : null}, 
        ${vflAflClub || null}, ${debutYear ? Number.parseInt(debutYear) : null}, 
        ${recordType || null}, ${recordDetails || null}, ${notes || null}
      )
    `
    redirect(`/clubs/${clubId}`)
  } catch (error) {
    console.error("Error adding player:", error)
    throw new Error("Failed to add player")
  }
}

export default async function AddPlayerPage({ params }: { params: { id: string } }) {
  const club = await getClub(params.id)

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
          <h1 className="text-3xl font-bold">Add Notable Player</h1>
          <p className="text-muted-foreground">
            {club.name} {club.nickname && `"${club.nickname}"`}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            New Player Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addPlayer} className="space-y-6">
            <input type="hidden" name="clubId" value={params.id} />

            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName">Player Name *</Label>
              <Input type="text" name="playerName" required placeholder="e.g., Michael Long" />
            </div>

            {/* Player Type */}
            <div className="space-y-2">
              <Label htmlFor="playerType">Player Category *</Label>
              <Select name="playerType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select player category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vfl_afl">🏈 VFL/AFL Player</SelectItem>
                  <SelectItem value="record_holder">📊 Record Holder</SelectItem>
                  <SelectItem value="hall_of_fame">⭐ Hall of Fame</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Years Active */}
            <div className="space-y-2">
              <Label htmlFor="yearsActive">Years Active at Club</Label>
              <Input type="text" name="yearsActive" placeholder="e.g., 1985-1990 or 1995-2003, 2010-2012" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Games Played */}
              <div className="space-y-2">
                <Label htmlFor="gamesPlayed">Games Played</Label>
                <Input type="number" name="gamesPlayed" min="0" placeholder="Total games for club" />
              </div>

              {/* Goals Kicked */}
              <div className="space-y-2">
                <Label htmlFor="goalsKicked">Goals Kicked</Label>
                <Input type="number" name="goalsKicked" min="0" placeholder="Total goals for club" />
              </div>
            </div>

            {/* VFL/AFL Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">VFL/AFL Career (if applicable)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vflAflClub">VFL/AFL Club</Label>
                  <Input type="text" name="vflAflClub" placeholder="e.g., Essendon, Richmond" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debutYear">AFL Debut Year</Label>
                  <Input type="number" name="debutYear" min="1897" max={new Date().getFullYear()} />
                </div>
              </div>
            </div>

            {/* Record Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Club Records (if applicable)</h3>

              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Input type="text" name="recordType" placeholder="e.g., Most Games, Most Goals, Club Champion" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDetails">Record Details</Label>
                <Input type="text" name="recordDetails" placeholder="e.g., 387 games (1975-1995)" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                name="notes"
                placeholder="Any additional information about this player's career, achievements, or significance to the club..."
                rows={4}
              />
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Add Player</Button>
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
