import type { 
  GumloopStrategyInput, 
  GumloopStartPipelineResponse, 
  GumloopRunStatus 
} from "@/lib/gumloop/types"

interface GumloopClientOptions {
  apiKey?: string
  userId?: string
  savedItemId?: string
}

const DEFAULT_API_KEY = process.env.GUMLOOP_API_KEY ?? "2641e51726774bdb9b8e2851689235a1"
const DEFAULT_USER_ID = process.env.GUMLOOP_USER_ID ?? "PLsUgrNrWcQJoQWUyrOkBigki052"
const DEFAULT_SAVED_ITEM_ID = process.env.GUMLOOP_SAVED_ITEM_ID ?? "iSfuAe8d3hxQLtdq7EZBiW"

export class GumloopClient {
  private apiKey: string
  private userId: string
  private savedItemId: string
  private baseUrl = "https://api.gumloop.com/api/v1"

  constructor(options: GumloopClientOptions = {}) {
    this.apiKey = options.apiKey ?? DEFAULT_API_KEY
    this.userId = options.userId ?? DEFAULT_USER_ID
    this.savedItemId = options.savedItemId ?? DEFAULT_SAVED_ITEM_ID
  }

  private buildUrl(path: string, query: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`)

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      }
    })

    if (this.apiKey) {
      url.searchParams.set("api_key", this.apiKey)
    }

    return url.toString()
  }

  /**
   * Starts a Gumloop pipeline with the given inputs
   * @param payload - The input data containing company_name and context
   * @returns The run_id and URL for tracking the pipeline execution
   */
  async startPipeline(payload: GumloopStrategyInput): Promise<GumloopStartPipelineResponse> {
    const url = this.buildUrl("/start_pipeline", {
      user_id: this.userId,
      saved_item_id: this.savedItemId,
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gumloop start_pipeline failed: ${error}`)
    }

    return response.json()
  }

  /**
   * Gets the current status and outputs of a pipeline run
   * @param runId - The run_id returned from startPipeline
   * @returns Current status, outputs, and logs of the pipeline run
   */
  async getRunStatus(runId: string): Promise<GumloopRunStatus> {
    const url = this.buildUrl("/get_pl_run", {
      run_id: runId,
      user_id: this.userId,
    })

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gumloop get_pl_run failed: ${error}`)
    }

    return response.json()
  }

  /**
   * Polls the pipeline run until it completes or fails
   * @param runId - The run_id to poll
   * @param options - Polling configuration
   * @returns The final run status with outputs
   */
  async pollRunStatus(
    runId: string,
    options: {
      maxAttempts?: number
      intervalMs?: number
      onProgress?: (status: GumloopRunStatus) => void
    } = {}
  ): Promise<GumloopRunStatus> {
    const { maxAttempts = 60, intervalMs = 5000, onProgress } = options

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getRunStatus(runId)
      
      if (onProgress) {
        onProgress(status)
      }

      // Check if run is complete
      if (status.state === "DONE" || status.state === "FAILED" || status.state === "TERMINATED") {
        return status
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(`Polling timeout: Pipeline did not complete within ${maxAttempts} attempts`)
  }
}

export const gumloopClient = new GumloopClient()
