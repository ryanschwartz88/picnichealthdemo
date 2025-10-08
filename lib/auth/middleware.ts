import { NextResponse } from "next/server"

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

export function withAuth(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new NextResponse("Method not allowed", { status: 405 })
    }

    return handler(request)
  }
}

export function requireApiSecret(request: Request) {
  const expectedSecret = process.env.GUMLOOP_WEBHOOK_SECRET
  const receivedSecret = request.headers.get("x-webhook-secret")

  if (!expectedSecret || expectedSecret !== receivedSecret) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  return null
}
