import { z } from "zod"

export const StrategyRowSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  title: z.string().min(1, "Strategy title is required"),
  status: z.enum(["pending", "generating", "complete", "failed"]),
  inputs: z.record(z.string(), z.any()).nullable(),
  priorities: z.string().nullable(),
  key_assets: z.string().nullable(),
  opportunities: z.string().nullable(),
  contacts: z.string().nullable(),
  created_at: z.string(), // Accept any string format from Supabase
})

export type StrategyRow = z.infer<typeof StrategyRowSchema>

export interface Strategy {
  id: string
  accountId: string
  userId?: string | null
  title: string
  status: "pending" | "generating" | "complete" | "failed"
  inputs?: Record<string, unknown> | null
  priorities?: string | null
  keyAssets?: string | null
  opportunities?: string | null
  contacts?: string | null
  createdAt: string
}

export const mapStrategy = (row: StrategyRow): Strategy => ({
  id: row.id,
  accountId: row.account_id,
  userId: row.user_id,
  title: row.title,
  status: row.status,
  inputs: row.inputs,
  priorities: row.priorities,
  keyAssets: row.key_assets,
  opportunities: row.opportunities,
  contacts: row.contacts,
  createdAt: row.created_at,
})

export type StrategyListResponse = {
  data: Strategy[]
}

export type StrategyCreateResponse = {
  data: Strategy
}

