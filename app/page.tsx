import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, History, Trophy, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Essendon District Football League</h1>
        <p className="text-xl text-muted-foreground mt-2">Database Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/clubs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Clubs</CardTitle>
              <CardDescription>Manage club information, contacts, and details</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/league-history">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <History className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>League History</CardTitle>
              <CardDescription>Record significant events and milestones</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/historical-seasons">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Historical Seasons</CardTitle>
              <CardDescription>Track seasons, results, and championships</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Admin</CardTitle>
              <CardDescription>System administration and data management</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
