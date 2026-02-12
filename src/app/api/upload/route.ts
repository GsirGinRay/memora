import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { requireAuth } from '@/lib/auth/get-session'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10 MB limit' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const fileName = `${randomUUID()}.${ext}`
    const userDir = join(UPLOAD_DIR, user.id)

    await mkdir(userDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(userDir, fileName), buffer)

    const publicUrl = `/uploads/${user.id}/${fileName}`

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
