import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Helper function to handle database errors
export function handleDbError(error: unknown): never {
  console.error("Database error:", error)
  throw new Error("Database operation failed")
}
