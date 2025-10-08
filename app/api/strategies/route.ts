import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/auth/supabase-server"
import { StrategyRowSchema, mapStrategy } from "@/types/strategy"
import type { StrategyRow, StrategyInsert } from "@/lib/database/schema"
import type { Account } from "@/types/account"
import { gumloopClient } from "@/lib/gumloop/client"
import { buildGumloopPayload } from "@/lib/gumloop/workflows"
import { buildStrategyInputs, formatErrorResponse } from "@/lib/utils"

const createStrategySchema = z.object({
  accountId: z.string().uuid({ message: "Account is required" }),
  title: z.string().min(1, "Title is required"),
  context: z.string().min(1, "Context is required"),
  fileUrl: z.string().url().optional(),
  focusArea: z.string().optional(),
  customUrl: z.string().url().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")
  const strategyId = searchParams.get("strategyId")
  const supabase = createSupabaseServerClient()

  let query = supabase.from("strategies").select("*")
  
  if (strategyId) {
    query = query.eq("id", strategyId)
  } else if (accountId) {
    query = query.eq("account_id", accountId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = StrategyRowSchema.array().parse(data)
  return NextResponse.json({ data: rows.map(mapStrategy) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createSupabaseServerClient()

  const normalizedBody = {
    ...body,
    title: typeof body.title === "string" ? body.title.trim() : body.title,
    context: typeof body.context === "string" ? body.context.trim() : body.context,
    focusArea:
      typeof body.focusArea === "string" && body.focusArea.trim().length > 0
        ? body.focusArea.trim()
        : undefined,
    customUrl:
      typeof body.customUrl === "string" && body.customUrl.trim().length > 0
        ? body.customUrl.trim()
        : undefined,
    fileUrl:
      typeof body.fileUrl === "string" && body.fileUrl.trim().length > 0
        ? body.fileUrl.trim()
        : undefined,
  }

  const parseResult = createStrategySchema.safeParse(normalizedBody)
  if (!parseResult.success) {
    const flattened = parseResult.error.flatten()
    console.error("Strategy POST validation failed", {
      body,
      fieldErrors: flattened.fieldErrors,
      formErrors: flattened.formErrors,
    })
    const fieldErrorMessage = Object.values(flattened.fieldErrors)
      .flat()
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    const formErrorMessage = flattened.formErrors.find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    )
    const message = fieldErrorMessage ?? formErrorMessage ?? "Validation failed"

    return NextResponse.json(
      { error: "Validation failed", message, details: flattened },
      { status: 400 }
    )
  }

  const { accountId, title, context, fileUrl, focusArea, customUrl } = parseResult.data

  const accountResult = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", accountId)
    .maybeSingle()

  if (accountResult.error || !accountResult.data) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  const account = accountResult.data as Pick<Account, "id" | "name">

  const baseInputs = buildStrategyInputs({ context, focusArea, customUrl, fileUrl })

  const values: StrategyInsert = {
    account_id: accountId,
    title,
    status: "generating",
    inputs: baseInputs,
  }

  const insertResult = await supabase
    .from("strategies")
    .insert(values as any)
    .select("*")
    .single()

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  }

  const row = StrategyRowSchema.parse(insertResult.data)
  const strategy = mapStrategy(row)

  try {
    const startResponse = await gumloopClient.startPipeline(
      buildGumloopPayload(account.name, context)
    )

    const enhancedInputs = {
      ...baseInputs,
      gumloopRunId: startResponse.run_id,
      gumloopUrl: startResponse.url,
      gumloopSavedItemId: startResponse.saved_item_id,
    }

    const updateResult = await supabase
      .from("strategies")
      // @ts-expect-error - Supabase type inference issue with Json type
      .update({ inputs: enhancedInputs })
      .eq("id", strategy.id)
      .select("*")
      .single()

    if (updateResult.error || !updateResult.data) {
      throw updateResult.error ?? new Error("Failed to update strategy with Gumloop run info")
    }

    // @ts-expect-error - Supabase type inference issue
    const updatedRow = StrategyRowSchema.parse(updateResult.data)
    const updatedStrategy = mapStrategy(updatedRow)

    return NextResponse.json({ data: updatedStrategy }, { status: 201 })
  } catch (triggerError) {
    console.error("Failed to trigger Gumloop flow", triggerError)
    const failureUpdate = { status: "failed" }
    await supabase
      .from("strategies")
      // @ts-expect-error - Supabase type inference issue
      .update(failureUpdate)
      .eq("id", strategy.id)

    return NextResponse.json(
      {
        error: formatErrorResponse(triggerError, "Failed to trigger Gumloop workflow"),
      },
      { status: 502 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const strategyId = searchParams.get("id")

  if (!strategyId) {
    return NextResponse.json({ error: "Strategy ID is required" }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const deleteResult = await supabase
    .from("strategies")
    .delete()
    .eq("id", strategyId)

  if (deleteResult.error) {
    console.error("Failed to delete strategy", deleteResult.error)
    return NextResponse.json({ error: "Failed to delete strategy" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
