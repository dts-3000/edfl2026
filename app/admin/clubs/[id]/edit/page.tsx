import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

interface Club {
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

async function getClub(id: string): Promise<Club | null> {
  try {
    const clubs = await sql`SELECT * FROM clubs WHERE id = ${id}`
    return (clubs[0] as Club) || null
  } catch (error) {
    return null
  }
}

async function updateClub(formData: FormData) {
  "use server"

  const clubId = formData.get("clubId") as string
  const name = formData.get("name") as string
  const nickname = formData.get("nickname") as string
  const foundedYear = formData.get("foundedYear") as string
  const homeGround = formData.get("homeGround") as string
  const groundAddress = formData.get("groundAddress") as string
  const colors = formData.get("colors") as string
  const website = formData.get("website") as string
  const contactEmail = formData.get("contactEmail") as string
  const contactPhone = formData.get("contactPhone") as string
  const presidentName = formData.get("presidentName") as string
  const coachName = formData.get("coachName") as string
  const active = formData.get("active") === "on"
  const clubHistory = formData.get("clubHistory") as string

  try {
    await sql`
      UPDATE clubs SET
        name = ${name},
        nickname = ${nickname || null},
        founded_year = ${foundedYear ? Number.parseInt(foundedYear) : null},
        home_ground = ${homeGround || null},
        ground_address = ${groundAddress || null},
        colors = ${colors || null},
        website = ${website || null},
        contact_email = ${contactEmail || null},
        contact_phone = ${contactPhone || null},
        president_name = ${presidentName || null},
        coach_name = ${coachName || null},
        active = ${active},
        club_history = ${clubHistory || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${clubId}
    `
    redirect(`/clubs/${clubId}`)
  } catch (error) {
    console.error("Error updating club:", error)
    throw new Error("Failed to update club")
  }
}

export default async function EditClubPage({ params }: { params: { id: string } }) {
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
          <h1 className="text-3xl font-bold">Edit Club</h1>
          <p className="text-muted-foreground">{club.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Club Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateClub} className="space-y-6">
            <input type="hidden" name="clubId" value={params.id} />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input type="text" name="name" required defaultValue={club.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  type="text"
                  name="nickname"
                  defaultValue={club.nickname || ""}
                  placeholder="e.g., Blues, Hawks"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  type="number"
                  name="foundedYear"
                  min="1850"
                  max={new Date().getFullYear()}
                  defaultValue={club.founded_year || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Club Colors</Label>
                <Input type="text" name="colors" defaultValue={club.colors || ""} placeholder="e.g., Red and Black" />
              </div>
            </div>

            {/* Ground Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ground Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homeGround">Home Ground</Label>
                  <Input type="text" name="homeGround" defaultValue={club.home_ground || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groundAddress">Ground Address</Label>
                  <Input type="text" name="groundAddress" defaultValue={club.ground_address || ""} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input type="email" name="contactEmail" defaultValue={club.contact_email || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input type="tel" name="contactPhone" defaultValue={club.contact_phone || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    name="website"
                    defaultValue={club.website || ""}
                    placeholder="https://www.clubname.com.au"
                  />
                </div>
              </div>
            </div>

            {/* Officials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Officials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="presidentName">President</Label>
                  <Input type="text" name="presidentName" defaultValue={club.president_name || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coachName">Senior Coach</Label>
                  <Input type="text" name="coachName" defaultValue={club.coach_name || ""} />
                </div>
              </div>
            </div>

            {/* Club History */}
            <div className="space-y-2">
              <Label htmlFor="clubHistory">Club History</Label>
              <Textarea
                name="clubHistory"
                defaultValue={club.club_history || ""}
                placeholder="Write about the club's history, significant moments, traditions..."
                rows={6}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox name="active" defaultChecked={club.active} />
              <Label htmlFor="active">Club is currently active</Label>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Update Club</Button>
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
