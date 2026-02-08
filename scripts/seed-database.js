const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: ".env.local" })

async function seedDatabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials")
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("Seeding database...")

    const seedFile = path.join(__dirname, "..", "supabase", "seed.sql")
    const sql = fs.readFileSync(seedFile, "utf8")

    console.log("Please run the seed.sql file using:")
    console.log("1. Supabase Dashboard SQL Editor")
    console.log("2. Copy the contents of: supabase/seed.sql")

    console.log("\nSeed data ready!")
}

seedDatabase()
