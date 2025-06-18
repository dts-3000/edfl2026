# EDFL Database Application

Essendon District Football League management system built with Next.js and Neon PostgreSQL.

## Features
- Club management and information
- Historical seasons and records
- League history and milestones
- Match results and statistics
- Admin dashboard

## Environment Variables

You need to set the following environment variable:

- `DATABASE_URL`: Your Neon PostgreSQL connection string

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the SQL scripts in the `/scripts` folder:
1. `001-create-edfl-schema.sql`
2. `002-seed-edfl-data.sql`
\`\`\`

### **Verification Script**
