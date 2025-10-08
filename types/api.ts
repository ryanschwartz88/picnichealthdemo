import type { Account, AccountCreateResponse, AccountListResponse } from "./account";
import type {
  Strategy,
  StrategyCreateResponse,
  StrategyListResponse,
} from "./strategy";

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GenerateStrategyRequest {
  accountName: string;
  title: string;
  customURL?: string;
  focusArea?: string;
}

export interface GenerateStrategyResponse {
  strategyId: string;
  status: "generating" | "failed" | "complete";
}

export interface GumloopWebhookPayload {
  strategyId: string;
  priorities?: Record<string, unknown>;
  keyAssets?: Record<string, unknown>;
  opportunities?: Record<string, unknown>;
  contacts?: Record<string, unknown>;
  status?: "complete" | "failed";
}

export type AccountApiResponse =
  | AccountListResponse
  | AccountCreateResponse
  | ErrorResponse;

export type StrategyApiResponse =
  | StrategyListResponse
  | StrategyCreateResponse
  | GenerateStrategyResponse
  | ErrorResponse;

export type ApiResponse<T = unknown> = T | ErrorResponse;

export interface ApiRouteContext {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}

export interface ApiRequest<T = unknown> {
  json(): Promise<T>;
}

export interface ApiHandlerOptions<T = unknown> {
  request: ApiRequest<T>;
  context: ApiRouteContext;
}

export type ApiHandler<TInput = unknown, TOutput = unknown> = (
  options: ApiHandlerOptions<TInput>
) => Promise<Response | ApiResponse<TOutput>>;

export interface ApiEndpoint<TInput = unknown, TOutput = unknown> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: ApiHandler<TInput, TOutput>;
}

