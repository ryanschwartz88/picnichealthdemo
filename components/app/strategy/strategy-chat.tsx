"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesIcon, Loader2Icon, UploadCloudIcon, LinkIcon } from "lucide-react"
import { useStrategyContext } from "@/lib/context/strategy-context"
import { useStrategies } from "@/lib/hooks/use-strategies"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useStableCallback } from "@/lib/hooks/use-stable-callback"
import { StrategyResults } from "@/components/app/strategy/strategy-results"
import type { Strategy } from "@/types/strategy"
import type { StrategyCreateResponse } from "@/types/strategy"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api/client"

const strategyFormSchema = z.object({
  accountId: z.string().uuid({ message: "Please select an account" }),
  title: z.string().min(1, "Title is required"),
  context: z.string().min(1, "Context is required"),
  focusArea: z.string().optional(),
  customUrl: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), {
      message: "URL must start with http:// or https://",
    }),
  fileUrl: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), {
      message: "File URL must be a valid link",
    }),
  fileName: z.string().optional(),
})

type StrategyFormValues = z.infer<typeof strategyFormSchema>

type FormStatus = "idle" | "validating" | "submitting" | "generating" | "error"

export function StrategyChat() {
  const {
    selectedStrategyId,
    setSelectedStrategyId,
    selectedAccountId,
    setSelectedAccountId,
  } = useStrategyContext()
  const { strategies, mutate } = useStrategies(selectedAccountId ?? undefined)
  const { accounts, isLoading: accountsLoading } = useAccounts()
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [formValues, setFormValues] = useState<StrategyFormValues>({
    accountId: "",
    title: "",
    context: "",
    focusArea: "",
    customUrl: "",
    fileUrl: "",
    fileName: "",
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StrategyFormValues, string>>>({})
  const [formStatus, setFormStatus] = useState<FormStatus>("idle")
  const [activeRun, setActiveRun] = useState<{ strategyId: string; runId: string } | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Determine if we have accounts ready
  useEffect(() => {
    if (accounts.length === 0) {
      if (formValues.accountId !== "") {
        setFormValues((prev) => ({ ...prev, accountId: "" }))
      }
      if (selectedAccountId !== null) {
        setSelectedAccountId(null)
      }
      return
    }

    const fallbackAccountId = accounts[0]?.id ?? null
    const preferredAccountId =
      (selectedAccountId && accounts.some((account) => account.id === selectedAccountId)
        ? selectedAccountId
        : null) ??
      (formValues.accountId && accounts.some((account) => account.id === formValues.accountId)
        ? formValues.accountId
        : null) ??
      fallbackAccountId

    if (!preferredAccountId) {
      return
    }

    if (selectedAccountId !== preferredAccountId) {
      setSelectedAccountId(preferredAccountId)
    }

    if (formValues.accountId !== preferredAccountId) {
      setFormValues((prev) => ({ ...prev, accountId: preferredAccountId }))
    }
  }, [accounts, formValues.accountId, selectedAccountId, setSelectedAccountId])

  useEffect(() => {
    if (!selectedStrategyId) {
      setCurrentStrategy(null)
      setActiveRun(null)
      if (formStatus !== "idle") {
        setFormStatus("idle")
      }
      return
    }

    const strategy = strategies.find((s) => s.id === selectedStrategyId)
    
    // If strategy not in current list, fetch it directly (happens when switching accounts)
    if (!strategy) {
      const fetchStrategy = async () => {
        try {
          const response = await fetch(`/api/strategies?strategyId=${selectedStrategyId}`)
          if (!response.ok) {
            console.error("Failed to fetch strategy")
            return
          }
          const data = await response.json()
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            const fetchedStrategy = data.data[0] as Strategy
            setCurrentStrategy(fetchedStrategy)
            if (fetchedStrategy.accountId !== selectedAccountId) {
              setSelectedAccountId(fetchedStrategy.accountId)
            }
            
            const runId =
              typeof fetchedStrategy.inputs === "object" && fetchedStrategy.inputs !== null
                ? (fetchedStrategy.inputs as Record<string, unknown>).gumloopRunId
                : undefined

            if (fetchedStrategy.status === "generating") {
              if (typeof runId === "string" && runId.length > 0) {
                setActiveRun({ strategyId: fetchedStrategy.id, runId })
              }
              if (formStatus !== "generating") {
                setFormStatus("generating")
              }
            } else {
              setActiveRun(null)
              if (formStatus !== "idle") {
                setFormStatus("idle")
              }
            }
          }
        } catch (error) {
          console.error("Error fetching strategy:", error)
        }
      }
      fetchStrategy()
      return
    }

    setCurrentStrategy(strategy)
    if (strategy.accountId !== selectedAccountId) {
      setSelectedAccountId(strategy.accountId)
    }

    const runId =
      typeof strategy.inputs === "object" && strategy.inputs !== null
        ? (strategy.inputs as Record<string, unknown>).gumloopRunId
        : undefined

    if (strategy.status === "generating") {
      if (typeof runId === "string" && runId.length > 0) {
        setActiveRun((prev) => {
          if (prev?.runId === runId && prev.strategyId === strategy.id) {
            return prev
          }
          return { strategyId: strategy.id, runId }
        })
      }
      if (formStatus !== "generating") {
        setFormStatus("generating")
      }
    } else {
      setActiveRun(null)
      if (formStatus !== "idle") {
        setFormStatus("idle")
      }
    }
  }, [selectedStrategyId, strategies, selectedAccountId, setSelectedAccountId, formStatus])

  useEffect(() => {
    if (!selectedAccountId && accounts.length === 0) {
      return
    }

    if (selectedAccountId && formValues.accountId !== selectedAccountId) {
      setFormValues((prev) => ({ ...prev, accountId: selectedAccountId }))
      return
    }

    if (!selectedAccountId && formValues.accountId) {
      setSelectedAccountId(formValues.accountId)
    }
  }, [selectedAccountId, accounts.length, formValues.accountId, setSelectedAccountId])

  const handleUpload = useStableCallback(async (file: File) => {
    const request = new FormData()
    request.append("file", file)
    if (formValues.accountId) {
      request.append("accountId", formValues.accountId)
    }

    const response = await apiClient.post("uploads", request)
    const uploadData = response as { data: { url: string; name?: string } }
    setFormValues((prev) => ({
      ...prev,
      fileUrl: uploadData.data.url,
      fileName: uploadData.data.name ?? file.name,
    }))
  })

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      // optimistic set while upload happens
      setFormErrors((prev) => ({ ...prev, fileUrl: undefined }))
      try {
        await handleUpload(file)
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : "Failed to upload file")
      } finally {
        event.target.value = ""
      }
    }
  }

  const resetForm = (nextAccountId?: string | null) => {
    const targetAccountId = nextAccountId ?? selectedAccountId ?? accounts[0]?.id ?? ""

    setFormValues({
      accountId: targetAccountId,
      title: "",
      context: "",
      focusArea: "",
      customUrl: "",
      fileUrl: "",
      fileName: "",
    })
    setFormErrors({})
    setSubmissionError(null)
  }

  const validateForm = useMemo(
    () => (values: StrategyFormValues) => {
      const result = strategyFormSchema.safeParse(values)
      if (!result.success) {
        const errors: Partial<Record<keyof StrategyFormValues, string>> = {}
        for (const issue of result.error.issues) {
          const pathKey = issue.path[0] as keyof StrategyFormValues
          if (!errors[pathKey]) {
            errors[pathKey] = issue.message
          }
        }
        return { errors }
      }
      return { data: result.data }
    },
    []
  )

  const handleInputChange = (field: keyof StrategyFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }))
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleAccountChange = (value: string) => {
    setFormValues((prev) => ({ ...prev, accountId: value }))
    setFormErrors((prev) => ({ ...prev, accountId: undefined }))
    setSelectedAccountId(value)
    setSelectedStrategyId(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormStatus("validating")
    setSubmissionError(null)

    const validationResult = validateForm(formValues)
    if ("errors" in validationResult) {
      setFormErrors(validationResult.errors ?? {})
      setFormStatus("error")
      return
    }

    setFormStatus("submitting")

    try {
      const payload = {
        accountId: validationResult.data.accountId,
        title: validationResult.data.title.trim(),
        context: validationResult.data.context,
        focusArea: validationResult.data.focusArea?.trim() || undefined,
        customUrl: validationResult.data.customUrl?.trim() || undefined,
        fileUrl: validationResult.data.fileUrl?.trim() || undefined,
      }

      const response = (await apiClient.post("strategies", payload)) as StrategyCreateResponse

      await mutate(undefined)
      setSelectedStrategyId(response.data.id)
      setSelectedAccountId(response.data.accountId)

      const newRunId =
        typeof response.data.inputs === "object" && response.data.inputs !== null
          ? (response.data.inputs as Record<string, unknown>).gumloopRunId
          : undefined

      if (typeof newRunId === "string" && newRunId.length > 0) {
        setActiveRun({ strategyId: response.data.id, runId: newRunId })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate strategy"
      console.error("Error creating strategy:", error)
      setSubmissionError(message)
      setFormStatus("error")
    }
  }

  const handleRetry = () => {
    setActiveRun(null)
    setFormStatus("idle")
    setSubmissionError(null)
  }

  const isSubmitting = formStatus === "submitting" || formStatus === "generating"

  useEffect(() => {
    if (!activeRun) {
      pollAbortRef.current?.abort()
      pollAbortRef.current = null
      return
    }

    const controller = new AbortController()
    pollAbortRef.current = controller
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      if (controller.signal.aborted) return

      try {
        const response = await fetch(
          `/api/strategies/${activeRun.strategyId}/poll?runId=${encodeURIComponent(activeRun.runId)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Polling failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.state === "DONE") {
          await mutate(undefined)
          setActiveRun(null)
          setFormStatus("idle")
          setSubmissionError(null)
        } else if (data.state === "FAILED" || data.state === "TERMINATED") {
          await mutate(undefined)
          setActiveRun(null)
          setFormStatus("error")
          setSubmissionError(data.error ?? "Strategy generation failed")
        } else {
          timeoutId = setTimeout(poll, 5000)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Strategy polling error", error)
        setActiveRun(null)
        setFormStatus("error")
        setSubmissionError(
          error instanceof Error ? error.message : "Failed to check strategy status"
        )
      }
    }

    poll()

    return () => {
      controller.abort()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [activeRun, mutate])

  if (currentStrategy && currentStrategy.status !== "generating") {
    return (
      <div className="flex h-full flex-col">
        <StrategyResults strategy={currentStrategy} />
      </div>
    )
  }

  if (
    formStatus === "submitting" ||
    formStatus === "generating" ||
    formStatus === "error" ||
    activeRun !== null
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        {formStatus !== "error" && <Loader2Icon className="h-12 w-12 animate-spin text-primary" />}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {formStatus === "error" ? "Strategy Generation Failed" : "Generating Strategy..."}
          </h2>
          <p className="text-muted-foreground">
            {formStatus === "error"
              ? submissionError ?? "Something went wrong while generating the strategy."
              : "This may take a moment while we gather insights."}
          </p>
          {formStatus === "error" && (
            <Button className="mt-4" onClick={handleRetry} variant="outline">
              Start Another Strategy
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="account">
                      Account
                    </label>
                    <Select
                      value={formValues.accountId}
                      onValueChange={handleAccountChange}
                      disabled={isSubmitting || accountsLoading}
                    >
                      <SelectTrigger
                        id="account"
                        className={cn(
                          "w-full justify-between",
                          formErrors.accountId ? "border-destructive focus-visible:outline-destructive" : ""
                        )}
                      >
                        <SelectValue placeholder={accountsLoading ? "Loading accounts..." : "Select account"} />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.accountId && (
                      <p className="text-xs text-destructive">{formErrors.accountId}</p>
                    )}
                    {!formValues.accountId && accounts.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Use the sidebar to create your first account.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Strategy Title
                    </label>
                    <Input
                      id="title"
                      placeholder="e.g., Q4 2025 Oncology Expansion"
                      value={formValues.title}
                      onChange={handleInputChange("title")}
                      disabled={isSubmitting}
                    />
                    {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="context" className="text-sm font-medium">
                    Context & Objectives
                  </label>
                  <Textarea
                    id="context"
                    placeholder="Describe the account landscape, key objectives, obstacles, stakeholders, competitive pressures, evidence needs..."
                    value={formValues.context}
                    onChange={handleInputChange("context")}
                    className="min-h-[180px]"
                    disabled={isSubmitting}
                  />
                  {formErrors.context && <p className="text-xs text-destructive">{formErrors.context}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="focusArea" className="text-sm font-medium">
                      Focus Area (optional)
                    </label>
                    <Input
                      id="focusArea"
                      placeholder="Therapy area, product, or initiative"
                      value={formValues.focusArea}
                      onChange={handleInputChange("focusArea")}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="customUrl" className="text-sm font-medium">
                      Reference URL (optional)
                    </label>
                    <Input
                      id="customUrl"
                      placeholder="https://..."
                      value={formValues.customUrl}
                      onChange={handleInputChange("customUrl")}
                      disabled={isSubmitting}
                    />
                    {formErrors.customUrl && <p className="text-xs text-destructive">{formErrors.customUrl}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Supporting Materials (optional)</label>
                  <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("strategy-file")?.click()}
                          className="w-fit"
                          disabled={isSubmitting}
                        >
                          <UploadCloudIcon className="mr-2 h-4 w-4" /> Upload file
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          or paste a secure link below
                        </span>
                      </div>
                      <input
                        id="strategy-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileInput}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.xlsx"
                        disabled={isSubmitting}
                      />
                      <div className="space-y-1">
                        <label htmlFor="fileUrl" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Or provide a link
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="fileUrl"
                            placeholder="https://..."
                            value={formValues.fileUrl}
                            onChange={handleInputChange("fileUrl")}
                            disabled={isSubmitting}
                          />
                          {formValues.fileName ? (
                            <span className="text-xs text-muted-foreground">{formValues.fileName}</span>
                          ) : null}
                        </div>
                        {formErrors.fileUrl && <p className="text-xs text-destructive">{formErrors.fileUrl}</p>}
                      </div>
                      {formValues.fileUrl && (
                        <a
                          href={formValues.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" /> View uploaded link
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {submissionError && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {submissionError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    accounts.length === 0 ||
                    accountsLoading ||
                    !formValues.accountId
                  }
                >
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Generate Strategy
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

