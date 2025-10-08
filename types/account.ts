import { z } from "zod"

export const AccountRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Account name is required"),
  created_at: z.string(),
})

export type AccountRow = z.infer<typeof AccountRowSchema>

export interface Account {
  id: string
  name: string
  createdAt: string
}

export const mapAccount = (row: AccountRow): Account => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
})

export type AccountListResponse = {
  data: Account[]
}

export type AccountCreateResponse = {
  data: Account
}

