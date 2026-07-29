'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Info,
  Lock,
  Timer,
  Smartphone,
  Utensils,
  CalendarDays,
  Instagram,
  MapPin,
  Loader2,
  AlertTriangle,
  PauseCircle,
  ArrowRight,
  Apple,
  Play,
  Zap,
  Globe,
} from 'lucide-react'

const SCENARIOS = [
  { id: 'instant', label: 'Instant redirect', icon: Zap, sub: 'Default — no page, just redirect' },
  { id: 'chooser', label: 'Chooser landing', icon: MapPin, sub: 'Show a menu of links' },
  { id: 'device', label: 'Device split', icon: Smartphone, sub: 'iOS → App Store · Android → Play Store' },
  { id: 'ab', label: 'A/B split', icon: Globe, sub: '50 / 50 between two URLs' },
  { id: 'password', label: 'Password gate', icon: Lock, sub: 'Requires a code before redirect' },
  { id: 'expired', label: 'Expired', icon: Timer, sub: 'Auto-expiry date has passed' },
  { id: 'paused', label: 'Paused by owner', icon: PauseCircle, sub: 'Manually disabled' },
]

export default function ScanPreviewPage() {
  const [active, setActive] = useState('instant')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* PREVIEW BANNER */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-center text-xs py-2 text-amber-800 dark:text-amber-400">
        <span className="inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <strong>Wireframe preview</strong> · What the person scanning your QR sees on their phone.
          <Link href="/create/dynamic" className="underline">Back to Dynamic setup</Link>
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
          <nav className="flex items-center gap-3">
            <Link href="/create/dynamic" className="text-sm text-muted-foreground hover:text-foreground">Dynamic setup</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">The user side — what people see after they scan</h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          Click any scenario below to preview what happens on the scanner&apos;s phone.
          Same QR image, different behaviors — that&apos;s the power of dynamic QRs.
        </p>
      </section>

      {/* Scenario tabs */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {SCENARIOS.map((s) => {
            const Icon = s.icon
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={[
                  'inline-flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-xs transition-all min-w-[140px]',
                  isActive
                    ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                    : 'border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{s.label}</span>
                <span className="text-[10px] opacity-70">{s.sub}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Phone frame + explanation */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Phone */}
          <div className="flex justify-center">
            <PhoneFrame>
              <ScanScreen scenario={active} />
            </PhoneFrame>
          </div>

          {/* Explanation */}
          <div>
            <Explanation scenario={active} />
          </div>
        </div>
      </section>

      {/* How to configure section */}
      <section className="container mx-auto px-4 py-12 border-t border-border/60">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">How you configure these on your QR</h2>
          <p className="text-muted-foreground mb-6">
            When you create or edit a dynamic QR on your dashboard, you&apos;ll pick a routing mode.
            The physical QR image stays the same forever — you only change how it behaves when scanned.
          </p>
          <Link href="/create/dynamic">
            <Button size="lg">
              See routing options on the setup page <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Sizer · Scanner-side wireframes</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/create/dynamic" className="hover:text-foreground">Dynamic setup</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---- Components -----------------------------------------------------------

function PhoneFrame({ children }) {
  return (
    <div className="relative w-[320px] h-[640px] bg-neutral-900 rounded-[44px] p-3 shadow-2xl border border-neutral-800">
      {/* Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center">
        <div className="h-1.5 w-16 bg-neutral-700 rounded-full" />
      </div>
      {/* Screen */}
      <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
        {/* Status bar */}
        <div className="h-9 flex items-center justify-between px-6 pt-2 text-[11px] text-neutral-800 font-medium">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span>••••</span>
            <span>5G</span>
            <span>▮</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

function ScanScreen({ scenario }) {
  if (scenario === 'instant') return <InstantScreen />
  if (scenario === 'chooser') return <ChooserScreen />
  if (scenario === 'device') return <DeviceScreen />
  if (scenario === 'ab') return <ABScreen />
  if (scenario === 'password') return <PasswordScreen />
  if (scenario === 'expired') return <ExpiredScreen />
  if (scenario === 'paused') return <PausedScreen />
  return null
}

function BrowserBar({ url }) {
  return (
    <div className="h-9 border-b border-neutral-200 flex items-center gap-2 px-3 bg-neutral-50">
      <div className="h-2 w-2 rounded-full bg-red-400" />
      <div className="h-2 w-2 rounded-full bg-yellow-400" />
      <div className="h-2 w-2 rounded-full bg-green-400" />
      <div className="flex-1 h-6 bg-white border border-neutral-200 rounded-full flex items-center px-3 text-[10px] text-neutral-500 truncate">
        {url}
      </div>
    </div>
  )
}

function InstantScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/menu" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div>
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mx-auto mb-3" />
          <div className="text-sm text-neutral-600">Redirecting…</div>
          <div className="text-[10px] text-neutral-400 mt-2">
            qr-sizer.com/r/menu <br />→ bella-trattoria.com/menu-fall.pdf
          </div>
        </div>
      </div>
    </div>
  )
}

function ChooserScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/bella" />
      <div className="h-[calc(100%-36px)] overflow-auto">
        <div className="h-20 bg-gradient-to-br from-amber-400 to-orange-500 relative">
          <div className="absolute -bottom-6 left-4 h-12 w-12 bg-white rounded-full border-4 border-white grid place-items-center shadow">
            <Utensils className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <div className="p-4 pt-8">
          <div className="text-base font-semibold">Bella Trattoria</div>
          <div className="text-[11px] text-neutral-500 mb-4">Rustic Italian · Bangalore</div>
          <div className="space-y-2">
            {[
              { i: Utensils, l: 'View menu', s: 'Fall 2025 · PDF' },
              { i: CalendarDays, l: 'Reserve a table', s: 'Book on OpenTable' },
              { i: Instagram, l: 'Instagram', s: '@bellatrattoria' },
              { i: MapPin, l: 'Directions', s: '2.4 km · via HSR' },
            ].map((it, i) => {
              const Icon = it.i
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 bg-white">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 grid place-items-center">
                    <Icon className="h-4 w-4 text-neutral-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-neutral-900">{it.l}</div>
                    <div className="text-[10px] text-neutral-500">{it.s}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              )
            })}
          </div>
          <div className="text-center text-[9px] text-neutral-400 mt-4">
            Powered by QR Sizer
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/download-app" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div>
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mx-auto mb-3" />
          <div className="text-sm text-neutral-700 font-medium">Opening App Store…</div>
          <div className="text-[10px] text-neutral-500 mt-3">Detected: iPhone (iOS)</div>
          <div className="mt-6 rounded-lg border border-neutral-200 p-3 bg-neutral-50 text-left">
            <div className="text-[10px] text-neutral-500 mb-1">Routing rules</div>
            <div className="flex items-center gap-2 text-[11px]">
              <Apple className="h-3.5 w-3.5" />
              <span>iOS →</span>
              <span className="font-mono text-neutral-700">apps.apple.com/…</span>
              <Badge className="ml-auto text-[9px]" variant="secondary">match</Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-1.5 opacity-50">
              <Play className="h-3.5 w-3.5" />
              <span>Android →</span>
              <span className="font-mono text-neutral-700">play.google.com/…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ABScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/promo" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div>
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mx-auto mb-3" />
          <div className="text-sm text-neutral-700 font-medium">Redirecting…</div>
          <div className="text-[10px] text-neutral-500 mt-3">A/B split · this scan → variant B</div>
          <div className="mt-6 rounded-lg border border-neutral-200 p-3 bg-neutral-50 text-left">
            <div className="text-[10px] text-neutral-500 mb-2">50/50 test</div>
            <div className="flex items-center justify-between text-[11px] mb-1 opacity-50">
              <span>A · promo/summer</span>
              <span className="tabular-nums">521 scans</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium">B · promo/monsoon</span>
              <span className="tabular-nums">548 scans</span>
              <Badge className="text-[9px]" variant="secondary">winning</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/private" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div className="w-full">
          <div className="h-14 w-14 rounded-full bg-neutral-100 grid place-items-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-neutral-700" />
          </div>
          <div className="text-base font-semibold text-neutral-900">This QR is protected</div>
          <div className="text-[11px] text-neutral-500 mt-1 mb-4">
            Enter the password shared by the owner to continue.
          </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          />
          <button className="w-full mt-2 rounded-md bg-black text-white px-3 py-2 text-sm">
            Continue
          </button>
          <div className="text-[9px] text-neutral-400 mt-4">Powered by QR Sizer</div>
        </div>
      </div>
    </div>
  )
}

function ExpiredScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/summer23" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div>
          <div className="h-14 w-14 rounded-full bg-red-100 grid place-items-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-base font-semibold text-neutral-900">This QR has expired</div>
          <div className="text-[11px] text-neutral-500 mt-1 mb-4">
            The owner set this campaign to end on <strong>31 Aug 2025</strong>.
          </div>
          <div className="text-[9px] text-neutral-400 mt-4">Powered by QR Sizer</div>
        </div>
      </div>
    </div>
  )
}

function PausedScreen() {
  return (
    <div className="h-[calc(100%-36px)]">
      <BrowserBar url="qr-sizer.com/r/paused" />
      <div className="grid place-items-center h-[calc(100%-36px)] px-6 text-center">
        <div>
          <div className="h-14 w-14 rounded-full bg-amber-100 grid place-items-center mx-auto mb-3">
            <PauseCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="text-base font-semibold text-neutral-900">This QR is temporarily paused</div>
          <div className="text-[11px] text-neutral-500 mt-1 mb-4">
            Please check back soon or contact the code owner.
          </div>
          <div className="text-[9px] text-neutral-400 mt-4">Powered by QR Sizer</div>
        </div>
      </div>
    </div>
  )
}

function Explanation({ scenario }) {
  const items = {
    instant: {
      t: 'Instant redirect (default)',
      d: 'The most common flow — the phone goes straight to the destination URL with just a short loading spinner. Fast, invisible, works for 99% of cases like linking to a menu, form, or article.',
      pros: ['Fastest experience', 'No branding page', 'Users don\'t know it\'s dynamic'],
      cons: ['Can\'t show multiple links', 'No user choice'],
    },
    chooser: {
      t: 'Chooser landing page',
      d: 'Instead of a single URL, the QR lands on a small branded page with 2–6 buttons. Great for restaurants (menu / reservations / Instagram), events, and business cards where you want to offer multiple choices from one scan.',
      pros: ['Multiple links from one QR', 'Branded first impression', 'Track which link is most popular'],
      cons: ['One extra tap for the user', 'Requires the QR Sizer landing page'],
    },
    device: {
      t: 'Device split (iOS vs Android)',
      d: 'The QR detects the scanner\'s operating system and redirects them to the right app store — iOS goes to App Store, Android goes to Play Store. Zero user friction, perfect for app promotions on posters and packaging.',
      pros: ['One QR works for both platforms', 'No landing page needed', 'Higher install conversion'],
      cons: ['Only makes sense for apps'],
    },
    ab: {
      t: 'A/B split (50/50)',
      d: 'Every scan is randomly routed to Variant A or Variant B. Use it to test two landing pages, two offers, or two videos. The dashboard shows scan-to-goal conversion for each so you know which wins.',
      pros: ['Data-driven decisions', 'Same QR, two experiments', 'Great for marketers'],
      cons: ['Only useful if you can measure downstream conversion'],
    },
    password: {
      t: 'Password-protected QR',
      d: 'Anyone who scans has to enter a code before being redirected. Ideal for private events, ticketed content, VIP-only offers, or confidential documents.',
      pros: ['Prevents sharing to strangers', 'Simple gating'],
      cons: ['Adds friction — not for public marketing'],
    },
    expired: {
      t: 'Expired QR',
      d: 'You set an expiry date when creating the QR (e.g., end of a promo). After that date, scanners see a friendly "expired" page instead of the destination.',
      pros: ['Auto shuts down time-limited campaigns', 'No cleanup needed'],
      cons: ['Cannot un-expire (you\'d need to remove the expiry date)'],
    },
    paused: {
      t: 'Manually paused',
      d: 'One-click toggle from your dashboard to temporarily disable a QR. Useful if you spot a bug, need to swap the destination, or the campaign is on hold.',
      pros: ['Instant control', 'Reversible any time'],
      cons: ['Scans during pause are wasted (though still counted)'],
    },
  }
  const it = items[scenario] || items.instant

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{it.t}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{it.d}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-emerald-600 mb-1.5">Pros</div>
            <ul className="space-y-1">
              {it.pros.map((p) => (
                <li key={p} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-emerald-500">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1.5">Trade-offs</div>
            <ul className="space-y-1">
              {it.cons.map((c) => (
                <li key={c} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-neutral-400">—</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
