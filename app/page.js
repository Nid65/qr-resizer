'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  Download,
  RefreshCw,
  QrCode,
  Zap,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Link as LinkIcon,
  Mail,
  Phone,
  Wifi,
  Type as TypeIcon,
  MessageSquare,
  FileImage,
  Ruler,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Link from 'next/link'
import { SIZES, PRINT_USES, PRINT_USE_GROUPS, getRecommendation, scanDistanceLabel } from '@/lib/qr-use-cases'
import SizeChart from '@/components/SizeChart'
import RealSizePreview from '@/components/RealSizePreview'

// Default print location for each detected QR type
const DETECTED_TYPE_USE = {
  URL: 'screen',
  Email: 'screen',
  Text: 'screen',
  Crypto: 'screen',
  Phone: 'business-card',
  Contact: 'business-card',
  SMS: 'flyer',
  Location: 'flyer',
  WiFi: 'wifi-sign',
}

const SIZE_OPTIONS = SIZES
const FORMAT_OPTIONS = ['png', 'svg']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/jpg']
const ACCEPTED_EXT = ['.png', '.jpg', '.jpeg']

const FAQ_ITEMS = [
  {
    q: 'What is the smallest scannable QR code size?',
    a: 'The generally accepted minimum is 2 × 2 cm (0.8 × 0.8 inches) when scanned from about 20 cm away. QR Sizer lets you regenerate at exact print sizes — 0.5\", 1\", 2 cm, 2.5 cm, 3 cm, 4 cm, 5 cm, 10 cm and 15 cm — at print-ready resolution so the printed code stays crisp and scannable.',
  },
  {
    q: 'How do I make a QR code the right size for a business card?',
    a: 'Pick 2 × 2 cm or 2.5 × 2.5 cm from the size selector. QR Sizer generates the QR at 300 DPI (~480–600 pixels) which prints sharply at business-card size. For zero pixelation at any size, choose SVG format.',
  },
  {
    q: 'What DPI should a QR code be printed at?',
    a: 'Aim for at least 300 DPI. QR Sizer\u2019s print sizes (2 cm, 2.5 cm, 3 cm, 4 cm, 5 cm) are pre-calculated at 300 DPI so you can drop them into any print layout without doing the math yourself. SVG downloads are resolution-independent and always print sharp.',
  },
  {
    q: 'Can I use SVG for printing QR codes?',
    a: 'Yes — SVG is actually the best format for print because it scales infinitely without any pixelation. When you pick a print size (2 cm, 2.5 cm, etc.), QR Sizer embeds physical centimeter dimensions inside the SVG so your design tool (Illustrator, Figma, Canva, InDesign) shows the exact print size.',
  },
  {
    q: 'How do I resize a QR code online for free?',
    a: 'Upload your existing QR code image to QR Sizer, wait a moment for it to be decoded, choose your desired size (up to 2048 pixels) and format (PNG or SVG), and click Download. The whole process is 100% free, requires no signup, and completes in under 30 seconds.',
  },
  {
    q: 'Is QR Sizer really free?',
    a: 'Yes — QR Sizer is completely free with no ads, no watermarks, no signup, and no usage limits. There is no premium tier or hidden paywall. Everything runs in your browser.',
  },
  {
    q: 'Can I make a blurry QR code sharp again?',
    a: 'Yes. QR Sizer does not upscale your original pixels — instead, it decodes the QR content and regenerates a brand-new, mathematically perfect QR code at whatever resolution you choose. This is why a blurry 100×100 pixel screenshot can become a razor-sharp 2048×2048 pixel print-ready image.',
  },
  {
    q: 'Is my QR code data uploaded to a server?',
    a: 'No. Everything — decoding, type detection, and regeneration — happens locally in your browser using JavaScript. Your QR image and its decoded content never leave your device. We do not store, log, or transmit any of it.',
  },
  {
    q: 'What image formats can I upload?',
    a: 'You can upload PNG, JPG, or JPEG images up to 10 MB. Screenshots, photos of printed QR codes, and downloaded QR images all work. HEIC, GIF, PDF, and SVG uploads are not supported in this version.',
  },
  {
    q: 'PNG or SVG — which format should I choose?',
    a: 'Choose PNG for social media, websites, screens, and most printing needs. Choose SVG when you need infinite scalability without any quality loss — ideal for large banners, packaging, business cards, and any print material where you may resize later.',
  },
  {
    q: 'What sizes can I export?',
    a: 'Two categories: Digital (256, 512, 1024, or 2048 pixels for screens, social media, and websites) and Print (0.5\", 1\", 2, 2.5, 3, 4, 5, 10 or 15 cm for business cards, labels, menus, flyers, posters and signs). Pick where you will print it and QR Sizer recommends the right size automatically. For unlimited scaling, export as SVG.',
  },
  {
    q: 'Will the new QR code still scan?',
    a: 'Yes — because QR Sizer generates a fresh QR from the exact same decoded content using industry-standard encoding at error-correction level H (the highest), the new QR will scan reliably on any smartphone or QR reader, often better than the original.',
  },
  {
    q: 'What kinds of QR codes are supported?',
    a: 'QR Sizer handles standard QR codes containing URLs, plain text, email links, phone numbers, SMS, WiFi credentials, contact cards (vCard), geolocation, and cryptocurrency addresses. The tool auto-detects the type after decoding.',
  },
]

