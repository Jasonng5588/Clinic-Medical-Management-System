const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: ".env.local" })

async function runMigrations() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const directUrl = process.env.DIRECT_URL

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials")
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("Running database migrations...")

    const migrationsDir = path.join(__dirname, "..", "supabase", "migrations")
    const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort()

    for (const file of migrationFiles) {
        console.log(`Running migration: ${file}`)
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")

        // Note: This requires direct database access
        // In production, use Supabase CLI: supabase db push
        console.log(`Please run this migration manually using Supabase dashboard or CLI:`)
        console.log(file)
    }

    console.log("\nMigrations listed. Please run them using:")
    console.log("1. Supabase Dashboard SQL Editor")
    console.log("2. Or Supabase CLI: supabase db push")
}

runMigrations()
