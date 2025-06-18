import { sql, handleDbError } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, MapPin, Calendar, Users } from "lucide-react"

interface Club {
  id: number
  name: string
  founded_year: number | null
  home_ground: string | null
  colors: string | null
  nickname: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  active: boolean
}

async function getClubs(): Promise<Club[]> {
  try {
    const clubs = await sql`
      SELECT * FROM clubs 
      ORDER BY name ASC
    `
    return clubs as Club[]
  } catch (error) {
    handleDbError(error)
  }
}

export default async function ClubsPage() {
  const clubs = await getClubs()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
          <p className="text-muted-foreground">Manage EDFL club information and details</p>
        </div>
        <Link href="/clubs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Club
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                  {club.nickname && <CardDescription className="text-lg font-medium">{club.nickname}</CardDescription>}
                </div>
                <Badge variant={club.active ? "default" : "secondary"}>{club.active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {club.founded_year && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Founded {club.founded_year}
                </div>
              )}
              {club.home_ground && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {club.home_ground}
                </div>
              )}
              {club.colors && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  Colors: {club.colors}
                </div>
              )}
              <div className="pt-2">
                <Link href={`/clubs/${club.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first club to the database.</p>
            <Link href="/clubs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Club
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
