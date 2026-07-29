'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  QrCode,
  Sparkles,
  BarChart3,
  Edit3,
  Lock,
  Timer,
  Link as LinkIcon,
  Copy,
  ArrowRight,
  Users,
  LayoutDashboard,
  Zap,
  Info,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function DynamicPreviewPage() {
  const [destination, setDestination] = useState('https://your-restaurant.com/menu-fall-2025.pdf')
  const [title, setTitle] = useState('Menu QR')
  const [customCode, setCustomCode] = useState('')
  const [password, setPassword] = useState(false)
  const [expiry, setExpiry] = useState(false)
  const [scans, setScans] = useState(1247)
  const [previewUrl, setPreviewUrl] = useState('')

  const shortCode = customCode.trim() || 'abc123'
  const shortUrl = `qr-sizer.com/r/${shortCode}`
  const fullShortUrl = `https://${shortUrl}`

  // Live QR preview
  useEffect(() => {
    QRCode.toDataURL(fullShortUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setPreviewUrl).catch(() => {})
  }, [fullShortUrl])

  // Fake scan ticker (for demo feel)
  useEffect(() => {
    const t = setInterval(() => {
      setScans((n) => n + Math.floor(Math.random() * 3))
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(fullShortUrl).then(() => toast.success('Short URL copied'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Toaster position="top-center" richColors />

      {/* PREVIEW BANNER */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-center text-xs py-2 text-amber-800 dark:text-amber-400">
        <span className="inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <strong>Prototype preview</strong> · Dynamic QR is not live yet — this page shows what it will look like.
          <Link href="/create" className="underline">Back to live app</Link>
        </span>
      </div>

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
            <Link href="/create" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">Static</Link>
            <Link href="/create/dynamic" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 h-9 text-sm font-medium hover:bg-primary/90 transition-colors">Dynamic</Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ml-1">
              <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-14 pb-6 md:pt-16 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Editable destination · Scan analytics · Never lose printed QRs
          </span>
        </div>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
          Dynamic QR Code <span className="text-primary">Generator</span>
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Change the destination of your printed QR code anytime. Track every scan. Never reprint.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Prefer permanent QRs? <Link href="/create" className="underline underline-offset-2 hover:text-foreground">Create a static QR instead</Link>.
        </p>
      </section>

      {/* Workspace */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* LEFT: form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">QR title (private label)</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Menu QR" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination URL</label>
                  <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="https://" />
                  <p className="text-[11px] text-muted-foreground mt-1">Change this anytime, even after printing.</p>
                </div>

                <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    <span>Routing mode</span>
                    <Badge variant="secondary" className="text-[9px]">CHOOSE ONE</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'instant', l: 'Instant redirect', d: 'Straight to one URL' },
                      { v: 'chooser', l: 'Chooser page', d: '2–6 links, users pick' },
                      { v: 'device', l: 'Device split', d: 'iOS → A · Android → B' },
                      { v: 'ab', l: 'A/B split', d: '50/50 test between two URLs' },
                    ].map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        className="rounded-md border border-border/70 hover:border-primary/40 hover:bg-primary/5 text-left p-2.5 text-xs transition-all"
                      >
                        <div className="font-medium text-foreground">{m.l}</div>
                        <div className="text-[10px] text-muted-foreground">{m.d}</div>
                      </button>
                    ))}
                  </div>
                  <Link href="/r/preview" className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
                    See what each routing mode looks like on the scanner&apos;s phone <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    <span>Advanced options</span>
                    <Badge variant="secondary" className="text-[9px]">PRO</Badge>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Custom short code</label>
                    <div className="flex items-center rounded-md border bg-background pl-3">
                      <span className="text-xs text-muted-foreground">qr-sizer.com/r/</span>
                      <Input
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.replace(/[^a-z0-9-]/gi, ''))}
                        placeholder="menu"
                        className="border-0 focus-visible:ring-0 pl-1"
                      />
                    </div>
                  </div>

                  <label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Password protection</span>
                    <input type="checkbox" checked={password} onChange={(e) => setPassword(e.target.checked)} className="h-4 w-4" />
                  </label>

                  <label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Timer className="h-4 w-4" /> Auto-expire on date</span>
                    <input type="checkbox" checked={expiry} onChange={(e) => setExpiry(e.target.checked)} className="h-4 w-4" />
                  </label>
                </div>

                <Button size="lg" className="w-full" onClick={() => toast.info('This is a prototype — sign-up coming soon')}>
                  Create free account &amp; save QR <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">Free tier: 3 dynamic QRs, unlimited scans + edits forever.</p>
              </div>

              {/* RIGHT: preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Preview</div>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" /> Dynamic · editable
                  </Badge>
                </div>

                <div className="rounded-xl border p-6 bg-white grid place-items-center min-h-[280px]">
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Dynamic QR preview" className="max-h-56 object-contain" />
                  )}
                </div>

                <div className="rounded-md border bg-card p-3">
                  <div className="text-xs text-muted-foreground mb-1">Short URL that gets printed</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm truncate flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {shortUrl}
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyLink}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    This URL never changes. Anyone scanning your QR always hits this URL, which we then redirect to your current destination.
                  </p>
                </div>

                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" /> Live scan counter (demo)
                    </div>
                    <div className="font-mono text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {scans.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70">
                    Real dashboard will show scans over time, top cities, devices, and referrers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-4 py-14 border-t border-border/60">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Why dynamic beats static for campaigns</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Edit3, title: 'Change destination anytime', d: 'Update where your QR points — no reprinting posters, cards, or packaging.' },
            { icon: BarChart3, title: 'Full scan analytics', d: 'Track scans over time, top cities, device types, and hourly patterns.' },
            { icon: Lock, title: 'Password &amp; expiry', d: 'Protect campaigns with a password or auto-expire after a specific date.' },
            { icon: Zap, title: 'A/B testing', d: 'Split scans across two destinations to test which lands better.' },
            { icon: Users, title: 'Team collaboration', d: 'Share QR management with teammates — great for agencies and marketers.' },
            { icon: Timer, title: 'Geo &amp; device routing', d: 'Send iOS users to App Store, Android to Play Store, all from one QR.' },
          ].map((f) => (
            <Card key={f.title} className="border-border/70">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold mb-1">{f.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: f.d }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 border-t border-border/60 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">Ready when we launch?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          We’re building this feature now. Want to be one of the first users when it goes live?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg">Preview the dashboard <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">See pricing</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Sizer · v1.0 (Dynamic in preview)</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground">Resize</Link>
            <Link href="/create" className="hover:text-foreground">Static</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
