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

async function createClub(formData: FormData) {
  "use server"

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
    const result = await sql`
      INSERT INTO clubs (
        name, nickname, founded_year, home_ground, ground_address, colors, 
        website, contact_email, contact_phone, president_name, coach_name, 
        active, club_history, created_at, updated_at
      ) VALUES (
        ${name}, ${nickname || null}, ${foundedYear ? Number.parseInt(foundedYear) : null}, 
        ${homeGround || null}, ${groundAddress || null}, ${colors || null}, 
        ${website || null}, ${contactEmail || null}, ${contactPhone || null}, 
        ${presidentName || null}, ${coachName || null}, ${active}, 
        ${clubHistory || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const clubId = result[0].id
    redirect(`/clubs/${clubId}`)
  } catch (error) {
    console.error("Error creating club:", error)
    throw new Error("Failed to create club")
  }
}

export default function NewClubPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/clubs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Club</h1>
          <p className="text-muted-foreground">Create a new club record in the EDFL database</p>
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
          <form action={createClub} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input type="text" name="name" required placeholder="e.g., Keilor Football Club" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input type="text" name="nickname" placeholder="e.g., Blues, Hawks" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  type="number"
                  name="foundedYear"
                  min="1850"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 1888"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Club Colors</Label>
                <Input type="text" name="colors" placeholder="e.g., Red and Black" />
              </div>
            </div>

            {/* Ground Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ground Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homeGround">Home Ground</Label>
                  <Input type="text" name="homeGround" placeholder="e.g., Keilor Park" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groundAddress">Ground Address</Label>
                  <Input type="text" name="groundAddress" placeholder="Full address of the ground" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input type="email" name="contactEmail" placeholder="admin@clubname.com.au" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input type="tel" name="contactPhone" placeholder="(03) 9xxx xxxx" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input type="url" name="website" placeholder="https://www.clubname.com.au" />
                </div>
              </div>
            </div>

            {/* Officials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Officials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="presidentName">President</Label>
                  <Input type="text" name="presidentName" placeholder="President's name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coachName">Senior Coach</Label>
                  <Input type="text" name="coachName" placeholder="Coach's name" />
                </div>
              </div>
            </div>

            {/* Club History */}
            <div className="space-y-2">
              <Label htmlFor="clubHistory">Club History</Label>
              <Textarea
                name="clubHistory"
                placeholder="Write about the club's history, significant moments, traditions..."
                rows={6}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox name="active" defaultChecked={true} />
              <Label htmlFor="active">Club is currently active</Label>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="submit">Create Club</Button>
              <Link href="/clubs">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
