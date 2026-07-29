'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Plus,
  Edit3,
  BarChart3,
  Copy,
  ExternalLink,
  Trash2,
  Sparkles,
  Info,
  ArrowRight,
  LayoutDashboard,
  Smartphone,
  Monitor,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

const QRS = [
  { id: 'q1', title: 'Restaurant Menu', short: 'menu', dest: 'https://bella-trattoria.com/menu-fall.pdf', scans: 856, weekScans: 63, created: '3 weeks ago', type: 'URL' },
  { id: 'q2', title: 'My Business Card', short: 'jane', dest: 'https://linkedin.com/in/janedoe', scans: 312, weekScans: 21, created: '2 months ago', type: 'URL' },
  { id: 'q3', title: 'Wedding RSVP', short: 'jane-mike', dest: 'https://forms.gle/wedding-rsvp', scans: 79, weekScans: 5, created: '5 days ago', type: 'URL' },
]

export default function DashboardPreview() {
  const [selected, setSelected] = useState(QRS[0].id)
  const [editOpen, setEditOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editingId, setEditingId] = useState(null)

  const totalScans = QRS.reduce((s, q) => s + q.scans, 0)
  const totalWeek = QRS.reduce((s, q) => s + q.weekScans, 0)

  const selectedQr = QRS.find((q) => q.id === selected) || QRS[0]

  const openEdit = (q) => {
    setEditingId(q.id)
    setEditValue(q.dest)
    setEditOpen(true)
  }

  const saveEdit = () => {
    toast.success('Destination updated (preview — no data was saved)')
    setEditOpen(false)
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Toaster position="top-center" richColors />

      <div className="bg-amber-500/15 border-b border-amber-500/30 text-center text-xs py-2 text-amber-800 dark:text-amber-400">
        <span className="inline-flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <strong>Prototype preview</strong> · This is a mockup of what the dashboard will look like once Dynamic QR ships.
          <Link href="/create" className="underline">Back to live app</Link>
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-border/60 bg-background">
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
            <Link href="/create/dynamic" className="text-sm text-muted-foreground hover:text-foreground">Create QR</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">S</div>
              <div className="hidden sm:block text-sm">Sarah</div>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" /> My Dynamic QRs
            </h1>
            <p className="text-sm text-muted-foreground">Manage all your editable QR codes and track scans in one place.</p>
          </div>
          <Link href="/create/dynamic">
            <Button><Plus className="h-4 w-4 mr-1" /> New Dynamic QR</Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total QRs" value={QRS.length} sub={`${QRS.length} of 3 free — upgrade for more`} />
          <StatCard label="Total scans" value={totalScans.toLocaleString()} sub="All time" />
          <StatCard label="Scans this week" value={totalWeek} sub="+18% vs last week" positive />
          <StatCard label="Top city" value="Bangalore" sub="32% of scans" />
        </div>

        {/* Free plan bar */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium mb-0.5">You&apos;re on the Free plan</div>
            <div className="text-xs text-muted-foreground">Using {QRS.length}/3 dynamic QRs · unlimited scans &amp; edits</div>
          </div>
          <Link href="/pricing">
            <Button size="sm">Upgrade to Pro <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: QR list */}
          <div className="lg:col-span-2 space-y-3">
            {QRS.map((q) => (
              <Card
                key={q.id}
                className={[
                  'cursor-pointer transition-all',
                  selected === q.id ? 'border-primary/60 shadow-sm' : 'border-border/70 hover:border-primary/40',
                ].join(' ')}
                onClick={() => setSelected(q.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md bg-muted grid place-items-center shrink-0">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-semibold truncate">{q.title}</div>
                        <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mb-1">
                        <span className="font-mono">qr-sizer.com/r/{q.short}</span> → {q.dest}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3 text-emerald-500" /> {q.scans.toLocaleString()} scans</span>
                        <span className="text-muted-foreground">{q.weekScans} this week</span>
                        <span className="text-muted-foreground">· Created {q.created}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(q) }} title="Edit destination">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`https://qr-sizer.com/r/${q.short}`); toast.success('Link copied') }} title="Copy link">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); toast.info('Delete (preview only)') }} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right: Analytics panel for selected QR */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-1">Selected QR</div>
                <div className="font-semibold mb-3">{selectedQr.title}</div>
                <div className="text-3xl font-bold tabular-nums">{selectedQr.scans.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">total scans</div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Last 30 days</span>
                    <span className="text-emerald-500">+{selectedQr.weekScans * 4}</span>
                  </div>
                  <MiniChart seed={selectedQr.id} />
                </div>

                <div className="mt-5 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Top cities</div>
                  {[
                    { c: 'Bangalore', p: 32 },
                    { c: 'Mumbai', p: 21 },
                    { c: 'Delhi', p: 14 },
                    { c: 'Chennai', p: 9 },
                  ].map((row) => (
                    <div key={row.c} className="flex items-center gap-2 text-xs">
                      <div className="w-20 shrink-0">{row.c}</div>
                      <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${row.p * 2.5}%` }} />
                      </div>
                      <div className="w-10 text-right text-muted-foreground tabular-nums">{row.p}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Devices</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border p-2 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">Mobile</div>
                        <div className="text-muted-foreground">87%</div>
                      </div>
                    </div>
                    <div className="rounded-md border p-2 flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Desktop</div>
                        <div className="text-muted-foreground">13%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-5" onClick={() => toast.info('Full analytics report (preview only)')}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open full report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4" onClick={() => setEditOpen(false)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Edit destination</h3>
                <p className="text-xs text-muted-foreground">
                  This changes where the printed QR redirects to. The QR image itself doesn&apos;t need to be reprinted.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">New destination URL</label>
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={saveEdit}>Save change</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, positive }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold tabular-nums mt-0.5">{value}</div>
        <div className={['text-[11px] mt-0.5', positive ? 'text-emerald-500' : 'text-muted-foreground'].join(' ')}>{sub}</div>
      </CardContent>
    </Card>
  )
}

function MiniChart({ seed }) {
  // Deterministic pseudo-random bars based on seed
  const h = (i) => {
    let x = 0
    for (let k = 0; k < seed.length; k++) x = (x * 31 + seed.charCodeAt(k) + i * 17) % 97
    return 20 + (x % 70)
  }
  const bars = Array.from({ length: 30 }, (_, i) => h(i))
  return (
    <div className="flex items-end gap-0.5 h-20">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${b}%` }} />
      ))}
    </div>
  )
}
