import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/auth/supabase-server"
import { StrategyRowSchema, mapStrategy } from "@/types/strategy"
import { mapStrategyResultSection } from "@/lib/gumloop/workflows"
import type { StrategyUpdate, StrategyRow } from "@/lib/database/schema"

const resultSectionSchema = z.object({
  markdown: z.string(),
  sources: z.array(z.string().url()).optional(),
})

const gumloopWebhookSchema = z.object({
  strategyId: z.string().uuid(),
  result: z.object({
    status: z.enum(["pending", "generating", "complete", "failed"]),
    priorities: resultSectionSchema.optional(),
    keyAssets: resultSectionSchema.optional(),
    opportunities: resultSectionSchema.optional(),
    contacts: resultSectionSchema.optional(),
  }),
})

const validateWebhookSecret = (request: Request) => {
  const secret = process.env.GUMLOOP_WEBHOOK_SECRET
  if (!secret) return true

  const headerSecret = request.headers.get("x-gumloop-signature")
  return headerSecret === secret
}

export async function POST(request: Request) {
  if (!validateWebhookSecret(request)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const payload = await request.json()
  const parseResult = gumloopWebhookSchema.safeParse(payload)

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  const { strategyId, result } = parseResult.data

  const updatePayload: StrategyUpdate = {
    status: result.status,
    priorities: mapStrategyResultSection(result.priorities) as StrategyUpdate["priorities"],
    key_assets: mapStrategyResultSection(result.keyAssets) as StrategyUpdate["key_assets"],
    opportunities: mapStrategyResultSection(result.opportunities) as StrategyUpdate["opportunities"],
    contacts: mapStrategyResultSection(result.contacts) as StrategyUpdate["contacts"],
  }

  const updateResult = await supabase
    .from("strategies")
    .update(updatePayload)
    .eq("id", strategyId)
    .select<StrategyRow>("*")
    .single()

  if (updateResult.error) {
    console.error("Failed to update strategy from webhook", updateResult.error)
    return NextResponse.json({ error: "Failed to update strategy" }, { status: 500 })
  }

  const row = StrategyRowSchema.parse(updateResult.data)
  return NextResponse.json({ data: mapStrategy(row) })
}
