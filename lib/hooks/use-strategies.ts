import useSWR from "swr"
import type { Strategy } from "@/types/strategy"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch strategies")
  }
  const data = await res.json()
  return data.data as Strategy[]
}

export function useStrategies(accountId?: string) {
  const url = accountId ? `/api/strategies?accountId=${accountId}` : "/api/strategies"
  const { data, error, isLoading, mutate } = useSWR<Strategy[]>(url, fetcher)

  return {
    strategies: data ?? [],
    isLoading,
    isError: Boolean(error),
    mutate,
  }
}
