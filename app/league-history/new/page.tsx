import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
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

async function createHistoryEvent(formData: FormData) {
  "use server"

  const year = Number.parseInt(formData.get("year") as string)
  const dateOccurred = formData.get("dateOccurred") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const eventType = formData.get("eventType") as string
  const relatedClubId = formData.get("relatedClubId") as string
  const relatedSeasonId = formData.get("relatedSeasonId") as string
  const importanceLevel = Number.parseInt(formData.get("importanceLevel") as string)
  const imageUrl = formData.get("imageUrl") as string
  const sourceReference = formData.get("sourceReference") as string

  try {
    const result = await sql`
      INSERT INTO league_history (
        year, date_occurred, title, description, event_type,
        related_club_id, related_season_id, importance_level,
        image_url, source_reference, created_at, updated_at
      ) VALUES (
        ${year}, ${dateOccurred || null}, ${title}, ${description || null}, ${eventType},
        ${relatedClubId || null}, ${relatedSeasonId || null}, ${importanceLevel},
        ${imageUrl || null}, ${sourceReference || null}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    redirect("/league-history")
  } catch (error) {
    console.error("Error creating history event:", error)
    throw new Error("Failed to create history event")
  }
}

export default async function NewHistoryEventPage() {
  const clubs = await getClubs()
  const seasons = await getSeasons()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/league-history">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League History
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Historical Event</h1>
          <p className="text-muted-foreground">Record a significant event in EDFL history</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            New Historical Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createHistoryEvent} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  type="number"
                  name="year"
                  required
                  min="1889"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 1920"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOccurred">Specific Date (Optional)</Label>
                <Input type="date" name="dateOccurred" />
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input type="text" name="title" required placeholder="e.g., First Official Grand Final" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select name="eventType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">🏆 Milestone</SelectItem>
                  <SelectItem value="expansion">📈 League Expansion</SelectItem>
                  <SelectItem value="rule_change">📋 Rule Change</SelectItem>
                  <SelectItem value="infrastructure">🏗️ Infrastructure</SelectItem>
                  <SelectItem value="celebration">🎉 Celebration</SelectItem>
                  <SelectItem value="tragedy">😢 Tragedy</SelectItem>
                  <SelectItem value="championship">🏆 Championship</SelectItem>
                  <SelectItem value="merger">🤝 Club Merger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importanceLevel">Importance Level *</Label>
              <Select name="importanceLevel" required defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ Minor (1)</SelectItem>
                  <SelectItem value="2">⭐⭐ Low (2)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Medium (3)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ High (4)</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Critical (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" placeholder="Provide details about this historical event..." rows={4} />
            </div>

            {/* Related Records */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Records (Optional)</h3>

              <div className="space-y-2">
                <Label htmlFor="relatedClubId">Related Club</Label>
                <Select name="relatedClubId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a club if relevant" />
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
                <Label htmlFor="relatedSeasonId">Related Season</Label>
                <Select name="relatedSeasonId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a season if relevant" />
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
            </div>

            {/* Media and Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Media & Sources</h3>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceReference">Source Reference</Label>
                <Input type="text" name="sourceReference" placeholder="e.g., Herald Sun archives, club records" />
              </div>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Create Event</Button>
              <Link href="/league-history">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
