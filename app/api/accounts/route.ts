import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/auth/supabase-server"
import { AccountRowSchema, mapAccount } from "@/types/account"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = AccountRowSchema.array().parse(data)
  return NextResponse.json({ data: rows.map(mapAccount) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("accounts").insert(body).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = AccountRowSchema.parse(data)
  return NextResponse.json({ data: mapAccount(row) }, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("id")

  if (!accountId) {
    return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  
  // Delete all strategies for this account first
  const { error: strategiesError } = await supabase
    .from("strategies")
    .delete()
    .eq("account_id", accountId)

  if (strategiesError) {
    return NextResponse.json({ error: strategiesError.message }, { status: 500 })
  }

  // Delete the account
  const { error } = await supabase.from("accounts").delete().eq("id", accountId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("id")

  if (!accountId) {
    return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
  }

  const body = await request.json()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("accounts")
    .update({ name: body.name })
    .eq("id", accountId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = AccountRowSchema.parse(data)
  return NextResponse.json({ data: mapAccount(row) })
}

