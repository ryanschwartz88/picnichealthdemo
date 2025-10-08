import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatErrorResponse = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return fallback
}

export const buildStrategyInputs = (input: {
  context: string
  focusArea?: string
  customUrl?: string
  fileUrl?: string
}) => ({
  context: input.context,
  focusArea: input.focusArea ?? null,
  customUrl: input.customUrl ?? null,
  fileUrl: input.fileUrl ?? null,
})

export const groupStrategiesByAccount = <T extends { accountId: string }>(
  strategies: T[]
) => {
  const mapping = new Map<string, T[]>()
  for (const strategy of strategies) {
    if (!mapping.has(strategy.accountId)) {
      mapping.set(strategy.accountId, [])
    }
    mapping.get(strategy.accountId)!.push(strategy)
  }
  return mapping
}
