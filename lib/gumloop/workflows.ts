import type { GumloopStrategyInput, GumloopRunStatus } from "@/lib/gumloop/types"

/**
 * Builds the input payload for Gumloop pipeline
 * @param companyName - The name of the company/account
 * @param context - Additional context for the strategy generation
 */
export const buildGumloopPayload = (
  companyName: string,
  context: string
): GumloopStrategyInput => ({
  company_name: companyName,
  context: context.trim(),
})

/**
 * Maps Gumloop run outputs to database-compatible format
 * @param runStatus - The completed Gumloop run status
 */
export const mapGumloopOutputs = (runStatus: GumloopRunStatus) => {
  const { outputs } = runStatus
  
  return {
    priorities: outputs.Priorities ?? null,
    key_assets: outputs["Key Assets"] ?? null,
    opportunities: outputs.Opportunities ?? null,
    contacts: outputs.Contacts ?? null,
  }
}

/**
 * Determines the strategy status based on Gumloop run state
 */
export const mapGumloopState = (
  state: GumloopRunStatus["state"]
): "pending" | "generating" | "complete" | "failed" => {
  switch (state) {
    case "DONE":
      return "complete"
    case "FAILED":
    case "TERMINATED":
      return "failed"
    case "RUNNING":
      return "generating"
    default:
      return "pending"
  }
}
