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
  SelectItem,
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
  UtensilsCrossed,
  Type as TypeIcon,
  Download,
  Upload,
  Trash2,
  Palette,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react'

const SIZES = [256, 512, 1024, 2048]
const FORMATS = ['png', 'svg']
const EC_LEVELS = [
  { value: 'L', label: 'L — Low (~7%)' },
  { value: 'M', label: 'M — Medium (~15%)' },
  { value: 'Q', label: 'Q — Quartile (~25%)' },
  { value: 'H', label: 'H — High (~30%) — required for logos' },
]

const TYPES = [
  { value: 'url', label: 'URL / Link', icon: LinkIcon },
  { value: 'text', label: 'Plain Text', icon: TypeIcon },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Number', icon: Phone },
  { value: 'sms', label: 'SMS Message', icon: MessageSquare },
  { value: 'wifi', label: 'WiFi Network', icon: Wifi },
  { value: 'vcard', label: 'Contact Card (vCard)', icon: UserSquare2 },
  { value: 'menu', label: 'Food Menu', icon: UtensilsCrossed },
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

  const [previewUrl, setPreviewUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const encoded = useMemo(() => buildEncodedString(type, data), [type, data])
  const effectiveEc = logoDataUrl ? 'H' : ecLevel

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
        const previewData = previewCanvas.toDataURL('image/png')
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
          const outData = outCanvas.toDataURL('image/png')
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
  }, [encoded, effectiveEc, fgColor, bgColor, bgTransparent, logoDataUrl, size, format])

  const download = () => {
    if (!downloadUrl) return
    const filename = `qr-${sanitizeName(encoded)}-${size}.${format}`
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
            <div className="font-semibold tracking-tight">QR Resizer</div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md"
            >
              Resize
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-secondary"
            >
              Create
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-14 pb-6 md:pt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Free · no signup · no expiry · no watermark
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight">
          Free QR Code <span className="text-primary">Generator</span>
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Create custom QR codes with your logo and brand colors. URL, WiFi, contact cards, and more —
          all generated in your browser. QR codes never expire.
        </p>
      </section>

      {/* Workspace */}
      <section className="container mx-auto px-4 pb-14">
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
                          <span className="leading-tight text-center">{t.label.split(' ')[0]}</span>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Center logo (optional)</label>
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
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()} className="w-full">
                          <Upload className="mr-2 h-4 w-4" /> Upload logo (PNG, JPG, SVG)
                        </Button>
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
                    <Sparkles className="h-3 w-3" /> {size}px · {format.toUpperCase()}
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

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Size">
                    <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={String(s)}>{s} × {s} px</SelectItem>
                        ))}
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

                <Button size="lg" className="w-full" onClick={download} disabled={!downloadUrl || busy}>
                  <Download className="mr-2 h-4 w-4" /> Download QR code
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
          <FeatureCard icon={Zap} title="Instant preview" desc="Every change updates the QR live in your browser — no waiting for a server round trip." />
          <FeatureCard icon={ShieldCheck} title="Private & static" desc="No signup, no tracking, no expiry. Your QR content is encoded directly in the image and works forever." />
          <FeatureCard icon={Palette} title="Fully customizable" desc="Pick any colors, add your logo, and export up to 2048×2048 PNG or crisp scalable SVG." />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-12 border-t border-border/60">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">QR generator FAQ</h2>
        </div>
        <div className="max-w-3xl mx-auto grid gap-3">
          {[
            { q: 'How do I create a QR code for free?', a: 'Pick a type above, fill in the details, optionally customize the colors and add your logo, then click Download. No signup, no ads, no watermark.' },
            { q: 'Do these QR codes expire?', a: 'No. These are static QR codes — the content is baked into the pixels. They keep working forever and never depend on our server.' },
            { q: 'Can I add a logo to the center?', a: 'Yes. Upload any PNG, JPG or SVG logo. Error correction is automatically bumped to H so the QR remains fully scannable.' },
            { q: 'What is a WiFi QR code?', a: 'A special QR that contains your network name, password and encryption type. Anyone who scans it (iPhone, Android) joins your network without typing anything.' },
            { q: 'What is a vCard QR code?', a: 'A QR that contains contact details (name, phone, email, company). When scanned, the phone offers to save the person to the address book. Great for business cards.' },
            { q: 'Will my custom colors still scan?', a: 'Yes, as long as you keep good contrast — a dark foreground on a light background. Avoid inverting the colors and avoid low-contrast palettes.' },
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

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Resizer · v1.0</span>
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
      // White (or bg-colored) rounded square behind logo for scannability
      const r = Math.round(bgSize * 0.14)
      ctx.fillStyle = bgColor
      roundedRect(ctx, bgX, bgX, bgSize, bgSize, r)
      ctx.fill()
      // Fit logo preserving aspect ratio
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
