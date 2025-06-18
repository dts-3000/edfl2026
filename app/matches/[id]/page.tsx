import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit, Plus, Calendar, MapPin, MessageSquare } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { notFound } from "next/navigation"

interface MatchDetail {
  id: number
  season_year: number
  season_id: number
  round_number: number
  match_date: string | null
  match_time: string | null
  venue: string | null
  match_type: string
  home_club: string
  away_club: string
  home_score_goals: number | null
  home_score_behinds: number | null
  home_score_total: number | null
  away_score_goals: number | null
  away_score_behinds: number | null
  away_score_total: number | null
  winning_club: string | null
  margin: number | null
  best_on_ground: string | null
  attendance: number | null
  weather_conditions: string | null
  umpires: string | null
  match_report: string | null
}

interface MatchComment {
  id: number
  comment_type: string
  title: string | null
  content: string | null
  source: string | null
  date_published: string | null
  author: string | null
  image_url: string | null
  created_at: string
}

async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  try {
    const matches = await sql`
      SELECT 
        m.*,
        s.year as season_year,
        hc.name as home_club,
        ac.name as away_club,
        mr.home_score_goals,
        mr.home_score_behinds,
        mr.home_score_total,
        mr.away_score_goals,
        mr.away_score_behinds,
        mr.away_score_total,
        wc.name as winning_club,
        mr.margin,
        mr.best_on_ground,
        mr.match_report,
        mr.umpires
      FROM matches m
      JOIN seasons s ON m.season_id = s.id
      JOIN clubs hc ON m.home_club_id = hc.id
      JOIN clubs ac ON m.away_club_id = ac.id
      LEFT JOIN match_results mr ON m.id = mr.match_id
      LEFT JOIN clubs wc ON mr.winning_club_id = wc.id
      WHERE m.id = ${id}
    `
    return (matches[0] as MatchDetail) || null
  } catch (error) {
    return null
  }
}

async function getMatchComments(matchId: string): Promise<MatchComment[]> {
  try {
    const comments = await sql`
      SELECT *
      FROM match_comments
      WHERE match_id = ${matchId}
      ORDER BY date_published DESC, created_at DESC
    `
    return comments as MatchComment[]
  } catch (error) {
    return []
  }
}

const commentTypeIcons = {
  newspaper: "📰",
  commentary: "💬",
  photo: "📸",
  program: "📋",
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getMatchDetail(params.id)

  if (!match) {
    notFound()
  }

  const comments = await getMatchComments(params.id)

  const hasScore = match.home_score_total !== null && match.away_score_total !== null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/historical-seasons/${match.season_id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Season
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {match.home_club} vs {match.away_club}
            </h1>
            <p className="text-muted-foreground">
              {match.season_year} Season - Round {match.round_number}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/matches/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Match
            </Button>
          </Link>
          <Link href={`/admin/matches/${params.id}/add-comment`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </Link>
        </div>
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Match Result</span>
              {match.match_type !== "Regular" && <Badge variant="default">{match.match_type}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasScore ? (
              <div className="space-y-4">
                {/* Score Display */}
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-right">
                      <h3
                        className={`text-2xl font-bold ${match.winning_club === match.home_club ? "text-green-600" : ""}`}
                      >
                        {match.home_club}
                      </h3>
                      <div className="text-sm text-muted-foreground">Home</div>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl font-bold font-mono">
                        <span className={match.winning_club === match.home_club ? "text-green-600" : ""}>
                          {match.home_score_total}
                        </span>
                        <span className="mx-2 text-muted-foreground">-</span>
                        <span className={match.winning_club === match.away_club ? "text-green-600" : ""}>
                          {match.away_score_total}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {match.home_score_goals}.{match.home_score_behinds} - {match.away_score_goals}.
                        {match.away_score_behinds}
                      </div>
                      {match.margin && <div className="text-sm font-medium mt-2">Margin: {match.margin} points</div>}
                    </div>

                    <div className="text-left">
                      <h3
                        className={`text-2xl font-bold ${match.winning_club === match.away_club ? "text-green-600" : ""}`}
                      >
                        {match.away_club}
                      </h3>
                      <div className="text-sm text-muted-foreground">Away</div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {match.best_on_ground && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Best on Ground</h4>
                      <p className="text-sm">{match.best_on_ground}</p>
                    </div>
                  )}
                  {match.attendance && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Attendance</h4>
                      <p className="text-sm">{match.attendance.toLocaleString()}</p>
                    </div>
                  )}
                  {match.umpires && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Umpires</h4>
                      <p className="text-sm">{match.umpires}</p>
                    </div>
                  )}
                  {match.weather_conditions && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Weather</h4>
                      <p className="text-sm">{match.weather_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Score Recorded</h3>
                <p className="text-muted-foreground mb-4">The score for this match hasn't been entered yet.</p>
                <Link href={`/admin/matches/${params.id}/edit`}>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Add Score
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {match.match_date && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Date & Time</h4>
                <p className="text-sm">
                  {new Date(match.match_date).toLocaleDateString()}
                  {match.match_time && ` at ${match.match_time}`}
                </p>
              </div>
            )}
            {match.venue && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Venue</h4>
                <p className="text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {match.venue}
                </p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Round</h4>
              <p className="text-sm">Round {match.round_number}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Season</h4>
              <p className="text-sm">
                <Link href={`/historical-seasons/${match.season_id}`} className="text-blue-600 hover:underline">
                  {match.season_year} Season
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Report */}
      {match.match_report && (
        <Card>
          <CardHeader>
            <CardTitle>Match Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{match.match_report}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments and Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments & Media
            </span>
            <Badge variant="outline">{comments.length} items</Badge>
          </CardTitle>
          <CardDescription>Newspaper cuttings, photos, and commentary about this match</CardDescription>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p className="text-muted-foreground mb-4">
                Add newspaper cuttings, photos, or commentary about this match.
              </p>
              <Link href={`/admin/matches/${params.id}/add-comment`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Comment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {commentTypeIcons[comment.comment_type as keyof typeof commentTypeIcons] || "📝"}
                      </span>
                      <div>
                        {comment.title && <h4 className="font-semibold">{comment.title}</h4>}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {comment.source && <span>{comment.source}</span>}
                          {comment.author && <span>by {comment.author}</span>}
                          {comment.date_published && (
                            <span>{new Date(comment.date_published).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {comment.comment_type}
                    </Badge>
                  </div>

                  {comment.image_url && (
                    <div className="mb-3">
                      <ImageIcon
                        src={comment.image_url || "/placeholder.svg"}
                        alt={comment.title || "Match media"}
                        className="max-w-full h-auto rounded border"
                      />
                    </div>
                  )}

                  {comment.content && (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
