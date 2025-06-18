import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar, BookOpen, AlertCircle } from "lucide-react"

interface HistoryEvent {
  id: number
  year: number
  title: string
  description: string | null
  event_type: string | null
}

async function getHistoryEvents(): Promise<{ events: HistoryEvent[]; error: string | null }> {
  try {
    const events = await sql`
      SELECT * FROM league_history 
      ORDER BY year DESC, id DESC
    `
    return { events: events as HistoryEvent[], error: null }
  } catch (error: any) {
    if (error.message.includes('relation "league_history" does not exist')) {
      return { events: [], error: "database_not_setup" }
    }
    return { events: [], error: error.message }
  }
}

const eventTypeColors: Record<string, string> = {
  milestone: "default",
  expansion: "secondary",
  rule_change: "outline",
  infrastructure: "destructive",
}

export default async function LeagueHistoryPage() {
  const { events, error } = await getHistoryEvents()

  // Handle database not set up
  if (error === "database_not_setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">League History</h1>
          <p className="text-muted-foreground">Significant events and milestones in EDFL history</p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 mb-4">
              The EDFL database tables need to be created before you can view league history.
            </p>
            <Link href="/test-connection">
              <Button>
                <AlertCircle className="h-4 w-4 mr-2" />
                Set Up Database
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle other errors
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">League History</h1>
          <p className="text-muted-foreground">Significant events and milestones in EDFL history</p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-red-100 rounded border border-red-200 mb-4">
              <code className="text-red-700 text-sm">{error}</code>
            </div>
            <Link href="/test-connection">
              <Button>
                <AlertCircle className="h-4 w-4 mr-2" />
                Diagnose Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Normal history display
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">League History</h1>
          <p className="text-muted-foreground">Significant events and milestones in EDFL history</p>
        </div>
        <Link href="/league-history/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.year}
                  </div>
                  {event.event_type && (
                    <Badge variant={(eventTypeColors[event.event_type] as any) || "default"}>
                      {event.event_type.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
            </CardHeader>
            {event.description && (
              <CardContent>
                <p className="text-muted-foreground">{event.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No history events found</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting the league's history by adding significant events.
            </p>
            <Link href="/league-history/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
