// Input for triggering Gumloop pipeline
export interface GumloopStrategyInput {
  company_name: string
  context: string
}

// Response from start_pipeline endpoint
export interface GumloopStartPipelineResponse {
  run_id: string
  saved_item_id: string
  url: string
}

// Response from get_pl_run endpoint
export interface GumloopRunStatus {
  user_id: string
  state: "RUNNING" | "DONE" | "TERMINATING" | "FAILED" | "TERMINATED"
  outputs: {
    Priorities?: string
    "Key Assets"?: string
    Opportunities?: string
    Contacts?: string
  }
  created_ts: string
  finished_ts: string | null
  log: string[]
  run_id: string
}

// Internal strategy result for database storage
export interface GumloopStrategyResult {
  status: "pending" | "generating" | "complete" | "failed"
  priorities?: string | null
  keyAssets?: string | null
  opportunities?: string | null
  contacts?: string | null
}
