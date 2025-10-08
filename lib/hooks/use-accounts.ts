import useSWR from "swr"
import { getApiRoute } from "@/lib/api/endpoints"
import type { AccountListResponse } from "@/types/account"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch accounts")
  }
  return res.json()
}

export function useAccounts() {
  const { data, error, isLoading, mutate } = useSWR<AccountListResponse>(
    getApiRoute("accounts"),
    fetcher
  )

  return {
    accounts: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    mutate,
  }
}

