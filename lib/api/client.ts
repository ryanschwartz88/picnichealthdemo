import { getApiRoute } from "./endpoints"
import type { ApiRouteKey } from "./endpoints"
import type { ApiEndpoints } from "./types"

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
}

const extractFirstDetailMessage = (details: unknown): string | null => {
  if (!details || typeof details !== "object") return null

  // Handle zod form errors shape
  if (
    "fieldErrors" in details &&
    details.fieldErrors &&
    typeof details.fieldErrors === "object"
  ) {
    const fieldErrors = details.fieldErrors as Record<string, unknown>
    for (const key of Object.keys(fieldErrors)) {
      const value = fieldErrors[key]
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0]
      }
    }
  }

  if ("formErrors" in details && Array.isArray(details.formErrors)) {
    const formErrors = details.formErrors as unknown[]
    const message = formErrors.find((item): item is string => typeof item === "string")
    if (message) return message
  }

  try {
    return JSON.stringify(details)
  } catch (error) {
    return null
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))

    let message = "Request failed"

    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string" && error.message.trim().length > 0) {
        message = error.message
      } else if ("error" in error && typeof error.error === "string" && error.error.trim().length > 0) {
        message = error.error
      } else if ("details" in error) {
        if (typeof error.details === "string" && error.details.trim().length > 0) {
          message = error.details
        } else {
          const detailMessage = extractFirstDetailMessage(error.details)
          if (detailMessage) {
            message = detailMessage
          }
        }
      }
    }

    throw new Error(message)
  }
  return response.json()
}

export const apiClient = {
  get: async <K extends ApiRouteKey>(
    route: K,
    init?: RequestInit
  ): Promise<ApiEndpoints[K]["response"]> => {
    const response = await fetch(getApiRoute(route), {
      method: "GET",
      headers: defaultHeaders,
      ...init,
    })

    return handleResponse<ApiEndpoints[K]["response"]>(response)
  },

  post: async <K extends ApiRouteKey>(
    route: K,
    body: ApiEndpoints[K]["request"],
    init?: RequestInit
  ): Promise<ApiEndpoints[K]["response"]> => {
    const isFormData = body instanceof FormData
    const response = await fetch(getApiRoute(route), {
      method: "POST",
      headers: isFormData ? undefined : defaultHeaders,
      body: isFormData ? body : JSON.stringify(body),
      ...init,
    })

    return handleResponse<ApiEndpoints[K]["response"]>(response)
  },

  put: async <T = unknown>(
    route: ApiRouteKey,
    body: unknown,
    init?: RequestInit
  ): Promise<T> => {
    const response = await fetch(getApiRoute(route), {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(body),
      ...init,
    })

    return handleResponse<T>(response)
  },

  delete: async <T = unknown>(
    route: ApiRouteKey,
    init?: RequestInit
  ): Promise<T> => {
    const response = await fetch(getApiRoute(route), {
      method: "DELETE",
      headers: defaultHeaders,
      ...init,
    })

    return handleResponse<T>(response)
  },
}

