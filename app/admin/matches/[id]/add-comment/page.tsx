import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

interface MatchInfo {
  id: number
  season_year: number
  round_number: number
  home_club: string
  away_club: string
}

async function getMatchInfo(id: string): Promise<MatchInfo | null> {
  try {
    const matches = await sql`
      SELECT 
        m.id, s.year as season_year, m.round_number,
        hc.name as home_club, ac.name as away_club
      FROM matches m
      JOIN seasons s ON m.season_id = s.id
      JOIN clubs hc ON m.home_club_id = hc.id
      JOIN clubs ac ON m.away_club_id = ac.id
      WHERE m.id = ${id}
    `
    return (matches[0] as MatchInfo) || null
  } catch (error) {
    return null
  }
}

async function addComment(formData: FormData) {
  "use server"

  const matchId = formData.get("matchId") as string
  const commentType = formData.get("commentType") as string
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const source = formData.get("source") as string
  const datePublished = formData.get("datePublished") as string
  const author = formData.get("author") as string
  const imageUrl = formData.get("imageUrl") as string

  try {
    await sql`
      INSERT INTO match_comments (
        match_id, comment_type, title, content, source, 
        date_published, author, image_url, created_by
      ) VALUES (
        ${matchId}, ${commentType}, ${title || null}, ${content || null}, 
        ${source || null}, ${datePublished || null}, ${author || null}, 
        ${imageUrl || null}, 'Admin'
      )
    `
    redirect(`/matches/${matchId}`)
  } catch (error) {
    console.error("Error adding comment:", error)
    throw new Error("Failed to add comment")
  }
}

export default async function AddCommentPage({ params }: { params: { id: string } }) {
  const match = await getMatchInfo(params.id)

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
          <h1 className="text-3xl font-bold">Add Comment/Media</h1>
          <p className="text-muted-foreground">
            {match.home_club} vs {match.away_club} - {match.season_year} Round {match.round_number}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            New Comment/Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addComment} className="space-y-6">
            <input type="hidden" name="matchId" value={params.id} />

            {/* Comment Type */}
            <div className="space-y-2">
              <Label htmlFor="commentType">Type *</Label>
              <Select name="commentType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select comment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newspaper">📰 Newspaper Article</SelectItem>
                  <SelectItem value="commentary">💬 Commentary</SelectItem>
                  <SelectItem value="photo">📸 Photo</SelectItem>
                  <SelectItem value="program">📋 Match Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input type="text" name="title" placeholder="e.g., 'Blues defeat Hawks in thriller'" />
            </div>

            {/* Source Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input type="text" name="source" placeholder="e.g., Herald Sun, Local Observer" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datePublished">Date Published</Label>
                <Input type="date" name="datePublished" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author/Photographer</Label>
              <Input type="text" name="author" placeholder="Author or photographer name" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                name="content"
                placeholder="Paste newspaper article text, write commentary, or describe the photo..."
                rows={8}
              />
              <p className="text-sm text-muted-foreground">
                For newspaper articles, you can copy and paste the full text here
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" />
              <p className="text-sm text-muted-foreground">Link to newspaper cutting scan, photo, or program image</p>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Add Comment</Button>
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
