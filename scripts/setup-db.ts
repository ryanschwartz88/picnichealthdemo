/**
 * Database Setup Script
 * 
 * This script helps verify your Supabase connection and tables.
 * Run with: npx tsx scripts/setup-db.ts
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { mapAccount } from "@/types/account"
import { mapStrategy } from "@/types/strategy"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function main() {
  console.log("🔧 Database Setup Script\n")

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Missing Supabase environment variables")
    console.log("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
    process.exit(1)
  }

  console.log("✅ Environment variables found")
  console.log(`   URL: ${SUPABASE_URL}\n`)

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log("🔍 Testing database connection...")
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("*")
    .limit(5)

  if (accountsError) {
    console.error("❌ Error connecting to accounts table:", accountsError.message)
    console.log("\n💡 Make sure you've run the migration SQL in Supabase SQL Editor")
    process.exit(1)
  }

  console.log(`✅ Connected to accounts table (${accounts?.length || 0} records)\n`)

  const { data: strategies, error: strategiesError } = await supabase
    .from("strategies")
    .select("*")
    .limit(5)

  if (strategiesError) {
    console.error("❌ Error connecting to strategies table:", strategiesError.message)
    process.exit(1)
  }

  console.log(`✅ Connected to strategies table (${strategies?.length || 0} records)\n`)

  if (accounts && accounts.length > 0) {
    console.log("📊 Sample Accounts:")
    accounts.forEach((account) => {
      const mapped = mapAccount(account)
      console.log(`   - ${mapped.name} (${mapped.id})`)
    })
    console.log()
  }

  if (strategies && strategies.length > 0) {
    console.log("📋 Sample Strategies:")
    strategies.forEach((strategy) => {
      const mapped = mapStrategy(strategy)
      console.log(`   - ${mapped.title} [${mapped.status}]`)
    })
    console.log()
  }

  console.log("✅ Database setup verified successfully!")
  console.log("\n🚀 You can now run: npm run dev")
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error)
  process.exit(1)
})

