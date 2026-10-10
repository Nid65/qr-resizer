'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast, Toaster } from 'sonner'
import {
  QrCode,
  Link as LinkIcon,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  UserSquare2,
  IdCard,
  UtensilsCrossed,
  Package,
  Type as TypeIcon,
  Download,
  Upload,
  Trash2,
  Palette,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2,
  Ruler,
  CheckCircle2,
} from 'lucide-react'
import {
  SIZES,
  PRINT_USES,
  PRINT_USE_GROUPS,
  TYPE_DEFAULT_USE,
  getRecommendation,
  scanDistanceLabel,
} from '@/lib/qr-use-cases'

const FORMATS = ['png', 'svg']
const EC_LEVELS = [
  { value: 'L', label: 'L — Low (~7%)' },
  { value: 'M', label: 'M — Medium (~15%)' },
  { value: 'Q', label: 'Q — Quartile (~25%)' },
  { value: 'H', label: 'H — High (~30%) — required for logos' },
]

const TYPES = [
  { value: 'url', label: 'URL / Link', short: 'URL', icon: LinkIcon },
  { value: 'text', label: 'Plain Text', short: 'Text', icon: TypeIcon },
  { value: 'email', label: 'Email', short: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Number', short: 'Phone', icon: Phone },
  { value: 'sms', label: 'SMS Message', short: 'SMS', icon: MessageSquare },
  { value: 'wifi', label: 'WiFi Network', short: 'WiFi', icon: Wifi },
  { value: 'vcard', label: 'Business Card', short: 'Business Card', icon: IdCard },
  { value: 'menu', label: 'Food Menu', short: 'Food Menu', icon: UtensilsCrossed },
]

function escapeWifi(s) {
  return (s || '').replace(/([\\;,":])/g, '\\$1')
}

function buildEncodedString(type, data) {
  switch (type) {
    case 'url': {
      let u = (data.url || '').trim()
      if (!u) return ''
      if (!/^[a-z]+:\/\//i.test(u) && !u.startsWith('mailto:') && !u.startsWith('tel:')) {
        u = 'https://' + u
      }
      return u
    }
    case 'text':
      return (data.text || '').trim()
    case 'email': {
      const { to, subject, body } = data.email
      if (!to) return ''
      const params = []
      if (subject) params.push('subject=' + encodeURIComponent(subject))
      if (body) params.push('body=' + encodeURIComponent(body))
      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`
    }
    case 'phone':
      return data.phone ? `tel:${data.phone.replace(/\s+/g, '')}` : ''
    case 'sms': {
      const { phone, message } = data.sms
      if (!phone) return ''
      return `smsto:${phone.replace(/\s+/g, '')}${message ? ':' + message : ''}`
    }
    case 'wifi': {
      const { ssid, password, encryption, hidden } = data.wifi
      if (!ssid) return ''
      return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};${hidden ? 'H:true;' : ''};`
    }
    case 'vcard': {
      const v = data.vcard
      if (!v.name) return ''
      let s = 'BEGIN:VCARD\nVERSION:3.0\n'
      s += `FN:${v.name}\n`
      if (v.org) s += `ORG:${v.org}\n`
      if (v.title) s += `TITLE:${v.title}\n`
      if (v.phone) s += `TEL:${v.phone}\n`
      if (v.email) s += `EMAIL:${v.email}\n`
      if (v.url) s += `URL:${v.url}\n`
      s += 'END:VCARD'
      return s
    }
    case 'menu': {
      let u = (data.menu.url || '').trim()
      if (!u) return ''
      if (!/^[a-z]+:\/\//i.test(u)) u = 'https://' + u
      return u
    }
    default:
      return ''
  }
}

function sanitizeName(s) {
  return (s || 'qr').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'qr'
}

export default function CreatePage() {
  const [type, setType] = useState('url')
  const [data, setData] = useState({
    url: 'https://qr-sizer.com',
    text: '',
    email: { to: '', subject: '', body: '' },
    phone: '',
    sms: { phone: '', message: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    vcard: { name: '', org: '', title: '', phone: '', email: '', url: '' },
    menu: { url: '', restaurant: '' },
  })

  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgTransparent, setBgTransparent] = useState(false)
  const [ecLevel, setEcLevel] = useState('M')
  const [logoDataUrl, setLogoDataUrl] = useState('')
  const [logoName, setLogoName] = useState('')
  const [size, setSize] = useState(1024)
  const [format, setFormat] = useState('png')
  const [caption, setCaption] = useState('')

  const [previewUrl, setPreviewUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const encoded = useMemo(() => buildEncodedString(type, data), [type, data])
  const effectiveEc = logoDataUrl ? 'H' : ecLevel

  // ---- Use-case based size recommendation
  const [printUse, setPrintUse] = useState('auto')
  const activeUseId = printUse === 'auto' ? TYPE_DEFAULT_USE[type] : printUse
  const recommendation = useMemo(
    () => getRecommendation(activeUseId, encoded.length),
    [activeUseId, encoded.length]
  )
  const encodedLenRef = useRef(0)
  encodedLenRef.current = encoded.length
  // Auto-pick the recommended size whenever the use case (or QR type in auto mode) changes.
  // The user can still override the size afterwards.
  useEffect(() => {
    const rec = getRecommendation(activeUseId, encodedLenRef.current)
    if (!rec) return
    setSize(rec.sizeId)
    if (rec.format) setFormat(rec.format)
  }, [activeUseId])
  const applyRecommendation = () => {
    if (!recommendation) return
    setSize(recommendation.sizeId)
    if (recommendation.format) setFormat(recommendation.format)
    toast.success(`Size set to ${recommendation.size?.label?.split('·')[0].trim()}`)
  }
  const isRecommendedApplied = recommendation
    ? size === recommendation.sizeId && (!recommendation.format || format === recommendation.format)
    : false

  const logoInputRef = useRef(null)

  const updateNested = (parent, key, value) => {
    setData((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }))
  }

  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoDataUrl(reader.result)
      setLogoName(file.name)
    }
    reader.onerror = () => toast.error('Could not read the logo file')
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const clearLogo = () => {
    setLogoDataUrl('')
    setLogoName('')
  }

  // Generate preview + downloadable output whenever inputs change.
  useEffect(() => {
    if (!encoded) {
      setPreviewUrl('')
      setDownloadUrl('')
      return
    }
    let cancelled = false
    setBusy(true)

    const run = async () => {
      try {
        const effectiveBg = bgTransparent ? '#00000000' : bgColor
        // Logo needs a solid backdrop to remain scannable, use white if transparent
        const logoBackdrop = bgTransparent ? '#ffffff' : bgColor
        const commonOpts = {
          errorCorrectionLevel: effectiveEc,
          margin: 2,
          color: { dark: fgColor, light: effectiveBg },
        }

        // ---- Preview: always canvas -> PNG data URL (fast)
        const previewCanvas = document.createElement('canvas')
        await QRCode.toCanvas(previewCanvas, encoded, {
          ...commonOpts,
          width: 512,
        })

        if (logoDataUrl) {
          await drawLogoOnCanvas(previewCanvas, logoDataUrl, logoBackdrop)
        }
        const previewWithCaption = caption ? addCaptionToCanvas(previewCanvas, caption, effectiveBg, fgColor) : previewCanvas
        const previewData = previewWithCaption.toDataURL('image/png')
        if (cancelled) return
        setPreviewUrl(previewData)

        // ---- Downloadable output at chosen size + format
        if (format === 'png') {
          const outCanvas = document.createElement('canvas')
          await QRCode.toCanvas(outCanvas, encoded, {
            ...commonOpts,
            width: size,
          })
          if (logoDataUrl) {
            await drawLogoOnCanvas(outCanvas, logoDataUrl, logoBackdrop)
          }
          const outWithCaption = caption ? addCaptionToCanvas(outCanvas, caption, effectiveBg, fgColor) : outCanvas
          const outData = outWithCaption.toDataURL('image/png')
          if (cancelled) return
          setDownloadUrl(outData)
        } else {
          // SVG
          let svg = await QRCode.toString(encoded, {
            ...commonOpts,
            type: 'svg',
            width: size,
          })
          if (bgTransparent) {
            // qrcode still paints a background rect; make it fully transparent
            svg = svg.replace(/(<rect[^>]*fill=")#00000000("[^>]*\/>)/i, '$1none$2')
                     .replace(/(<path[^>]*fill=")#00000000("[^>]*\/>)/gi, '$1none$2')
          }
          if (logoDataUrl) {
            svg = embedLogoInSvg(svg, logoDataUrl, logoBackdrop)
          }
          // If a print size is chosen, embed physical cm dimensions in the SVG
          const opt = SIZES.find((s) => s.id === size)
          if (opt?.group === 'print') {
            svg = svg
              .replace(/width="\d+(?:\.\d+)?"/, `width="${opt.cm}cm"`)
              .replace(/height="\d+(?:\.\d+)?"/, `height="${opt.cm}cm"`)
          }
          const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          if (cancelled) return
          setDownloadUrl(url)
        }
      } catch (err) {
        if (!cancelled) toast.error(err?.message || 'Could not generate QR')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    // Small debounce
    const t = setTimeout(run, 120)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [encoded, effectiveEc, fgColor, bgColor, bgTransparent, logoDataUrl, size, format, caption])

  const download = () => {
    if (!downloadUrl) return
    const opt = SIZES.find((s) => s.id === size)
    const sizePart = opt?.group === 'print' ? `${String(opt.cm).replace('.', '-')}cm` : `${size}px`
    const filename = `qr-${sanitizeName(encoded)}-${sizePart}.${format}`
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Download started')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="font-semibold tracking-tight">QR Sizer</div>
              <div className="text-[10px] text-muted-foreground hidden sm:block">Create · Optimise · Share</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 h-9 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create QR
            </Link>
            <Link
              href="/create/bulk"
              className="hidden sm:inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Bulk
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Resize QR
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-14 pb-6 md:pt-16 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Static QR · Free · Never expires
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Dynamic QR coming soon
          </span>
        </div>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
          Free Static QR Code Generator{' '}
          <span className="text-primary">with Logo</span>
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Create custom QR codes with your logo in the center and your brand colors on the outside. Generate QR codes
          for URLs, WiFi networks, business cards, food menus, and more — all in your browser.
          {' '}<strong className="text-foreground">Static QR codes never expire</strong> and never depend on our server.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Already have a QR image? <Link href="/" className="underline underline-offset-2 hover:text-foreground">Resize an existing QR code</Link>{' '}instead.
        </p>
      </section>

      {/* Workspace */}
      <section className="container mx-auto px-4 pb-14">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-primary" />
            <span>Need to generate <strong>many QRs at once</strong>? Upload an Excel and download all as a ZIP.</span>
          </div>
          <Link href="/create/bulk">
            <Button size="sm" variant="outline">Try Bulk mode →</Button>
          </Link>
        </div>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* LEFT: content + style */}
              <div className="space-y-5">
                {/* Type selector as pill grid */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">What do you want to encode?</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TYPES.map((t) => {
                      const Icon = t.icon
                      const active = type === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setType(t.value)}
                          className={[
                            'flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-all',
                            active
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="leading-tight text-center">{t.short}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dynamic form */}
                <div className="space-y-3">
                  {type === 'url' && (
                    <Field label="URL">
                      <Input
                        placeholder="https://qr-sizer.com"
                        value={data.url}
                        onChange={(e) => setData((p) => ({ ...p, url: e.target.value }))}
                        autoFocus
                      />
                    </Field>
                  )}

                  {type === 'text' && (
                    <Field label="Text">
                      <Textarea
                        placeholder="Type any text here…"
                        rows={4}
                        value={data.text}
                        onChange={(e) => setData((p) => ({ ...p, text: e.target.value }))}
                      />
                    </Field>
                  )}

                  {type === 'email' && (
                    <>
                      <Field label="To">
                        <Input
                          type="email"
                          placeholder="hello@example.com"
                          value={data.email.to}
                          onChange={(e) => updateNested('email', 'to', e.target.value)}
                        />
                      </Field>
                      <Field label="Subject (optional)">
                        <Input
                          value={data.email.subject}
                          onChange={(e) => updateNested('email', 'subject', e.target.value)}
                        />
                      </Field>
                      <Field label="Body (optional)">
                        <Textarea
                          rows={3}
                          value={data.email.body}
                          onChange={(e) => updateNested('email', 'body', e.target.value)}
                        />
                      </Field>
                    </>
                  )}

                  {type === 'phone' && (
                    <Field label="Phone number">
                      <Input
                        type="tel"
                        placeholder="+1 555 123 4567"
                        value={data.phone}
                        onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </Field>
                  )}

                  {type === 'sms' && (
                    <>
                      <Field label="Phone number">
                        <Input
                          type="tel"
                          placeholder="+1 555 123 4567"
                          value={data.sms.phone}
                          onChange={(e) => updateNested('sms', 'phone', e.target.value)}
                        />
                      </Field>
                      <Field label="Message (optional)">
                        <Textarea
                          rows={3}
                          value={data.sms.message}
                          onChange={(e) => updateNested('sms', 'message', e.target.value)}
                        />
                      </Field>
                    </>
                  )}

                  {type === 'wifi' && (
                    <>
                      <Field label="Network name (SSID)">
                        <Input
                          value={data.wifi.ssid}
                          onChange={(e) => updateNested('wifi', 'ssid', e.target.value)}
                        />
                      </Field>
                      <Field label="Password">
                        <Input
                          type="text"
                          value={data.wifi.password}
                          onChange={(e) => updateNested('wifi', 'password', e.target.value)}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Encryption">
                          <Select value={data.wifi.encryption} onValueChange={(v) => updateNested('wifi', 'encryption', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                              <SelectItem value="WEP">WEP</SelectItem>
                              <SelectItem value="nopass">No password</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Hidden network">
                          <div className="flex items-center h-10 px-3 border rounded-md">
                            <input
                              id="hidden"
                              type="checkbox"
                              checked={data.wifi.hidden}
                              onChange={(e) => updateNested('wifi', 'hidden', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="hidden" className="ml-2 text-sm text-muted-foreground">SSID is hidden</label>
                          </div>
                        </Field>
                      </div>
                    </>
                  )}

                  {type === 'vcard' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Full name *">
                          <Input value={data.vcard.name} onChange={(e) => updateNested('vcard', 'name', e.target.value)} placeholder="Jane Doe" />
                        </Field>
                        <Field label="Company">
                          <Input value={data.vcard.org} onChange={(e) => updateNested('vcard', 'org', e.target.value)} />
                        </Field>
                        <Field label="Job title">
                          <Input value={data.vcard.title} onChange={(e) => updateNested('vcard', 'title', e.target.value)} />
                        </Field>
                        <Field label="Phone">
                          <Input type="tel" value={data.vcard.phone} onChange={(e) => updateNested('vcard', 'phone', e.target.value)} />
                        </Field>
                        <Field label="Email">
                          <Input type="email" value={data.vcard.email} onChange={(e) => updateNested('vcard', 'email', e.target.value)} />
                        </Field>
                        <Field label="Website">
                          <Input value={data.vcard.url} onChange={(e) => updateNested('vcard', 'url', e.target.value)} placeholder="https://" />
                        </Field>
                      </div>
                    </>
                  )}

                  {type === 'menu' && (
                    <>
                      <Field label="Restaurant / café name (optional)">
                        <Input
                          placeholder="Bella Trattoria"
                          value={data.menu.restaurant}
                          onChange={(e) => updateNested('menu', 'restaurant', e.target.value)}
                        />
                      </Field>
                      <Field label="Menu link (URL to your online menu, PDF, or website)">
                        <Input
                          placeholder="https://yourrestaurant.com/menu"
                          value={data.menu.url}
                          onChange={(e) => updateNested('menu', 'url', e.target.value)}
                        />
                      </Field>
                      <div className="text-xs text-muted-foreground rounded-md bg-muted/40 p-3">
                        Tip: host your menu PDF on Google Drive, Dropbox or your own site,
                        then paste the public link here. Customers scan the QR and go straight to your menu.
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Style controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4" /> Style
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Foreground">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-10 w-14 rounded-md border border-input cursor-pointer bg-background"
                        />
                        <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Background">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          disabled={bgTransparent}
                          className="h-10 w-14 rounded-md border border-input cursor-pointer bg-background disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <Input value={bgColor} disabled={bgTransparent} onChange={(e) => setBgColor(e.target.value)} />
                      </div>
                    </Field>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bgTransparent}
                      onChange={(e) => setBgTransparent(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Transparent background <span className="text-xs">(great for overlaying on any color)</span></span>
                  </label>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Caption below QR <span className="font-normal">(optional — e.g. &quot;Scan for menu&quot;)</span>
                    </label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value.slice(0, 60))}
                      placeholder="Scan for menu"
                      maxLength={60}
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Rendered under the QR when downloaded. Great for printing an objective or call-to-action next to the code.
                    </p>
                  </div>

                  <Field label={`Error correction${logoDataUrl ? ' (forced to H for logo)' : ''}`}>
                    <Select value={effectiveEc} onValueChange={setEcLevel} disabled={!!logoDataUrl}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EC_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Logo upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-foreground">
                        Add your logo <span className="text-muted-foreground font-normal">(center of the QR)</span>
                      </label>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold uppercase tracking-wide">Free</span>
                    </div>
                    {logoDataUrl ? (
                      <div className="flex items-center gap-3 rounded-md border p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoDataUrl} alt="logo preview" className="h-10 w-10 object-contain rounded bg-muted/30" />
                        <div className="flex-1 text-xs text-muted-foreground truncate">{logoName || 'logo'}</div>
                        <Button size="sm" variant="ghost" onClick={clearLogo}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()} className="w-full border-primary/40 hover:bg-primary/5">
                          <Upload className="mr-2 h-4 w-4" /> Upload logo (PNG, JPG, SVG)
                        </Button>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Most QR generators charge for this. Here it&apos;s always free.
                        </p>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          className="hidden"
                          onChange={onLogoChange}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: preview + export */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Live preview</div>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" /> {(() => {
                      const opt = SIZES.find((s) => s.id === size)
                      return opt?.group === 'print'
                        ? `${opt.cm}cm · ${format.toUpperCase()}`
                        : `${size}px · ${format.toUpperCase()}`
                    })()}
                  </Badge>
                </div>
                <div
                  className="rounded-xl border p-4 grid place-items-center min-h-[300px] relative overflow-hidden"
                  style={bgTransparent ? {
                    backgroundImage:
                      'linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
                    backgroundColor: '#f4f4f5',
                  } : { background: bgColor }}
                >
                  {busy && (
                    <div className="absolute inset-0 grid place-items-center bg-white/50 backdrop-blur-sm z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="QR code preview" className="max-h-72 object-contain" />
                  ) : (
                    <div className="text-sm text-muted-foreground text-center px-4">
                      Fill in the fields to preview your QR code.
                    </div>
                  )}
                </div>

                {/* Use-case picker + recommendation */}
                <div className="rounded-lg border p-3 space-y-3 bg-muted/20" data-testid="use-case-panel">
                  <Field label="Where will you print or share this?">
                    <Select value={printUse} onValueChange={setPrintUse}>
                      <SelectTrigger data-testid="use-case-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          Auto — suggest from QR type ({TYPES.find((t) => t.value === type)?.short})
                        </SelectItem>
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
                  </Field>

                  {recommendation && (
                    <div className="flex items-start gap-2 text-xs" data-testid="size-recommendation">
                      <Ruler className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="text-foreground">
                          Recommended for <strong>{recommendation.use.label}</strong>:{' '}
                          <strong className="text-primary">
                            {recommendation.size?.label?.split('·')[0].trim()}
                            {recommendation.format ? ` · ${recommendation.format.toUpperCase()}` : ''}
                          </strong>
                        </div>
                        <div className="text-muted-foreground">
                          {recommendation.use.why}
                          {recommendation.bumped && ' Bumped up one size because your QR holds a lot of data (denser pattern).'}
                          {' '}Scan distance: {recommendation.use.distance}.{' '}
                          <Link href="/qr-size-guide" className="underline underline-offset-2 hover:text-foreground">Size guide</Link>
                        </div>
                      </div>
                      {isRecommendedApplied ? (
                        <Badge variant="secondary" className="gap-1 shrink-0" data-testid="recommended-applied">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Applied
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={applyRecommendation} data-testid="apply-recommended">
                          Use recommended
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Size">
                    <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                      <SelectTrigger data-testid="size-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Digital (pixels)</SelectLabel>
                          {SIZES.filter((s) => s.group === 'digital').map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.label}{recommendation?.sizeId === s.id ? '  ★ Recommended' : ''}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Print (300+ DPI · print-ready)</SelectLabel>
                          {SIZES.filter((s) => s.group === 'print').map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.label}{recommendation?.sizeId === s.id ? '  ★ Recommended' : ''}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Format">
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FORMATS.map((f) => (
                          <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {(() => {
                  const opt = SIZES.find((s) => s.id === size)
                  if (opt?.group === 'print') {
                    return (
                      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-foreground/80">
                        <div className="font-medium mb-1">Print-ready at {opt.cm} × {opt.cm} cm</div>
                        Scans reliably from up to <strong>~{scanDistanceLabel(opt.cm)}</strong> away (10:1 rule).
                        For the crispest print pick SVG — it scales infinitely and includes physical cm units.
                      </div>
                    )
                  }
                  return null
                })()}

                <Button size="lg" className="w-full" onClick={download} disabled={!downloadUrl || busy}>
                  <Download className="mr-2 h-4 w-4" /> Download QR code{bgTransparent ? ' (transparent)' : ''}
                </Button>

                <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground flex items-center gap-1 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% private
                  </div>
                  Your content and any logo you upload never leave this browser. QR codes are static — they will keep
                  working forever, even if this site goes offline.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Feature strip */}
      <section className="container mx-auto px-4 pb-16 border-t border-border/60 pt-14">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={IdCard} title="QR code with logo — free" desc="Add your brand logo to the center of any QR code. Error correction is auto-boosted so it stays fully scannable. A feature most tools charge for." />
          <FeatureCard icon={ShieldCheck} title="Private & static" desc="No signup, no tracking, no expiry. Your QR content is encoded directly in the image and works forever." />
          <FeatureCard icon={Palette} title="Fully customizable" desc="Pick any colors, transparent background, and export up to 2048×2048 PNG or crisp scalable SVG." />
        </div>
      </section>

      {/* Static vs Dynamic explainer */}
      <section id="static-vs-dynamic" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Static vs Dynamic QR codes</h2>
          <p className="text-muted-foreground mt-3">
            QR Sizer currently generates <strong className="text-foreground">static QR codes</strong> — the best choice for
            print, permanence and privacy. Dynamic QR codes are coming soon for people who need editable destinations and scan analytics.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold uppercase tracking-wide">Available now</span>
              <h3 className="font-semibold">Static QR</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The data is baked directly into the QR image. Print it once, works forever — even if this website goes offline.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">✓</span> Never expires</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> No server dependency</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> 100% private (no scan tracking)</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Free forever, no signup</li>
              <li className="flex gap-2 text-muted-foreground/70"><span>—</span> Destination is locked once printed</li>
              <li className="flex gap-2 text-muted-foreground/70"><span>—</span> No scan analytics</li>
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-border/70 bg-card p-6 opacity-80">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold uppercase tracking-wide">Coming soon</span>
              <h3 className="font-semibold">Dynamic QR</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The QR points to a short link we manage — you can edit the destination anytime and see scan stats.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">✓</span> Edit destination after printing</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Scan analytics (city, device, time)</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Password protection &amp; expiry</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> A/B testing &amp; geo-targeting</li>
              <li className="flex gap-2 text-muted-foreground/70"><span>—</span> Requires an account</li>
              <li className="flex gap-2 text-muted-foreground/70"><span>—</span> Depends on our servers staying online</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          <strong className="text-foreground">Which do you need?</strong> For business cards, packaging, and anything permanent — static.
          For campaigns you may update, retargeting, or attribution — dynamic (soon).
        </p>
      </section>

      {/* Dedicated logo section */}
      <section id="qr-with-logo" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="grid gap-10 md:grid-cols-2 items-center max-w-5xl mx-auto">
          <div>
            <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold uppercase tracking-wide mb-3">
              Most-requested feature
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
              Add your logo to any QR code — 100% free
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Turn any plain black-and-white QR into a branded QR code with your logo in the center.
              QR Sizer automatically raises the error-correction level so the QR still scans perfectly,
              even when the logo covers up to ~30% of the code.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">✓</span> Upload PNG, JPG or SVG logo</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Auto-placed and sized for maximum scannability</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> White (or brand-colored) backdrop behind the logo</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Works with custom colors and transparent background</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Export as high-res PNG or scalable SVG</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Static &mdash; never expires, never depends on our server</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-8 grid place-items-center">
            <div className="relative">
              <svg viewBox="0 0 100 100" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#ffffff"/>
                {/* Corners */}
                <rect x="6" y="6" width="20" height="20" fill="#000"/>
                <rect x="10" y="10" width="12" height="12" fill="#fff"/>
                <rect x="13" y="13" width="6" height="6" fill="#000"/>
                <rect x="74" y="6" width="20" height="20" fill="#000"/>
                <rect x="78" y="10" width="12" height="12" fill="#fff"/>
                <rect x="81" y="13" width="6" height="6" fill="#000"/>
                <rect x="6" y="74" width="20" height="20" fill="#000"/>
                <rect x="10" y="78" width="12" height="12" fill="#fff"/>
                <rect x="13" y="81" width="6" height="6" fill="#000"/>
                {/* Data dots */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = 6 + (i % 8) * 5 + 30
                  const y = 6 + Math.floor(i / 8) * 5 + 30
                  return <rect key={i} x={x - 30} y={y} width={2.5} height={2.5} fill={(i * 7) % 3 === 0 ? '#000' : 'transparent'}/>
                })}
                {Array.from({ length: 80 }).map((_, i) => (
                  <rect key={'d' + i} x={30 + (i % 8) * 5} y={30 + Math.floor(i / 8) * 5} width={2.5} height={2.5} fill={(i * 3) % 4 === 0 ? '#000' : 'transparent'}/>
                ))}
                {/* Center white square with logo mark */}
                <rect x="38" y="38" width="24" height="24" rx="3" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="8" fill="hsl(var(--primary))"/>
                <text x="50" y="53" textAnchor="middle" fontSize="8" fontWeight="800" fill="hsl(var(--primary-foreground))">QR</text>
              </svg>
              <div className="absolute -top-2 -right-2 rounded-full bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 shadow">
                FREE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to create */}
      <section id="how-to-create" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How to create a QR code online for free</h2>
          <p className="text-muted-foreground mt-3">
            Whether you want to generate a QR code for a URL, a WiFi network, a business card, or a restaurant menu,
            the process is the same. It takes under 30 seconds and everything happens in your browser.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { n: '1', t: 'Pick a QR type', d: 'Choose from URL, plain text, email, phone, SMS, WiFi network, business card (vCard), or food menu. Each type has its own smart form to collect the right details.' },
            { n: '2', t: 'Fill in the details', d: 'Enter your content. The QR code updates live as you type so you can see exactly what will be generated before you download.' },
            { n: '3', t: 'Customize (optional)', d: 'Change the foreground and background colors, toggle transparent background, and add your logo in the center. Error correction is auto-boosted so the QR still scans.' },
            { n: '4', t: 'Download', d: 'Pick a size (256 – 2048 px) and format (PNG or SVG), then download. Your QR is static, never expires, and works forever — even if we go offline.' },
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
      <section id="use-cases-create" className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">What can you use a free QR code generator for?</h2>
          <p className="text-muted-foreground mt-3">
            QR codes are one of the easiest ways to move information from print to phone. Here are the most popular
            things people generate with QR Sizer.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: 'Business card QR', d: 'Generate a vCard QR that saves your name, company, phone, and email straight to someone\u2019s contacts when they scan it.' },
            { t: 'WiFi share QR', d: 'Create a WiFi QR code for your café, office, guest room, or Airbnb. Guests scan and join the network without typing a password.' },
            { t: 'Restaurant menu QR', d: 'Turn a link to your digital menu (a PDF, Google Doc, or your website) into a QR code for tables, packaging, and takeaway bags.' },
            { t: 'Marketing & flyers', d: 'Add a branded QR (with your logo and colors) to posters, brochures, and social ads that drives people to your landing page.' },
            { t: 'Event check-in', d: 'Encode a URL to your event page, RSVP form, or map location so attendees can find everything from one scan.' },
            { t: 'Product packaging', d: 'Link customers directly to product manuals, warranty info, videos, or reorder pages by printing a permanent QR on the box.' },
          ].map((u) => (
            <div key={u.t} className="rounded-xl border border-border/70 bg-card p-5">
              <h3 className="font-semibold mb-1">{u.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-12 border-t border-border/60">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">QR generator FAQ</h2>
          <p className="text-muted-foreground mt-3">Common questions about generating QR codes online.</p>
        </div>
        <div className="max-w-3xl mx-auto grid gap-3">
          {[
            { q: 'How do I generate a QR code with a logo for free?', a: 'Fill in your content (URL, WiFi, business card, etc.), click "Upload logo" in the Style section, pick a PNG/JPG/SVG file, then Download. QR Sizer automatically raises the error-correction level to H so your QR still scans with the logo in the center. Most QR generators charge for logo overlays — here it is always free with no watermark or signup.' },
            { q: 'How do I generate a QR code for free?', a: 'Pick a type above, fill in the details, optionally customize the colors and add your logo, then click Download. No signup, no ads, no watermark. It takes under 30 seconds.' },
            { q: 'What is the difference between creating and resizing a QR code?', a: 'Creating means generating a brand-new QR from scratch (you provide the URL, WiFi credentials, contact details, etc.). Resizing means you already have a QR image and want to regenerate it at a higher resolution — no data entry required. QR Sizer does both, free.' },
            { q: 'Do QR codes generated here expire?', a: 'No. These are static QR codes — the content is encoded directly into the pixels. They keep working forever and never depend on our server. That is different from paid "dynamic QR" services which route through their server and can stop working if you cancel or the service shuts down.' },
            { q: 'How big should the logo be on a QR code?', a: 'QR Sizer sizes your logo automatically to cover about 22% of the QR area — the sweet spot that keeps the code fully scannable. With error correction level H, up to ~30% of the QR can be obscured, so there is a small safety margin.' },
            { q: 'Can I download a QR code with a transparent background?', a: 'Yes. Check the "Transparent background" option in the Style section. Both PNG and SVG downloads will have no white square around the QR, so you can drop it onto colored backgrounds, photos, or branded designs.' },
            { q: 'What is a WiFi QR code?', a: 'A special QR that contains your network name (SSID), password, and encryption type (WPA, WEP, or none). When someone scans it with an iPhone or Android device, their phone offers to join the network without typing anything.' },
            { q: 'What is a business card QR code (vCard)?', a: 'A QR containing structured contact details — full name, company, job title, phone, email, website. When scanned, the phone offers to save the person straight to the address book. Great for the back of your business card.' },
            { q: 'How do I make a QR code for a restaurant menu?', a: 'Pick the "Food Menu" type, enter your restaurant name and paste the link to your online menu (hosted on your website, Google Drive, or Dropbox). Print the resulting QR on tables, takeout bags, or your window.' },
            { q: 'Will my custom colors still scan?', a: 'Yes, as long as you keep good contrast — dark foreground on a light background. Avoid inverting the colors (light-on-dark can confuse some older scanners) and avoid low-contrast palettes.' },
            { q: 'PNG or SVG — which format should I choose?', a: 'Choose PNG for social media, websites, screens, and most printing. Choose SVG when you need infinite scalability without quality loss — ideal for large banners, packaging, or business cards you may resize later.' },
            { q: 'Is my content sent to a server?', a: 'No. All QR generation happens locally in your browser using JavaScript. The content you type, the logo you upload, and the generated QR image never leave your device.' },
          ].map((f) => (
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

      {/* SEO closing paragraph */}
      <section className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            <strong className="text-foreground">QR Sizer</strong> is a fast, free online QR code generator that runs
            entirely in your browser. Create custom QR codes for URLs, plain text, email, phone numbers, SMS, WiFi
            networks, business cards, and restaurant menus. Add your logo, pick any brand colors, use a transparent
            background, and export as high-resolution PNG (up to 2048×2048) or infinitely-scalable SVG. Every QR is
            static and permanent — no signup, no ads, no watermarks, and no expiry.
          </p>
          <p>
            Already have a QR code that&apos;s too blurry or too small? Use our{' '}
            <Link href="/" className="underline text-foreground">free QR code resizer</Link> to regenerate any existing
            QR at higher resolution.
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
            <Link href="/" className="hover:text-foreground">Resize a QR</Link>
            <Link href="/create" className="hover:text-foreground">Create a QR</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// -- helpers ----------------------------------------------------------------

async function drawLogoOnCanvas(canvas, logoDataUrl, bgColor) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      const size = canvas.width
      const logoSize = Math.round(size * 0.22)
      const pad = Math.max(4, Math.round(size * 0.015))
      const x = Math.round((size - logoSize) / 2)
      const bgSize = logoSize + pad * 2
      const bgX = x - pad
      const r = Math.round(bgSize * 0.14)
      ctx.fillStyle = bgColor
      roundedRect(ctx, bgX, bgX, bgSize, bgSize, r)
      ctx.fill()
      const ar = img.width / img.height
      let dw = logoSize, dh = logoSize
      if (ar > 1) dh = Math.round(logoSize / ar)
      else dw = Math.round(logoSize * ar)
      const dx = x + Math.round((logoSize - dw) / 2)
      const dy = x + Math.round((logoSize - dh) / 2)
      ctx.drawImage(img, dx, dy, dw, dh)
      resolve()
    }
    img.onerror = () => reject(new Error('Could not render logo'))
    img.src = logoDataUrl
  })
}

function addCaptionToCanvas(qrCanvas, text, bgColor, fgColor) {
  const w = qrCanvas.width
  const padding = Math.round(w * 0.04)
  const fontSize = Math.max(14, Math.round(w * 0.045))
  const lineHeight = Math.round(fontSize * 1.25)

  // Wrap text (measure with temporary context)
  const measureCtx = qrCanvas.getContext('2d')
  measureCtx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  const maxWidth = w - padding * 2
  const words = String(text).split(/\s+/)
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (measureCtx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  const maxLines = 3
  const shown = lines.slice(0, maxLines)

  const captionHeight = padding + shown.length * lineHeight + padding

  const out = document.createElement('canvas')
  out.width = w
  out.height = qrCanvas.height + captionHeight
  const ctx = out.getContext('2d')
  ctx.fillStyle = bgColor === '#00000000' ? '#ffffff' : bgColor
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(qrCanvas, 0, 0)

  ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = fgColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  shown.forEach((line, i) => {
    const y = qrCanvas.height + padding + i * lineHeight + lineHeight / 2
    ctx.fillText(line, w / 2, y)
  })

  return out
}


function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function embedLogoInSvg(svg, logoDataUrl, bgColor) {
  try {
    // Extract viewBox to compute center + logo size
    const vbMatch = svg.match(/viewBox="([\d.\-\s]+)"/)
    let vw = 100, vh = 100, vx = 0, vy = 0
    if (vbMatch) {
      const parts = vbMatch[1].split(/\s+/).map(Number)
      vx = parts[0]; vy = parts[1]; vw = parts[2]; vh = parts[3]
    }
    const size = Math.min(vw, vh)
    const logoSize = size * 0.22
    const pad = size * 0.015
    const bgSize = logoSize + pad * 2
    const cx = vx + vw / 2, cy = vy + vh / 2
    const bgX = cx - bgSize / 2, bgY = cy - bgSize / 2
    const logoX = cx - logoSize / 2, logoY = cy - logoSize / 2
    const r = bgSize * 0.14
    const overlay =
      `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" rx="${r}" ry="${r}" fill="${bgColor}"/>` +
      `<image href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
    return svg.replace(/<\/svg>\s*$/, overlay + '</svg>')
  } catch {
    return svg
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      {children}
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
