import type { AccountCreateResponse, AccountListResponse } from "@/types/account"
import type { StrategyCreateResponse, StrategyListResponse } from "@/types/strategy"

export interface ApiEndpoint<Request = unknown, Response = unknown> {
  method: "GET" | "POST" | "PUT" | "DELETE"
  request?: Request
  response: Response
}

export type ApiEndpointRequest<T> = T extends FormData ? FormData : T

export interface ApiEndpoints {
  accounts: ApiEndpoint<unknown, AccountListResponse | AccountCreateResponse>
  strategies: ApiEndpoint<unknown, StrategyListResponse | StrategyCreateResponse>
  uploads: ApiEndpoint<FormData, { data: { url: string; path: string } }>
  gumloopWebhook: ApiEndpoint<unknown, { data: unknown }>
  health: ApiEndpoint<unknown, { status: string; timestamp: number }>
}

export type ApiRouteConfig = ApiEndpoint[]

