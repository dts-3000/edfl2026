"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Clubs", href: "/clubs" },
  { name: "League History", href: "/league-history" },
  { name: "Historical Seasons", href: "/historical-seasons" },
  { name: "Admin", href: "/admin" },
  { name: "Test Connection", href: "/test-connection" }, // Add this line
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-primary">
            EDFL Database
          </Link>
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
