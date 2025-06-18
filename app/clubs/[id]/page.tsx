import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit, Plus, Trophy, Users, Star, Award, Calendar, MapPin, Phone, Mail, Globe } from "lucide-react"
import { notFound } from "next/navigation"

interface ClubDetail {
  id: number
  name: string
  founded_year: number | null
  home_ground: string | null
  ground_address: string | null
  colors: string | null
  nickname: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  president_name: string | null
  coach_name: string | null
  active: boolean
  club_history: string | null
}

interface Achievement {
  id: number
  achievement_type: string
  year: number
  player_name: string | null
  details: string | null
  goals_kicked: number | null
  votes_received: number | null
}

interface Player {
  id: number
  player_name: string
  player_type: string
  years_active: string | null
  games_played: number | null
  goals_kicked: number | null
  vfl_afl_club: string | null
  debut_year: number | null
  record_type: string | null
  record_details: string | null
  notes: string | null
}

async function getClubDetail(id: string): Promise<ClubDetail | null> {
  try {
    const clubs = await sql`
      SELECT * FROM clubs WHERE id = ${id}
    `
    return (clubs[0] as ClubDetail) || null
  } catch (error) {
    return null
  }
}

async function getClubAchievements(clubId: string): Promise<Achievement[]> {
  try {
    const achievements = await sql`
      SELECT * FROM club_achievements 
      WHERE club_id = ${clubId}
      ORDER BY year DESC, achievement_type
    `
    return achievements as Achievement[]
  } catch (error) {
    return []
  }
}

async function getClubPlayers(clubId: string): Promise<Player[]> {
  try {
    const players = await sql`
      SELECT * FROM club_players 
      WHERE club_id = ${clubId}
      ORDER BY player_type, player_name
    `
    return players as Player[]
  } catch (error) {
    return []
  }
}

const achievementIcons = {
  premiership: "🏆",
  runner_up: "🥈",
  best_and_fairest: "🏅",
  leading_goalkicker: "⚽",
}

const playerTypeLabels = {
  vfl_afl: "VFL/AFL Players",
  record_holder: "Record Holders",
  hall_of_fame: "Hall of Fame",
}

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const club = await getClubDetail(params.id)

  if (!club) {
    notFound()
  }

  const achievements = await getClubAchievements(params.id)
  const players = await getClubPlayers(params.id)

  // Group achievements by type
  const achievementsByType = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.achievement_type]) {
        acc[achievement.achievement_type] = []
      }
      acc[achievement.achievement_type].push(achievement)
      return acc
    },
    {} as Record<string, Achievement[]>,
  )

  // Group players by type
  const playersByType = players.reduce(
    (acc, player) => {
      if (!acc[player.player_type]) {
        acc[player.player_type] = []
      }
      acc[player.player_type].push(player)
      return acc
    },
    {} as Record<string, Player[]>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/clubs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            {club.nickname && <p className="text-xl text-muted-foreground">"{club.nickname}"</p>}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/clubs/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Club
            </Button>
          </Link>
          <Link href={`/admin/clubs/${params.id}/add-achievement`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </Link>
        </div>
      </div>

      {/* Club Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Club Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.founded_year && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Founded</h4>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {club.founded_year}
                  </p>
                </div>
              )}
              {club.colors && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Colors</h4>
                  <p>{club.colors}</p>
                </div>
              )}
              {club.home_ground && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Home Ground</h4>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {club.home_ground}
                  </p>
                  {club.ground_address && <p className="text-sm text-muted-foreground mt-1">{club.ground_address}</p>}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                <Badge variant={club.active ? "default" : "secondary"}>{club.active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>

            {club.club_history && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Club History</h4>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{club.club_history}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Officials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {club.president_name && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">President</h4>
                <p className="text-sm">{club.president_name}</p>
              </div>
            )}
            {club.coach_name && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Coach</h4>
                <p className="text-sm">{club.coach_name}</p>
              </div>
            )}
            {club.contact_phone && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Phone</h4>
                <p className="text-sm flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {club.contact_phone}
                </p>
              </div>
            )}
            {club.contact_email && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Email</h4>
                <p className="text-sm flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {club.contact_email}
                </p>
              </div>
            )}
            {club.website && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Website</h4>
                <p className="text-sm">
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Visit Website
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Club Achievements
            </span>
            <div className="flex space-x-2">
              <Badge variant="outline">{achievements.length} total</Badge>
              <Link href={`/admin/clubs/${params.id}/add-achievement`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No achievements recorded</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking this club's premierships, awards, and milestones.
              </p>
              <Link href={`/admin/clubs/${params.id}/add-achievement`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Achievement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="mr-2">{achievementIcons[type as keyof typeof achievementIcons] || "🏅"}</span>
                    {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    <Badge variant="secondary" className="ml-2">
                      {typeAchievements.length}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {typeAchievements.map((achievement) => (
                      <div key={achievement.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">{achievement.year}</span>
                          {achievement.goals_kicked && (
                            <Badge variant="outline">{achievement.goals_kicked} goals</Badge>
                          )}
                        </div>
                        {achievement.player_name && <p className="font-medium text-sm">{achievement.player_name}</p>}
                        {achievement.details && (
                          <p className="text-sm text-muted-foreground mt-1">{achievement.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notable Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Notable Players
            </span>
            <div className="flex space-x-2">
              <Badge variant="outline">{players.length} players</Badge>
              <Link href={`/admin/clubs/${params.id}/add-player`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No players recorded</h3>
              <p className="text-muted-foreground mb-4">
                Add VFL/AFL players, record holders, and hall of fame members.
              </p>
              <Link href={`/admin/clubs/${params.id}/add-player`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Player
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(playersByType).map(([type, typePlayers]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    {playerTypeLabels[type as keyof typeof playerTypeLabels] || type}
                    <Badge variant="secondary" className="ml-2">
                      {typePlayers.length}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typePlayers.map((player) => (
                      <div key={player.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{player.player_name}</h4>
                          {player.years_active && <Badge variant="outline">{player.years_active}</Badge>}
                        </div>

                        <div className="space-y-1 text-sm">
                          {player.vfl_afl_club && (
                            <p>
                              <strong>VFL/AFL Club:</strong> {player.vfl_afl_club}
                            </p>
                          )}
                          {player.games_played && (
                            <p>
                              <strong>Games:</strong> {player.games_played}
                            </p>
                          )}
                          {player.goals_kicked && (
                            <p>
                              <strong>Goals:</strong> {player.goals_kicked}
                            </p>
                          )}
                          {player.record_type && (
                            <p>
                              <strong>Record:</strong> {player.record_type}
                            </p>
                          )}
                          {player.debut_year && (
                            <p>
                              <strong>AFL Debut:</strong> {player.debut_year}
                            </p>
                          )}
                        </div>

                        {player.notes && <p className="text-sm text-muted-foreground mt-2">{player.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
