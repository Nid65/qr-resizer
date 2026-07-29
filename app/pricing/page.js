'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Check,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react'

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    per: 'forever',
    tagline: 'Perfect for individuals with a few QRs',
    cta: 'Start free',
    ctaVariant: 'outline',
    features: [
      'Unlimited static QRs (with logo &amp; colors)',
      '3 dynamic QRs',
      'Unlimited scans &amp; edits, forever',
      'Basic scan analytics (last 30 days)',
      'PNG &amp; SVG export up to 2048 px',
      'Print sizes 2–5 cm at 300 DPI',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    per: 'per month',
    tagline: 'For creators, marketers &amp; small businesses',
    cta: 'Upgrade to Pro',
    ctaVariant: 'default',
    highlighted: true,
    features: [
      'Everything in Free',
      '25 dynamic QRs',
      'Custom short codes (<span class="font-mono">qr-sizer.com/r/mymenu</span>)',
      'Password protection &amp; auto-expiry',
      'Full analytics history (12 months)',
      'Referrer &amp; hourly scan patterns',
      'A/B destination testing',
      'Priority email support',
    ],
  },
  {
    name: 'Business',
    price: '$29',
    per: 'per month',
    tagline: 'For agencies &amp; teams managing many QRs',
    cta: 'Contact sales',
    ctaVariant: 'outline',
    features: [
      'Everything in Pro',
      'Unlimited dynamic QRs',
      'Team seats (5 included, +$5/each)',
      'Custom domain (<span class="font-mono">qr.mycompany.com</span>)',
      'Geo &amp; device routing',
      'Full analytics history (forever)',
      'API access',
      'Dedicated support',
    ],
  },
]

const FAQ = [
  { q: 'Is the free tier really free forever?', a: 'Yes. You can generate unlimited static QRs and keep 3 dynamic QRs with unlimited scans and edits, forever. No credit card required.' },
  { q: 'What is a dynamic QR?', a: 'A QR code whose destination you can change at any time — without reprinting. Also lets you track scan analytics. Static QRs have their destination baked into the pixels and cannot be changed after printing.' },
  { q: 'What happens if I cancel Pro?', a: 'You keep all your dynamic QRs, but you can only edit the first 3 (matching the free tier). New QRs above 3 stop being editable, though scans still work and the QRs still redirect. Upgrade again to unlock all of them.' },
  { q: 'Do static QRs work forever?', a: 'Yes — static QRs generated here never expire and never depend on our servers, even on the free tier. This is different from many competitors who take away static QRs when you stop paying.' },
  { q: 'Can I get a refund?', a: 'Yes. If you cancel within 14 days of purchase, we’ll refund you in full, no questions asked.' },
  { q: 'How does billing work?', a: 'Monthly subscription via Stripe. Cancel anytime from your dashboard. No hidden fees, no auto-price-hikes at renewal.' },
]

export default function PricingPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-center text-xs py-2 text-amber-800 dark:text-amber-400">
        <span className="inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <strong>Prototype preview</strong> · Paid tiers launch alongside Dynamic QR — static QR is 100% free today.
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
          <nav className="flex items-center gap-3">
            <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground">Static</Link>
            <Link href="/create/dynamic" className="text-sm text-muted-foreground hover:text-foreground">Dynamic</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Simple pricing · Generous free tier
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Static QR codes are free forever. Add dynamic QRs and analytics when you need them.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
          {TIERS.map((t) => (
            <Card
              key={t.name}
              className={[
                'relative',
                t.highlighted ? 'border-primary shadow-lg md:scale-[1.02]' : 'border-border/70',
              ].join(' ')}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="shadow">Most popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.name}</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-4xl font-bold">{t.price}</div>
                  <div className="text-sm text-muted-foreground">{t.per}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-2 mb-5" dangerouslySetInnerHTML={{ __html: t.tagline }} />
                <Button className="w-full" variant={t.ctaVariant}>{t.cta}</Button>
                <div className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: f }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 border-t border-border/60">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Pricing FAQ</h2>
        </div>
        <div className="max-w-3xl mx-auto grid gap-3">
          {FAQ.map((f) => (
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

      <section className="container mx-auto px-4 py-16 border-t border-border/60 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">Try it free</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Start with a static QR today — no signup required. Dynamic launches soon.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/create"><Button size="lg">Create static QR <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          <Link href="/create/dynamic"><Button size="lg" variant="outline">Preview dynamic</Button></Link>
        </div>
      </section>
    </div>
  )
}
