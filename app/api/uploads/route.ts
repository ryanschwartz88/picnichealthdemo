import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { createSupabaseServerClient } from "@/lib/auth/supabase-server"

export const runtime = "nodejs"

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "strategy-files"

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_\.]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  const accountId = (formData.get("accountId") as string | null) ?? undefined
  const strategyId = (formData.get("strategyId") as string | null) ?? undefined

  const supabase = createSupabaseServerClient()

  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)
  if (!bucketExists) {
    const createBucketResult = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB default
      allowedMimeTypes: ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    })
    if (createBucketResult.error) {
      console.error("Failed to create storage bucket", createBucketResult.error)
      return NextResponse.json({ error: "Storage bucket not configured" }, { status: 500 })
    }
  }

  const basePath = ["uploads", accountId, strategyId].filter(Boolean).join("/") || "uploads"
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ""
  const fileName = `${Date.now()}-${slugify(file.name.replace(extension, ""))}${extension}`
  const fullPath = `${basePath}/${fileName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadResult = await supabase.storage.from(BUCKET_NAME).upload(fullPath, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadResult.error) {
    console.error("File upload failed", uploadResult.error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath)

  return NextResponse.json({
    data: {
      path: fullPath,
      url: publicUrlData.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      id: randomUUID(),
    },
  })
}
