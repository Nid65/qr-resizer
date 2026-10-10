import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Ruler, Printer, Monitor, AlertTriangle, CheckCircle2, ArrowRight, Info } from 'lucide-react'

export const metadata = {
  title: 'QR Code Size Guide — Perfect Dimensions for Every Use Case (2026)',
  description:
    'Complete QR code size guide: exact dimensions, pixels, and DPI for business cards, product packaging, flyers, posters, billboards, menus, event tickets, real estate signs, and more. 10:1 distance-to-size rule, DPI reference, and common mistakes to avoid.',
  keywords: [
    'QR code size guide',
    'QR code dimensions',
    'QR code size',
    'minimum QR code size',
    'QR code size for business card',
    'QR code size for flyer',
    'QR code size for poster',
    'QR code size for billboard',
    'QR code size for menu',
    'QR code size for packaging',
    'QR code size for real estate',
    'QR code DPI',
    '300 DPI QR code',
    '600 DPI QR code',
    'QR code 10:1 rule',
    'QR code scanning distance',
    'QR code pixel size',
    'QR code print size',
    'how big should a QR code be',
    'how small can a QR code be',
  ],
  alternates: { canonical: '/qr-size-guide' },
  openGraph: {
    title: 'QR Code Size Guide — Perfect Dimensions for Every Use Case',
    description: 'Exact pixels, cm, inches, and DPI recommendations for 12 real-world QR code use cases.',
    url: '/qr-size-guide',
    type: 'article',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'QR Code Size Guide' }],
  },
  twitter: { card: 'summary_large_image', title: 'QR Code Size Guide', images: ['/og.svg'] },
}

const USE_CASES = [
  { n: 1, name: 'Business cards', distance: 'Few inches (close-up)', size: '2 × 2 cm (0.8 × 0.8")', pixels: '240 × 240 px @ 300 DPI', tips: ['Ensure clear space around the code', 'Maintain high contrast', 'Avoid overcrowding the code with data'] },
  { n: 2, name: 'Product packaging & labels', distance: 'Few inches to arm\u2019s length', size: '1 × 1 cm to 2 × 2 cm (0.4 – 0.8")', pixels: '120 × 120 to 240 × 240 px @ 300 DPI', tips: ['Avoid reflective or curved surfaces', 'Use high print quality', 'Preserve a proper quiet zone around the code'] },
  { n: 3, name: 'Flyers, brochures & magazines', distance: 'Arm\u2019s length (30–70 cm / 1–2.5 ft)', size: '2 × 2 cm to 3 × 3 cm (0.8–1.2")', pixels: '240 × 240 to 360 × 360 px @ 300 DPI', tips: ['Avoid placing QR codes near folds or edges', 'Use high-resolution images for print', 'Include a clear call to action next to the code'] },
  { n: 4, name: 'Posters & indoor signage', distance: '1 – 3 meters (3 – 10 ft)', size: '10 × 10 cm to 30 × 30 cm (4 – 12")', pixels: '1200 × 1200 to 3600 × 3600 px @ 300 DPI', tips: ['Place in visible, high-traffic areas', 'Maximize color contrast', 'Keep a wide quiet zone'] },
  { n: 5, name: 'Digital signage & presentations', distance: '1 – 6 meters (3 – 20 ft)', size: '5 × 5 cm to 60 × 60 cm on screen', pixels: 'At least 300 × 300 px for presentations', tips: ['Use high pixel-density images', 'Ensure good contrast against background', 'Avoid cluttered or busy backgrounds'] },
  { n: 6, name: 'Billboards & outdoor advertising', distance: '10 – 50 meters (30 – 160 ft)', size: '1 × 1 m to 5 × 5 m (3.2 – 16 ft)', pixels: '500 × 500 px minimum (use SVG for print)', tips: ['Follow the 10:1 distance-to-size rule', 'Use vector SVG format for print clarity', 'Mount signage at an accessible height'] },
  { n: 7, name: 'Event tickets', distance: 'Few inches (close-up)', size: 'Small to medium, depends on format', pixels: '256, 512, 1024, 2048 or 4K options', tips: ['Ensure readability despite logos or custom color', 'Test thoroughly before deployment', 'Use error correction level H if adding a logo'] },
  { n: 8, name: 'Restaurant menus', distance: 'Few inches', size: '2 × 2 cm to 5 × 5 cm (0.8 – 2")', pixels: '240 × 240 px minimum @ 300 DPI', tips: ['Use laminated cards sized 3.5" × 5" or 5" × 7"', 'Make sure guests can scan quickly and easily', 'Keep the destination URL short'] },
  { n: 9, name: 'Manufacturing labels', distance: 'Few inches', size: 'Varies — minimum 12 mm for simple codes', pixels: 'Varies — 150 px minimum', tips: ['Support large data capacities (up to 3,000 characters)', 'Avoid blurry prints', 'Prioritize contrast for quick scanning'] },
  { n: 10, name: 'Educational materials', distance: 'Close-up to arm\u2019s length', size: 'Varies by placement (handout vs wall poster)', pixels: '240 × 240 px @ 300 DPI for handouts', tips: ['Use URL shorteners to reduce data complexity', 'Design for visibility based on environment', 'Pair with a short caption or CTA'] },
  { n: 11, name: 'Real estate signs', distance: 'Medium to long distance', size: '4.75" × 4.75" to 7.75" × 7.75"', pixels: '1425 × 1425 to 2325 × 2325 px @ 300 DPI', tips: ['Apply decals to existing signage', 'Test for scannability at typical viewing distances', 'Ensure landing pages are mobile-optimized'] },
  { n: 12, name: 'Hospital patient wristbands', distance: 'Close-up', size: 'Small to medium, at least 2 cm wide', pixels: '240 × 240 px minimum @ 300 DPI', tips: ['Ensure clear readability at all times', 'Prioritize patient safety and scanning reliability', 'Use high error correction level'] },
]

