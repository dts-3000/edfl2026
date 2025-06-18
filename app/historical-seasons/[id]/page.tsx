import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Plus, Calendar, Trophy, Edit } from "lucide-react"
import { notFound } from "next/navigation"

interface Season {
  id: number
  year: number
  name: string | null
  start_date: string | null
  end_date: string | null
  total_rounds: number | null
  premier_club_name: string | null
  runner_up_club_name: string | null
  finals_format: string | null
}

interface Match {
  id: number
  round_number: number
  match_date: string | null
  home_club: string
  away_club: string
  home_score_total: number | null
  away_score_total: number | null
  winning_club: string | null
  venue: string | null
  match_type: string
  has_comments: boolean
}

async function getSeason(id: string): Promise<Season | null> {
  try {
    const seasons = await sql`
      SELECT 
        s.*,
        pc.name as premier_club_name,
        rc.name as runner_up_club_name
      FROM seasons s
      LEFT JOIN clubs pc ON s.premier_club_id = pc.id
      LEFT JOIN clubs rc ON s.runner_up_club_id = rc.id
      WHERE s.id = ${id}
    `
    return (seasons[0] as Season) || null
  } catch (error) {
    return null
  }
}

async function getSeasonMatches(seasonId: string): Promise<Match[]> {
  try {
    const matches = await sql`
      SELECT 
        m.id,
        m.round_number,
        m.match_date,
        m.venue,
        m.match_type,
        hc.name as home_club,
        ac.name as away_club,
        mr.home_score_total,
        mr.away_score_total,
        wc.name as winning_club,
        CASE WHEN COUNT(mc.id) > 0 THEN true ELSE false END as has_comments
      FROM matches m
      JOIN clubs hc ON m.home_club_id = hc.id
      JOIN clubs ac ON m.away_club_id = ac.id
      LEFT JOIN match_results mr ON m.id = mr.match_id
      LEFT JOIN clubs wc ON mr.winning_club_id = wc.id
      LEFT JOIN match_comments mc ON m.id = mc.match_id
      WHERE m.season_id = ${seasonId}
      GROUP BY m.id, m.round_number, m.match_date, m.venue, m.match_type, 
               hc.name, ac.name, mr.home_score_total, mr.away_score_total, wc.name
      ORDER BY m.round_number ASC, m.match_date ASC
    `
    return matches as Match[]
  } catch (error) {
    return []
  }
}

export default async function SeasonDetailPage({ params }: { params: { id: string } }) {
  const season = await getSeason(params.id)

  if (!season) {
    notFound()
  }

  const matches = await getSeasonMatches(params.id)

  // Group matches by round
  const matchesByRound = matches.reduce(
    (acc, match) => {
      if (!acc[match.round_number]) {
        acc[match.round_number] = []
      }
      acc[match.round_number].push(match)
      return acc
    },
    {} as Record<number, Match[]>,
  )

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/historical-seasons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Seasons
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{season.year} Season</h1>
            {season.name && <p className="text-muted-foreground">{season.name}</p>}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/seasons/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Season
            </Button>
          </Link>
          <Link href={`/admin/seasons/${params.id}/add-match`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Season Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Season Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {season.start_date && season.end_date && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                <p className="text-sm">
                  {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {season.total_rounds && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Total Rounds</h4>
                <p className="text-sm">{season.total_rounds}</p>
              </div>
            )}
            {season.premier_club_name && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Premier</h4>
                <p className="text-sm font-medium">{season.premier_club_name}</p>
              </div>
            )}
            {season.runner_up_club_name && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Runner-up</h4>
                <p className="text-sm">{season.runner_up_club_name}</p>
              </div>
            )}
          </div>
          {season.finals_format && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Finals Format</h4>
              <p className="text-sm">{season.finals_format}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matches by Round */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Season Results</h2>
          <Badge variant="outline">{matches.length} matches</Badge>
        </div>

        {rounds.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">Start adding matches to track this season's results.</p>
              <Link href={`/admin/seasons/${params.id}/add-match`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Match
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          rounds.map((roundNumber) => (
            <Card key={roundNumber}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Round {roundNumber}</span>
                  <Badge variant="secondary">{matchesByRound[roundNumber].length} matches</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matchesByRound[roundNumber].map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="truncate">{match.home_club}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="truncate">{match.away_club}</span>
                            </div>
                            {match.venue && <div className="text-xs text-muted-foreground mt-1">{match.venue}</div>}
                          </div>

                          {match.home_score_total !== null && match.away_score_total !== null ? (
                            <div className="text-sm font-mono">
                              <span className={match.winning_club === match.home_club ? "font-bold" : ""}>
                                {match.home_score_total}
                              </span>
                              <span className="mx-2 text-muted-foreground">-</span>
                              <span className={match.winning_club === match.away_club ? "font-bold" : ""}>
                                {match.away_score_total}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline">No Score</Badge>
                          )}

                          <div className="flex items-center space-x-2">
                            {match.has_comments && (
                              <Badge variant="secondary" className="text-xs">
                                📰 Comments
                              </Badge>
                            )}
                            {match.match_type !== "Regular" && (
                              <Badge variant="default" className="text-xs">
                                {match.match_type}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {match.match_date && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(match.match_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link href={`/matches/${match.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/matches/${match.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
