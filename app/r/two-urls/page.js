'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Info,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react'

export default function TwoUrlsPreview() {
  const [title, setTitle] = useState('Bella Trattoria')
  const [subtitle, setSubtitle] = useState('Rustic Italian · Bangalore')
  const [links, setLinks] = useState([
    { label: 'View menu', url: 'https://bella-trattoria.com/menu.pdf' },
    { label: 'Book a table', url: 'https://bella-trattoria.com/reserve' },
  ])

  const updateLink = (i, key, value) => {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  }

  const addLink = () => setLinks((prev) => [...prev, { label: '', url: '' }])
  const removeLink = (i) => setLinks((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-center text-xs py-2 text-amber-800 dark:text-amber-400">
        <span className="inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <strong>Wireframe preview</strong> · One QR → multiple URLs. This shows exactly what the scanner sees.
          <Link href="/create/dynamic" className="underline">Back to setup</Link>
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
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
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-10 pb-4 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-3">
          <Sparkles className="h-3.5 w-3.5" /> One QR · Multiple destinations
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Add two URLs to one QR</h1>
        <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
          Edit the URLs on the left → see live on the right what the person scanning your QR will see.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-2 items-start max-w-5xl mx-auto">
          {/* LEFT — creator side */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">You (creator side)</div>
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your business or event name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Subtitle (optional)</label>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="One-line description" />
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Your links</div>
                  <div className="space-y-3">
                    {links.map((link, i) => (
                      <div key={i} className="rounded-md border p-3 bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-muted-foreground">Link {i + 1}</span>
                          {links.length > 2 && (
                            <button onClick={() => removeLink(i)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <Input
                          value={link.label}
                          onChange={(e) => updateLink(i, 'label', e.target.value)}
                          placeholder="Button label (e.g. View menu)"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => updateLink(i, 'url', e.target.value)}
                          placeholder="https://…"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={addLink}
                    disabled={links.length >= 6}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add another link {links.length >= 6 && '(max 6)'}
                  </Button>
                </div>

                <Button size="lg" className="w-full">
                  Generate QR <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="text-center text-[11px] text-muted-foreground">
                  Prototype preview — this doesn&apos;t save anything yet.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — scanner side */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
              Scanner sees (their phone)
              <Badge variant="secondary" className="text-[9px]">LIVE</Badge>
            </div>
            <div className="flex justify-center">
              <PhoneFrame>
                <ScannerView title={title} subtitle={subtitle} links={links} />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function PhoneFrame({ children }) {
  return (
    <div className="relative w-[320px] h-[640px] bg-neutral-900 rounded-[44px] p-3 shadow-2xl border border-neutral-800">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center">
        <div className="h-1.5 w-16 bg-neutral-700 rounded-full" />
      </div>
      <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
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

function ScannerView({ title, subtitle, links }) {
  return (
    <div className="h-[calc(100%-36px)]">
      {/* Browser bar */}
      <div className="h-9 border-b border-neutral-200 flex items-center gap-2 px-3 bg-neutral-50">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <div className="flex-1 h-6 bg-white border border-neutral-200 rounded-full flex items-center px-3 text-[10px] text-neutral-500 truncate">
          qr-sizer.com/r/abc123
        </div>
      </div>

      <div className="h-[calc(100%-36px)] overflow-auto">
        {/* Cover */}
        <div className="h-20 bg-gradient-to-br from-amber-400 to-orange-500 relative">
          <div className="absolute -bottom-6 left-4 h-12 w-12 bg-white rounded-full border-4 border-white grid place-items-center shadow">
            <QrCode className="h-5 w-5 text-amber-600" />
          </div>
        </div>

        <div className="p-4 pt-8">
          <div className="text-base font-semibold text-neutral-900">{title || 'Your title'}</div>
          {subtitle && <div className="text-[11px] text-neutral-500 mb-4">{subtitle}</div>}

          <div className="space-y-2 mt-3">
            {links.map((link, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 bg-white active:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-neutral-100 grid place-items-center shrink-0">
                  <LinkIcon className="h-4 w-4 text-neutral-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-neutral-900 truncate">
                    {link.label || `Link ${i + 1}`}
                  </div>
                  {link.url && (
                    <div className="text-[10px] text-neutral-500 truncate">
                      {link.url.replace(/^https?:\/\//, '')}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </div>
            ))}
          </div>

          <div className="text-center text-[9px] text-neutral-400 mt-6 pb-4">
            Powered by QR Sizer
          </div>
        </div>
      </div>
    </div>
  )
}