function detectQrType(data) {
  if (!data) return { type: 'Unknown', icon: TypeIcon }
  const s = data.trim()
  const lower = s.toLowerCase()
  if (/^https?:\/\//i.test(s)) return { type: 'URL', icon: LinkIcon }
  if (lower.startsWith('mailto:')) return { type: 'Email', icon: Mail }
  if (lower.startsWith('tel:')) return { type: 'Phone', icon: Phone }
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) return { type: 'SMS', icon: MessageSquare }
  if (s.startsWith('WIFI:')) return { type: 'WiFi', icon: Wifi }
  if (lower.startsWith('bitcoin:') || lower.startsWith('ethereum:')) return { type: 'Crypto', icon: TypeIcon }
  if (lower.startsWith('geo:')) return { type: 'Location', icon: TypeIcon }
  if (s.startsWith('BEGIN:VCARD')) return { type: 'Contact', icon: TypeIcon }
  return { type: 'Text', icon: TypeIcon }
}

function sanitizeFilename(str, fallback = 'qr') {
  if (!str) return fallback
  return (
    str
      .replace(/^https?:\/\//i, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || fallback
  )
}

export default function App() {
  const [status, setStatus] = useState('idle') // idle | reading | decoding | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [decodedContent, setDecodedContent] = useState('')
  const [size, setSize] = useState(1024)
  const [format, setFormat] = useState('png')
  const [bgTransparent, setBgTransparent] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  const qrTypeInfo = useMemo(() => detectQrType(decodedContent), [decodedContent])

  // ---- Use-case based size recommendation
  const [printUse, setPrintUse] = useState('screen')
  const [useAutoPicked, setUseAutoPicked] = useState(true)
  const [realOpen, setRealOpen] = useState(false)
  const recommendation = useMemo(
    () => getRecommendation(printUse, decodedContent.length),
    [printUse, decodedContent.length]
  )
  const applyUse = (useId, auto = false) => {
    setPrintUse(useId)
    setUseAutoPicked(auto)
    const rec = getRecommendation(useId, decodedContent.length)
    if (rec) {
      setSize(rec.sizeId)
      if (rec.format) setFormat(rec.format)
    }
  }
  // Auto-select a print location from the decoded QR type
  useEffect(() => {
    if (!decodedContent) return
    applyUse(DETECTED_TYPE_USE[qrTypeInfo.type] || 'screen', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedContent])
  const isRecommendedApplied = recommendation
    ? size === recommendation.sizeId && (!recommendation.format || format === recommendation.format)
    : false

  const resetAll = () => {
    setStatus('idle')
    setErrorMsg('')
    setPreviewUrl('')
    setDecodedContent('')
    setGeneratedUrl('')
    setFileName('')
  }

  const validateFile = (file) => {
    if (!file) return 'No file selected.'
    const nameLower = (file.name || '').toLowerCase()
    const extOk = ACCEPTED_EXT.some((e) => nameLower.endsWith(e))
    const mimeOk = ACCEPTED_MIME.includes(file.type)
    if (!extOk && !mimeOk) {
      return 'Unsupported file type. Please upload PNG, JPG or JPEG.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Maximum upload size is 10 MB.'
    }
    return null
  }

  const readImageBitmap = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => resolve({ img, url })
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('The uploaded image cannot be read. Try another image.'))
      }
      img.src = url
    })

  const decodeQrFromImage = (img) => {
    // Try a few scales in case source is very small or very large.
    const scales = [1, 0.75, 1.5, 2, 0.5]
    for (const scale of scales) {
      const w = Math.max(64, Math.round(img.naturalWidth * scale))
      const h = Math.max(64, Math.round(img.naturalHeight * scale))
      if (w > 4096 || h > 4096) continue
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) continue
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      })
      if (code && code.data) return code
    }
    return null
  }

  const handleFile = useCallback(async (file) => {
    setErrorMsg('')
    setGeneratedUrl('')
    const validationErr = validateFile(file)
    if (validationErr) {
      setStatus('error')
      setErrorMsg(validationErr)
      toast.error(validationErr)
      return
    }
    setFileName(file.name)
    setStatus('reading')
    try {
      const { img, url } = await readImageBitmap(file)
      setPreviewUrl(url)
      setStatus('decoding')
      // Give React a beat to render preview + spinner.
      await new Promise((r) => setTimeout(r, 30))
      const code = decodeQrFromImage(img)
      if (!code || !code.data) {
        setStatus('error')
        setErrorMsg('No QR code detected. Try a clearer image.')
        toast.error('No QR code detected')
        return
      }
      setDecodedContent(code.data)
      setStatus('success')
      toast.success('QR decoded successfully')
    } catch (e) {
      setStatus('error')
      const msg = e?.message || 'The uploaded image cannot be read. Try another image.'
      setErrorMsg(msg)
      toast.error(msg)
    }
  }, [])

  const onInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const generate = useCallback(async () => {
    if (!decodedContent) return
    setGenerating(true)
    setGeneratedUrl('')
    try {
      const light = bgTransparent ? '#00000000' : '#ffffffff'
      const opts = {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#000000ff', light },
      }
      if (format === 'png') {
        const url = await QRCode.toDataURL(decodedContent, {
          ...opts,
          type: 'image/png',
          width: size,
        })
        setGeneratedUrl(url)
      } else {
        let svgString = await QRCode.toString(decodedContent, {
          ...opts,
          type: 'svg',
          width: size,
        })
        if (bgTransparent) {
          svgString = svgString
            .replace(/(<rect[^>]*fill=")#00000000("[^>]*\/>)/i, '$1none$2')
            .replace(/(<path[^>]*fill=")#00000000("[^>]*\/>)/gi, '$1none$2')
        }
        // If a print size is chosen, embed physical cm dimensions in the SVG
        const opt = SIZE_OPTIONS.find((s) => s.id === size)
        if (opt?.group === 'print') {
          svgString = svgString
            .replace(/width="\d+(?:\.\d+)?"/, `width="${opt.cm}cm"`)
            .replace(/height="\d+(?:\.\d+)?"/, `height="${opt.cm}cm"`)
        }
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        setGeneratedUrl(url)
      }
    } catch (e) {
      toast.error('Unable to generate download. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [decodedContent, size, format, bgTransparent])

  // Auto-generate on success and whenever size/format/bg change.
  useEffect(() => {
    if (status === 'success' && decodedContent) {
      generate()
    }
  }, [status, decodedContent, size, format, bgTransparent, generate])

  const downloadFile = () => {
    if (!generatedUrl) return
    const base = sanitizeFilename(decodedContent, 'qr')
    const opt = SIZE_OPTIONS.find((s) => s.id === size)
    const sizePart = opt?.group === 'print' ? `${String(opt.cm).replace('.', '-')}cm` : `${size}px`
    const filename = `qr-${base}-${sizePart}.${format}`
    const a = document.createElement('a')
    a.href = generatedUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Download started')
  }

  const TypeIconComp = qrTypeInfo.icon

  const scrollToUpload = () => {
    const el = document.getElementById('upload')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="font-semibold tracking-tight">QR Sizer</div>
              <div className="text-[10px] text-muted-foreground hidden sm:block">Create · Optimise · Share</div>
            </div>
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex">100% Browser</Badge>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="/create"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Create QR
            </a>
            <a
              href="/create/bulk"
              className="hidden sm:inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Bulk
            </a>
            <a
              href="#upload"
              onClick={(e) => { e.preventDefault(); scrollToUpload() }}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 h-9 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Resize QR
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-14 pb-8 md:pt-20 md:pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Regenerate blurry QR codes into crisp, print-ready versions
        </div>
        <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
          QR <span className="text-primary">Resizer</span>
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Upload any QR code and regenerate a clean, high-resolution version in seconds.
          Everything runs privately in your browser — no uploads, no accounts.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="lg" onClick={scrollToUpload}>
            <Upload className="mr-2 h-4 w-4" /> Resize QR
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/create">
              <Sparkles className="mr-2 h-4 w-4" /> Create QR
            </a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Need to build a new QR from scratch?{' '}
          <a href="/create" className="underline underline-offset-2 hover:text-foreground">Generate a QR code with logo</a>{' '}·{' '}
          <a href="/create/bulk" className="underline underline-offset-2 hover:text-foreground">Generate QR codes in bulk from Excel</a>{' '}·{' '}
          <a href="/qr-size-guide" className="underline underline-offset-2 hover:text-foreground">QR code size guide</a>
        </p>
      </section>

      {/* Upload / Workspace */}
      <section id="upload" className="container mx-auto px-4 pb-12">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 md:p-8">
            {status === 'idle' && (
              <DropZone
                dragOver={dragOver}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onBrowse={() => fileInputRef.current?.click()}
              />
            )}

            {(status === 'reading' || status === 'decoding') && (
              <div className="py-16 grid place-items-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="mt-4 font-medium">
                  {status === 'reading' ? 'Reading image…' : 'Decoding QR…'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">This usually takes under 2 seconds</div>
              </div>
            )}

            {status === 'error' && (
              <div className="py-14 grid place-items-center text-center">
                <div className="h-12 w-12 rounded-full bg-destructive/10 grid place-items-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="mt-4 font-semibold text-lg">Couldn&apos;t decode this image</div>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{errorMsg || 'Please upload a clearer image.'}</p>
                <div className="mt-5 flex gap-2">
                  <Button onClick={() => { resetAll(); }} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try again
                  </Button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left: Original + decoded info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Original</div>
                    <Badge variant="outline" className="gap-1">
                      <FileImage className="h-3 w-3" />
                      {fileName || 'uploaded.png'}
                    </Badge>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4 grid place-items-center min-h-[220px]">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Uploaded QR" className="max-h-64 object-contain" />
                    ) : null}
                  </div>

                  <div className="rounded-xl border p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Decoded successfully</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <TypeIconComp className="h-3.5 w-3.5" />
                      Detected type: <Badge variant="secondary" className="ml-1">{qrTypeInfo.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Content</div>
                    <div className="rounded-md bg-muted/60 p-3 text-sm break-all font-mono max-h-40 overflow-auto">
                      {decodedContent}
                    </div>
                  </div>
                </div>

                {/* Right: Regenerated + controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Resized</div>
                    <Badge className="gap-1" variant="secondary">
                      <Sparkles className="h-3 w-3" />
                      {(() => {
                        const opt = SIZE_OPTIONS.find((s) => s.id === size)
                        return opt?.group === 'print'
                          ? `${opt.cm}cm · ${format.toUpperCase()}`
                          : `${size}px · ${format.toUpperCase()}`
                      })()}
                    </Badge>
                  </div>
                  <div
                    className="rounded-xl border p-4 grid place-items-center min-h-[220px] relative overflow-hidden"
                    style={bgTransparent ? {
                      backgroundImage:
                        'linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
                      backgroundColor: '#f4f4f5',
                    } : { background: '#ffffff' }}
                  >
                    {generating && (
                      <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    {generatedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={generatedUrl} alt="Resized QR" className="max-h-64 object-contain" />
                    ) : (
                      <div className="text-sm text-muted-foreground">Generating…</div>
                    )}
                  </div>

                  {/* Real-size preview */}
                  {(() => {
                    const opt = SIZE_OPTIONS.find((s) => s.id === size)
                    const isPrint = opt?.group === 'print'
                    return (
                      <>
                        <Button variant="outline" className="w-full" disabled={!generatedUrl || !isPrint} onClick={() => setRealOpen(true)} data-testid="real-size-btn">
                          <Ruler className="mr-2 h-4 w-4" />
                          {isPrint ? `See it at real size (${opt.cm} × ${opt.cm} cm) next to a card or phone` : 'Real-size preview — pick a print size below'}
                        </Button>
                        {isPrint && (
                          <RealSizePreview
                            open={realOpen}
                            onOpenChange={setRealOpen}
                            imageUrl={generatedUrl}
                            cm={opt.cm}
                            label={opt.label.split('·')[0].trim()}
                            bgTransparent={bgTransparent}
                          />
                        )}
                      </>
                    )
                  })()}

                  {/* Use-case picker + recommendation */}
                  <div className="rounded-lg border p-3 space-y-3 bg-muted/20" data-testid="use-case-panel">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Where will you print or share this?</label>
                      <Select value={printUse} onValueChange={(v) => applyUse(v, false)}>
                        <SelectTrigger data-testid="use-case-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRINT_USE_GROUPS.map((g) => (
                            <SelectGroup key={g}>
                              <SelectLabel>{g}</SelectLabel>
                              {PRINT_USES.filter((u) => u.group === g).map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {useAutoPicked && (
                      <div className="-mt-1 text-[11px] text-muted-foreground flex items-center gap-1" data-testid="use-auto-note">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Picked for you because we detected a <strong className="text-foreground font-medium">{qrTypeInfo.type}</strong> QR — change it anytime.
                      </div>
                    )}
                    {recommendation && (
                      <div className="rounded-md border border-primary/20 bg-background p-3 text-xs space-y-2" data-testid="size-recommendation">
                        <div className="flex items-start gap-2">
                          <Ruler className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <div className="text-foreground">
                              Our recommendation:{' '}
                              <strong className="text-primary">
                                {recommendation.size?.label?.split('·')[0].trim()}
                                {recommendation.format ? ` · ${recommendation.format.toUpperCase()}` : ''}
                              </strong>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {recommendation.use.friendly || recommendation.use.why}
                              {recommendation.bumped && ' Your QR holds quite a bit of information, so we went one size up to keep it easy to scan.'}
                            </p>
                          </div>
                          {isRecommendedApplied ? (
                            <Badge variant="secondary" className="gap-1 shrink-0" data-testid="recommended-applied">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Applied
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => applyUse(printUse, useAutoPicked)} data-testid="apply-recommended">
                              Use recommended
                            </Button>
                          )}
                        </div>
                        {!isRecommendedApplied && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 pl-6">
                            You’ve picked a different size — that’s fine! Just test-scan a print before ordering in bulk.
                          </div>
                        )}
                        <div className="flex items-center justify-between pl-6 pt-1 border-t border-border/60">
                          <span className="text-[11px] text-muted-foreground pt-1.5">Scan distance: {recommendation.use.distance}</span>
                          <Link
                            href={recommendation.use.guide ? `/qr-size-guide#use-case-${recommendation.use.guide}` : '/qr-size-guide'}
                            className="text-[11px] font-medium text-primary hover:underline underline-offset-2 pt-1.5"
                            data-testid="learn-more-size-guide"
                          >
                            Learn more in our Size Guide →
                          </Link>
                        </div>
                      </div>
                    )}
                    <SizeChart activeUseId={printUse} onSelect={(id) => applyUse(id, false)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Size</label>
                      <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Digital (pixels)</SelectLabel>
                            {SIZE_OPTIONS.filter((s) => s.group === 'digital').map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.label}{recommendation?.sizeId === s.id ? '  ★ Recommended' : ''}</SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Print (300+ DPI · print-ready)</SelectLabel>
                            {SIZE_OPTIONS.filter((s) => s.group === 'print').map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.label}{recommendation?.sizeId === s.id ? '  ★ Recommended' : ''}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Format</label>
                      <Select value={format} onValueChange={(v) => setFormat(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMAT_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(() => {
                    const opt = SIZE_OPTIONS.find((s) => s.id === size)
                    if (opt?.group === 'print') {
                      return (
                        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-foreground/80">
                          <div className="font-medium mb-1">Print-ready at {opt.cm} × {opt.cm} cm</div>
                          Scans reliably from up to <strong>~{scanDistanceLabel(opt.cm)}</strong> away (10:1 rule). For best print sharpness choose SVG — it scales without pixelation and includes physical cm units.
                        </div>
                      )
                    }
                    return null
                  })()}

                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bgTransparent}
                      onChange={(e) => setBgTransparent(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Transparent background <span className="text-xs">(no white square around the QR)</span></span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1" size="lg" onClick={downloadFile} disabled={!generatedUrl || generating}>
                      <Download className="mr-2 h-4 w-4" /> Download Resized QR
                    </Button>
                    <Button variant="outline" size="lg" onClick={resetAll}>
                      <RefreshCw className="mr-2 h-4 w-4" /> New
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
              onChange={onInputChange}
            />
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Built for speed and privacy</h2>
          <p className="text-muted-foreground mt-2">No accounts. No servers. Just clean QR codes.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="Lightning fast"
            desc="Decoding and regeneration typically complete in under 2 seconds, right in your browser."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Fully private"
            desc="Your image never leaves your device. All processing happens locally — no uploads."
          />
          <FeatureCard
            icon={Sparkles}
            title="Print ready"
            desc="Export up to 2048×2048 PNG or crisp, infinitely-scalable SVG for any use case."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How to resize a QR code online</h2>
          <p className="text-muted-foreground mt-3">
            QR Sizer is a free online tool that decodes any existing QR code image and regenerates a clean,
            high-resolution copy in seconds — no signup, no software install, no data ever leaves your browser.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { n: '1', t: 'Upload your QR code', d: 'Drag a PNG, JPG or JPEG QR image (up to 10 MB) into the drop zone above, or click to browse. Even a blurry screenshot or a photo of a printed QR works.' },
            { n: '2', t: 'Automatic decoding', d: 'QR Sizer reads the QR code locally in your browser and shows you the decoded content along with the detected type — URL, WiFi, phone, email, SMS or plain text.' },
            { n: '3', t: 'Pick size & format', d: 'Choose an output size (256, 512, 1024, or 2048 pixels) and format (PNG or SVG). SVG scales infinitely without quality loss — perfect for large prints.' },
            { n: '4', t: 'Download the new QR', d: 'Get a freshly generated, pixel-perfect QR code ready for business cards, posters, packaging, menus, flyers or anywhere else you need a high-resolution QR.' },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border/70 bg-card p-5">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold mb-3">
                {s.n}
              </div>
              <h3 className="font-semibold mb-1">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">When to use a free QR code resizer</h2>
          <p className="text-muted-foreground mt-3">
            You already have a QR code, but it&apos;s the wrong size or too blurry. Instead of hunting down the original URL
            and rebuilding it from scratch, drop it into QR Sizer and get a print-ready copy instantly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: 'Business cards (2–3 cm)', d: 'Regenerate a small, sharp QR sized exactly for business cards — 2×2 cm or 2.5×2.5 cm — that still scans reliably from arm\u2019s length.' },
            { t: 'Product labels & stickers', d: 'Print micro QRs on packaging, product labels, hangtags, and small stickers at 2 × 2 cm without losing scannability.' },
            { t: 'Print a large poster', d: 'Blow up a QR for a shop window, event banner, or trade-show booth without pixelation.' },
            { t: 'Restaurant menu QR', d: 'Enhance a blurry menu QR into a scannable, professional-looking code for reprints and takeaway bags.' },
            { t: 'Marketing collateral', d: 'Convert a screenshot QR into scalable SVG for brochures, flyers, and packaging.' },
            { t: 'WiFi share cards', d: 'Regenerate a WiFi-connect QR code at higher resolution for guest rooms, offices and cafés.' },
            { t: 'Add to business cards', d: 'Turn a low-resolution vCard QR into a crisp 2.5 × 2.5 cm print at 300 DPI that scans perfectly at card size.' },
            { t: 'Fix a blurry QR image', d: 'Repair pixelated or low-quality QR screenshots so scanners read them reliably again.' },
            { t: 'Event & wedding invites', d: 'Add a QR to printed invites at 2.5–3 cm so guests can scan for maps, RSVPs, or wedding registry links.' },
          ].map((u) => (
            <div key={u.t} className="rounded-xl border border-border/70 bg-card p-5">
              <h3 className="font-semibold mb-1">{u.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-3">Everything you need to know about resizing QR codes online.</p>
        </div>
        <div className="max-w-3xl mx-auto grid gap-4">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/70 bg-card p-5 open:shadow-sm">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-muted-foreground text-lg group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* SEO-friendly footer content */}
      <section className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">QR Sizer</strong> is a fast, free online QR code resizer and
            regenerator. Upload any existing QR code image — whether it&apos;s a blurry screenshot, a low-resolution
            picture, or a photo of a printed QR — and instantly get a crisp new version at up to 2048×2048 pixels in
            PNG or scalable SVG format. Because everything runs locally in your browser, your QR content is never
            uploaded to a server, never stored, and never shared. No signup, no ads, no watermarks.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Sizer · v1.0</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="hover:text-foreground">Resize a QR</a>
            <a href="/create" className="hover:text-foreground">Create a QR</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DropZone({ dragOver, onDrop, onDragOver, onDragLeave, onBrowse }) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={[
        'rounded-2xl border-2 border-dashed p-10 md:p-14 text-center transition-all cursor-pointer select-none',
        dragOver
          ? 'border-primary bg-primary/5 scale-[1.005]'
          : 'border-border/70 hover:border-primary/50 hover:bg-muted/30',
      ].join(' ')}
      onClick={onBrowse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onBrowse()
      }}
      aria-label="Upload QR code image"
    >
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center">
        <Upload className="h-6 w-6" />
      </div>
      <div className="mt-4 text-lg font-semibold">Drop your QR image here</div>
      <div className="text-sm text-muted-foreground mt-1">or click to browse from your device</div>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Button size="sm">
          <Upload className="mr-2 h-3.5 w-3.5" /> Browse files
        </Button>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">PNG</Badge>
        <Badge variant="outline">JPG</Badge>
        <Badge variant="outline">JPEG</Badge>
        <span>·</span>
        <span>Up to 10 MB</span>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
      </CardContent>
    </Card>
  )
}
