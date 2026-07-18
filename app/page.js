'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
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
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

const SIZE_OPTIONS = [256, 512, 1024, 2048]
const FORMAT_OPTIONS = ['png', 'svg']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/jpg']
const ACCEPTED_EXT = ['.png', '.jpg', '.jpeg']

const FAQ_ITEMS = [
  {
    q: 'How do I resize a QR code online for free?',
    a: 'Upload your existing QR code image to QR Resizer, wait a moment for it to be decoded, choose your desired size (up to 2048 pixels) and format (PNG or SVG), and click Download. The whole process is 100% free, requires no signup, and completes in under 30 seconds.',
  },
  {
    q: 'Is QR Resizer really free?',
    a: 'Yes — QR Resizer is completely free with no ads, no watermarks, no signup, and no usage limits. There is no premium tier or hidden paywall. Everything runs in your browser.',
  },
  {
    q: 'Can I make a blurry QR code sharp again?',
    a: 'Yes. QR Resizer does not upscale your original pixels — instead, it decodes the QR content and regenerates a brand-new, mathematically perfect QR code at whatever resolution you choose. This is why a blurry 100×100 pixel screenshot can become a razor-sharp 2048×2048 pixel print-ready image.',
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
    a: 'Four size options are available: 256×256, 512×512, 1024×1024, and 2048×2048 pixels. Most use cases work perfectly at 1024. For high-quality print material, choose 2048 or export as SVG for unlimited scaling.',
  },
  {
    q: 'Will the new QR code still scan?',
    a: 'Yes — because QR Resizer generates a fresh QR from the exact same decoded content using industry-standard encoding at error-correction level H (the highest), the new QR will scan reliably on any smartphone or QR reader, often better than the original.',
  },
  {
    q: 'What kinds of QR codes are supported?',
    a: 'QR Resizer handles standard QR codes containing URLs, plain text, email links, phone numbers, SMS, WiFi credentials, contact cards (vCard), geolocation, and cryptocurrency addresses. The tool auto-detects the type after decoding.',
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
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  const qrTypeInfo = useMemo(() => detectQrType(decodedContent), [decodedContent])

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
      const opts = {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#000000ff', light: '#ffffffff' },
      }
      if (format === 'png') {
        const url = await QRCode.toDataURL(decodedContent, {
          ...opts,
          type: 'image/png',
          width: size,
        })
        setGeneratedUrl(url)
      } else {
        const svgString = await QRCode.toString(decodedContent, {
          ...opts,
          type: 'svg',
          width: size,
        })
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        setGeneratedUrl(url)
      }
    } catch (e) {
      toast.error('Unable to generate download. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [decodedContent, size, format])

  // Auto-generate on success and whenever size/format change.
  useEffect(() => {
    if (status === 'success' && decodedContent) {
      generate()
    }
  }, [status, decodedContent, size, format, generate])

  const downloadFile = () => {
    if (!generatedUrl) return
    const base = sanitizeFilename(decodedContent, 'qr')
    const filename = `qr-${base}-${size}.${format}`
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
            <div className="font-semibold tracking-tight">QR Resizer</div>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">100% Browser</Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button size="sm" onClick={scrollToUpload} className="ml-2">
              Resize QR
            </Button>
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
          <Button size="lg" variant="outline" onClick={() => {
            const el = document.getElementById('how-it-works')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}>
            How it works
          </Button>
        </div>
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
                      {size}px · {format.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="rounded-xl border bg-white p-4 grid place-items-center min-h-[220px] relative overflow-hidden">
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Size</label>
                      <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={String(s)}>{s} × {s} px</SelectItem>
                          ))}
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
            QR Resizer is a free online tool that decodes any existing QR code image and regenerates a clean,
            high-resolution copy in seconds — no signup, no software install, no data ever leaves your browser.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { n: '1', t: 'Upload your QR code', d: 'Drag a PNG, JPG or JPEG QR image (up to 10 MB) into the drop zone above, or click to browse. Even a blurry screenshot or a photo of a printed QR works.' },
            { n: '2', t: 'Automatic decoding', d: 'QR Resizer reads the QR code locally in your browser and shows you the decoded content along with the detected type — URL, WiFi, phone, email, SMS or plain text.' },
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
            and rebuilding it from scratch, drop it into QR Resizer and get a print-ready copy instantly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: 'Print a large poster', d: 'Blow up a QR for a shop window, event banner, or trade-show booth without pixelation.' },
            { t: 'Add to business cards', d: 'Turn a low-resolution vCard QR into a crisp 1024 px PNG that prints sharply at any card size.' },
            { t: 'Restaurant menu QR', d: 'Enhance a blurry menu QR into a scannable, professional-looking code for reprints.' },
            { t: 'Marketing collateral', d: 'Convert a screenshot QR into scalable SVG for brochures, flyers, and packaging.' },
            { t: 'WiFi share cards', d: 'Regenerate a WiFi-connect QR code at higher resolution for guest rooms, offices and cafés.' },
            { t: 'Fix a blurry QR image', d: 'Repair pixelated or low-quality QR screenshots so scanners read them reliably again.' },
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
            <strong className="text-foreground">QR Resizer</strong> is a fast, free online QR code resizer and
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
            <span>QR Resizer · v1.0</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">About</a>
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
