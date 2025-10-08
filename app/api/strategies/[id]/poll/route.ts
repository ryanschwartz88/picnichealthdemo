import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/auth/supabase-server"
import { gumloopClient } from "@/lib/gumloop/client"
import { mapGumloopOutputs, mapGumloopState } from "@/lib/gumloop/workflows"
import { StrategyRowSchema, mapStrategy } from "@/types/strategy"
import type { StrategyRow, StrategyUpdate } from "@/lib/database/schema"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const runId = searchParams.get("runId")

  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  try {
    // Get current run status from Gumloop
    const runStatus = await gumloopClient.getRunStatus(runId)
    
    // Map the state to our status
    const status = mapGumloopState(runStatus.state)

    // If the run is complete, update the database with the outputs
    if (runStatus.state === "DONE") {
      const outputs = mapGumloopOutputs(runStatus)

      const updatePayload: StrategyUpdate = {
        status,
        ...outputs,
      }

      const updateResult = await supabase
        .from("strategies")
        .update(updatePayload)
        .eq("id", params.id)
        .select<"*", StrategyRow>("*")
        .single()

      if (updateResult.error) {
        console.error("Failed to update strategy with outputs", updateResult.error)
        return NextResponse.json(
          { error: "Failed to update strategy" },
          { status: 500 }
        )
      }

      const row = StrategyRowSchema.parse(updateResult.data)
      return NextResponse.json({
        status,
        state: runStatus.state,
        data: mapStrategy(row),
      })
    }

    // If failed or terminated, update status
    if (runStatus.state === "FAILED" || runStatus.state === "TERMINATED") {
      const updateResult = await supabase
        .from("strategies")
        .update({ status })
        .eq("id", params.id)
        .select<"*", StrategyRow>("*")
        .single()

      if (updateResult.error) {
        console.error("Failed to update strategy status", updateResult.error)
      }

      return NextResponse.json({
        status,
        state: runStatus.state,
        error: "Pipeline failed or was terminated",
        log: runStatus.log,
      })
    }

    // Still running, just return status
    return NextResponse.json({
      status,
      state: runStatus.state,
      log: runStatus.log.slice(-5), // Return last 5 log entries
    })
  } catch (error) {
    console.error("Failed to poll Gumloop status", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to poll status",
      },
      { status: 500 }
    )
  }
}

