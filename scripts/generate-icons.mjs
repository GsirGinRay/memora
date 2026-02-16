import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

function generatePng(size) {
  const channels = 4
  const rawData = []

  for (let y = 0; y < size; y++) {
    rawData.push(0) // PNG filter byte (none)
    for (let x = 0; x < size; x++) {
      const margin = Math.floor(size * 0.08)
      const inIcon = x >= margin && x < size - margin && y >= margin && y < size - margin

      if (inIcon) {
        const lx = (x - margin) / (size - margin * 2)
        const ly = (y - margin) / (size - margin * 2)

        let isLetter = false
        // "M" shape
        if (ly >= 0.2 && ly <= 0.8) {
          if (lx >= 0.1 && lx <= 0.24) isLetter = true
          if (lx >= 0.76 && lx <= 0.9) isLetter = true
        }
        if (ly >= lx * 0.7 + 0.05 && ly <= lx * 0.7 + 0.18 && lx >= 0.18 && lx <= 0.5) isLetter = true
        if (ly >= (1 - lx) * 0.7 + 0.05 && ly <= (1 - lx) * 0.7 + 0.18 && lx >= 0.5 && lx <= 0.82) isLetter = true

        if (isLetter) {
          rawData.push(255, 255, 255, 255) // white letter
        } else {
          rawData.push(99, 102, 241, 255)  // #6366f1 indigo bg
        }
      } else {
        rawData.push(0, 0, 0, 0) // transparent
      }
    }
  }

  const buf = Buffer.from(rawData)
  const compressed = deflateSync(buf)
  const chunks = []

  // PNG Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // color type RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace
  chunks.push(createChunk('IHDR', ihdr))

  // IDAT
  chunks.push(createChunk('IDAT', compressed))

  // IEND
  chunks.push(createChunk('IEND', Buffer.alloc(0)))

  return Buffer.concat(chunks)
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)

  return Buffer.concat([length, typeBuffer, data, crcBuf])
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const png = generatePng(size)
  writeFileSync(join(outDir, `icon-${size}.png`), png)
  console.log(`Generated icon-${size}.png (${png.length} bytes)`)
}
