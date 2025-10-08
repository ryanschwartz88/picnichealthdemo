"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(1, "Account name is required"),
})

type FormValues = z.infer<typeof formSchema>

interface AccountFormProps {
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting?: boolean
}

export function AccountForm({ onSubmit, isSubmitting }: AccountFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values)
    form.reset()
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Account name"
        {...form.register("name")}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