const DPI_REF = [
  { icon: Monitor, dpi: '72–96 DPI', label: 'Digital screens', use: 'Websites, emails, app screens, social media' },
  { icon: Printer, dpi: '300 DPI', label: 'Standard print', use: 'Business cards, flyers, menus, product labels' },
  { icon: Printer, dpi: '600 DPI', label: 'High-end print', use: 'Magazines, premium brochures, luxury packaging' },
]

const MISTAKES = [
  'Making the QR too small — stays under the 10:1 rule (scanning distance ÷ 10) means your 20 cm QR works up to 2 m away, not 20 m',
  'Using low contrast — light-gray on white, or pale colors on busy photos won\u2019t scan reliably',
  'Removing the quiet zone — QR codes need ~2 modules of blank space around them (about 10% of the code width)',
  'Inverting dark/light — most scanners expect dark modules on a light background; inverted codes can fail on older phones',
  'Printing on reflective or curved surfaces without testing — glossy stickers, aluminum cans, and spherical packaging distort the pattern',
  'Compressing or resizing the final image after export — always generate at the exact pixel size you need, or export as SVG for perfect scaling',
  'Overcrowding with data — the more characters you encode, the denser the QR becomes and the larger it needs to be printed to scan',
  'Skipping real-world testing — always scan from the actual intended distance with multiple phones before mass-printing',
]

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the minimum size for a QR code to scan reliably?', acceptedAnswer: { '@type': 'Answer', text: 'The generally accepted minimum is 2 × 2 cm (0.8 × 0.8 inches) when scanned from about 20 cm away. For longer scanning distances, apply the 10:1 rule — the QR code width should be at least 1/10 of the scanning distance.' } },
    { '@type': 'Question', name: 'What is the 10:1 rule for QR codes?', acceptedAnswer: { '@type': 'Answer', text: 'The 10:1 rule means the QR code should be printed at least 1/10 the size of the maximum scanning distance. For example, if people will scan from 2 meters away, the QR should be at least 20 cm wide. If from 50 meters (a billboard), at least 5 meters wide.' } },
    { '@type': 'Question', name: 'What size QR code should I use on a business card?', acceptedAnswer: { '@type': 'Answer', text: 'For business cards, use a QR code 2 × 2 cm (0.8 × 0.8 inches), rendered at 240 × 240 pixels at 300 DPI. Keep a clear quiet zone around the code and ensure high contrast between the modules and the background.' } },
    { '@type': 'Question', name: 'What size QR code for a billboard?', acceptedAnswer: { '@type': 'Answer', text: 'Billboards are typically scanned from 10 – 50 meters away. By the 10:1 rule, the QR code should be 1 × 1 meter to 5 × 5 meters wide. Always export as scalable SVG to keep the image sharp at any print size.' } },
    { '@type': 'Question', name: 'What DPI should a QR code be printed at?', acceptedAnswer: { '@type': 'Answer', text: 'Use 300 DPI for standard print (business cards, flyers, menus, product packaging). Use 600 DPI for high-end print like magazines and premium brochures. For digital screens, 72 to 96 DPI is enough.' } },
    { '@type': 'Question', name: 'How do I convert QR code physical size to pixels?', acceptedAnswer: { '@type': 'Answer', text: 'Multiply the desired size (in inches) by the DPI. For example, a 2-inch QR code at 300 DPI needs 2 × 300 = 600 pixels. A 2 × 2 cm QR at 300 DPI needs about 240 pixels (2 cm ≈ 0.787 inches × 300 ≈ 236 px).' } },
    { '@type': 'Question', name: 'Should I use PNG or SVG for printed QR codes?', acceptedAnswer: { '@type': 'Answer', text: 'Use SVG whenever possible for print — it is a vector format that scales infinitely without pixelation. PNG is fine for digital and small print at known sizes. For billboards, product packaging, and anywhere the QR may be enlarged, always export as SVG.' } },
  ],
}

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

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
            <Link href="/create" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent">Create QR</Link>
            <Link href="/create/bulk" className="hidden sm:inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent">Bulk</Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent">Resize QR</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-14 pb-6 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-3">
          <Ruler className="h-3.5 w-3.5" /> Reference guide · 12 use cases
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          QR Code Size Guide — <span className="text-primary">Perfect Dimensions</span> for Every Use Case
        </h1>
        <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          How big should a QR code be? Exact pixels, centimeters, inches and DPI for business cards, flyers, posters,
          billboards, product packaging, restaurant menus and more.
        </p>
      </section>

      {/* 10:1 rule */}
      <section className="container mx-auto px-4 py-10">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 md:flex items-center gap-6">
            <div className="shrink-0 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-bold mb-4 md:mb-0">10:1</div>
            <div>
              <h2 className="text-xl font-semibold mb-1">The 10:1 distance-to-size rule</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A QR code should be at least <strong className="text-foreground">1/10 the size of the farthest expected scanning distance</strong>.
                Example: if people will scan from 2 meters away, the QR must be at least 20 cm wide. From 50 m (billboard), at least 5 m.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 12 use cases */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 text-center">12 common use cases &amp; their ideal QR size</h2>
        <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
          {USE_CASES.map((u) => (
            <Card key={u.n} id={`use-case-${u.n}`} className="border-border/70 scroll-mt-24 target:ring-2 target:ring-primary">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">{u.n}</div>
                  <h3 className="text-lg font-semibold">{u.name}</h3>
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <dt className="text-muted-foreground">Distance:</dt>
                    <dd>{u.distance}</dd>
                  </div>
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <dt className="text-muted-foreground">Size:</dt>
                    <dd className="font-medium">{u.size}</dd>
                  </div>
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <dt className="text-muted-foreground">Pixels:</dt>
                    <dd className="font-mono text-xs">{u.pixels}</dd>
                  </div>
                </dl>
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">Tips</div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {u.tips.map((t, i) => (
                      <li key={i} className="flex gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DPI reference */}
      <section className="container mx-auto px-4 py-10 border-t border-border/60">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6 text-center">DPI reference</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Dots-Per-Inch controls how sharp your QR looks when printed. Convert from physical size to pixels: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">pixels = inches × DPI</code>
        </p>
        <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {DPI_REF.map((d) => {
            const Icon = d.icon
            return (
              <Card key={d.dpi} className="border-border/70">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3"><Icon className="h-5 w-5" /></div>
                  <div className="text-xl font-bold">{d.dpi}</div>
                  <div className="font-medium mb-1">{d.label}</div>
                  <div className="text-sm text-muted-foreground">{d.use}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Common mistakes */}
      <section className="container mx-auto px-4 py-10 border-t border-border/60">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6 text-center">8 common mistakes to avoid</h2>
        <div className="max-w-3xl mx-auto grid gap-3">
          {MISTAKES.map((m, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-4 bg-card">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: m }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-14 border-t border-border/60 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">Ready to make a correctly-sized QR?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          QR Sizer has print presets from 0.5" to 5 cm plus digital sizes up to 2048 px — pre-calculated at 300 DPI so you can skip the math.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/create"><Button size="lg">Create a QR code <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          <Link href="/create/bulk"><Button size="lg" variant="outline">Bulk generator</Button></Link>
          <Link href="/"><Button size="lg" variant="outline">Resize existing QR</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Sizer · Size guide</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground">Resize</Link>
            <Link href="/create" className="hover:text-foreground">Create</Link>
            <Link href="/create/bulk" className="hover:text-foreground">Bulk</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
