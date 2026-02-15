'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UploadResult {
  url: string
}

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Upload failed: ${res.status}`)
      }

      return res.json()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
