'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PRINT_USES,
  PRINT_USE_GROUPS,
  getUse,
  getSize,
  getRecommendation,
  detectUseFromContent,
} from '@/lib/qr-use-cases'
import { addCaptionToCanvas, addCaptionToSvg, setSvgPhysicalSize, captionFontRatio } from '@/lib/qr-caption'
import {
  QrCode,
  Download,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Package,
  Ruler,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

const TEMPLATE_HEADERS = ['content', 'label', 'caption', 'use_case', 'size_px', 'format', 'fg_color', 'bg_color']
const TEMPLATE_ROWS = [
  ['https://your-restaurant.com/menu', 'Menu QR', 'Scan for menu', 'menu', '', 'png', '#000000', '#ffffff'],
  ['WIFI:T:WPA;S:GuestNetwork;P:welcome123;;', 'Guest WiFi', 'Scan to join WiFi', 'wifi-sign', '', 'png', '#000000', '#ffffff'],
  ['tel:+15551234567', 'Sales Line', 'Call sales', 'business-card', '', 'png', '#000000', '#ffffff'],
  ['https://forms.gle/rsvp-form', 'Event RSVP', 'RSVP here', 'poster', '', 'svg', '#1e40af', '#ffffff'],
  ['mailto:hello@example.com', 'Email Us', 'Email us', '', 512, 'png', '#000000', '#ffffff'],
]
const USE_IDS = PRINT_USES.map((u) => u.id)

// Resolve the final size/format for a row, honouring (in order):
// global override -> explicit size_px -> row use_case -> auto-detected use case -> 1024 px
function resolveRow(r, globalUse) {
  const useId = globalUse !== 'per-row' ? globalUse : r.use_case || (!r.size_px_raw ? detectUseFromContent(r.content) : null)
  if (globalUse === 'per-row' && r.size_px_raw) {
    return { ...r, size_px: r.size_px_raw, format: r.format_raw || 'png', use: null, sizeOpt: null, source: 'excel' }
  }
  const rec = useId ? getRecommendation(useId, r.content.length) : null
  if (rec) {
    return {
      ...r,
      size_px: rec.sizeId,
      format: rec.format || r.format_raw || 'png',
      use: rec.use,
      sizeOpt: rec.size?.group === 'print' ? rec.size : null,
      source: globalUse !== 'per-row' ? 'override' : r.use_case ? 'use_case' : 'auto',
    }
  }
  return { ...r, size_px: 1024, format: r.format_raw || 'png', use: null, sizeOpt: null, source: 'default' }
}

function sanitize(s, fallback = 'qr') {
  return String(s || fallback).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50) || fallback
}


export default function BulkQrPage() {
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [zipUrl, setZipUrl] = useState('')
  const [globalUse, setGlobalUse] = useState('per-row')
  const fileRef = useRef(null)
  const resolved = rows.map((r) => resolveRow(r, globalUse))

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ...TEMPLATE_ROWS,
    ])
    // Widen columns for readability
    ws['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }]
    // Second sheet: list of valid use_case values
    const wsUses = XLSX.utils.aoa_to_sheet([
      ['use_case', 'description', 'recommended size'],
      ...PRINT_USES.map((u) => {
        const sz = getSize(u.sizeId)
        return [u.id, u.label, sz?.group === 'print' ? `${sz.cm} x ${sz.cm} cm` : `${sz?.id} px`]
      }),
    ])
    wsUses['!cols'] = [{ wch: 16 }, { wch: 34 }, { wch: 18 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'QRs')
    XLSX.utils.book_append_sheet(wb, wsUses, 'use_case values')
    XLSX.writeFile(wb, 'qr-sizer-bulk-template.xlsx')
    toast.success('Template downloaded')
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setZipUrl('')
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const cleaned = raw
        .map((r, idx) => ({
          idx: idx + 2,
          content: String(r.content || '').trim(),
          label: String(r.label || `qr-${idx + 1}`).trim(),
          caption: String(r.caption || '').trim(),
          use_case: USE_IDS.includes(String(r.use_case || '').trim().toLowerCase()) ? String(r.use_case).trim().toLowerCase() : '',
          size_px_raw: parseInt(r.size_px, 10) ? Math.max(128, Math.min(4096, parseInt(r.size_px, 10))) : 0,
          format_raw: (['png', 'svg'].includes(String(r.format || '').toLowerCase())) ? String(r.format).toLowerCase() : '',
          fg_color: String(r.fg_color || '#000000').trim(),
          bg_color: String(r.bg_color || '#ffffff').trim(),
          error: '',
        }))
        .filter((r) => r.content)
      if (!cleaned.length) {
        toast.error('No valid rows found. Make sure the "content" column has values.')
        setRows([])
        return
      }
      setRows(cleaned)
      toast.success(`${cleaned.length} rows loaded — ready to generate`)
    } catch (err) {
      toast.error('Could not read the Excel file: ' + (err?.message || 'unknown error'))
    }
    e.target.value = ''
  }

  const generateAll = async () => {
    if (!rows.length) return
    setBusy(true)
    setZipUrl('')
    setProgress({ done: 0, total: rows.length })
    const zip = new JSZip()
    const opts = { errorCorrectionLevel: 'H', margin: 2 }
    const updated = [...rows]
    for (let i = 0; i < rows.length; i++) {
      const r = resolveRow(rows[i], globalUse)
      try {
        if (r.format === 'svg') {
          let svg = await QRCode.toString(r.content, {
            ...opts,
            type: 'svg',
            width: r.size_px,
            color: { dark: r.fg_color, light: r.bg_color },
          })
          if (r.caption) svg = addCaptionToSvg(svg, r.caption, r.bg_color, r.fg_color, captionFontRatio(r.sizeOpt))
          if (r.sizeOpt) svg = setSvgPhysicalSize(svg, r.sizeOpt.cm)
          zip.file(`${String(i + 1).padStart(3, '0')}-${sanitize(r.label)}.svg`, svg)
        } else {
          const canvas = document.createElement('canvas')
          await QRCode.toCanvas(canvas, r.content, {
            ...opts,
            width: r.size_px,
            color: { dark: r.fg_color, light: r.bg_color },
          })
          const final = r.caption ? addCaptionToCanvas(canvas, r.caption, r.bg_color, r.fg_color, captionFontRatio(r.sizeOpt)) : canvas
          const blob = await new Promise((resolve) => final.toBlob(resolve, 'image/png'))
          zip.file(`${String(i + 1).padStart(3, '0')}-${sanitize(r.label)}.png`, blob)
        }
      } catch (err) {
        updated[i] = { ...updated[i], error: err?.message || 'Failed' }
      }
      setProgress({ done: i + 1, total: rows.length })
    }
    setRows(updated)
    // Add a manifest CSV to the ZIP
    const manifest = [
      ['file', 'label', 'content', 'caption', 'use_case', 'print_size', 'size_px', 'format'],
      ...updated.map((row, i) => resolveRow(row, globalUse)).map((r, i) => [
        `${String(i + 1).padStart(3, '0')}-${sanitize(r.label)}.${r.format}`,
        r.label,
        r.content,
        r.caption,
        r.use?.id || '',
        r.sizeOpt ? `${r.sizeOpt.cm} x ${r.sizeOpt.cm} cm` : '',
        r.size_px,
        r.format,
      ]),
    ]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    zip.file('_manifest.csv', manifest)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    setZipUrl(url)
    setBusy(false)
    toast.success(`${rows.length} QR codes ready to download`)
  }

  const downloadZip = () => {
    if (!zipUrl) return
    const a = document.createElement('a')
    a.href = zipUrl
    a.download = `qr-sizer-bulk-${new Date().toISOString().slice(0, 10)}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const removeRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const resetAll = () => {
    setRows([])
    setFileName('')
    setZipUrl('')
    setProgress({ done: 0, total: 0 })
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
            <Link href="/create" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              Single QR
            </Link>
            <Link href="/create/bulk" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 h-9 text-sm font-medium">
              Bulk
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-14 pb-6 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Generate hundreds of QR codes at once
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Bulk QR Code <span className="text-primary">Generator</span>
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
          Upload an Excel file with your URLs and labels. Download every QR as one ZIP.
          Perfect for events, table tents, product batches, and mass mailings.
        </p>
      </section>

      {/* Workspace */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 md:p-6 space-y-6">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold shrink-0">1</div>
                <div>
                  <div className="font-medium text-sm">Download the Excel template</div>
                  <div className="text-xs text-muted-foreground">Columns: <span className="font-mono">content, label, caption, use_case, size_px, format, fg_color, bg_color</span>. Leave <span className="font-mono">size_px</span> blank to auto-size from <span className="font-mono">use_case</span>.</div>
                </div>
              </div>
              <Button onClick={downloadTemplate} variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Download template (.xlsx)
              </Button>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold shrink-0">2</div>
                <div>
                  <div className="font-medium text-sm">Fill it in &amp; upload</div>
                  <div className="text-xs text-muted-foreground">
                    Each row = one QR. {fileName ? <span className="text-foreground">Loaded: <strong>{fileName}</strong></span> : 'Excel .xlsx or .xls.'}
                  </div>
                </div>
              </div>
              <Button onClick={() => fileRef.current?.click()} variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Upload filled Excel
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={onFile}
              />
            </div>

            {/* Use-case override */}
            {rows.length > 0 && (
              <div className="rounded-lg border p-4 bg-muted/20 flex flex-col md:flex-row md:items-center gap-3" data-testid="bulk-use-case-panel">
                <div className="flex items-start gap-3 flex-1">
                  <Ruler className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Where will you print these?</div>
                    <div className="text-xs text-muted-foreground">
                      {globalUse === 'per-row'
                        ? 'Using each row\u2019s size_px / use_case. WiFi and vCard rows without a size are auto-sized.'
                        : (() => {
                            const u = getUse(globalUse)
                            const sz = getSize(u?.sizeId)
                            return `All ${rows.length} QRs set to ${sz?.group === 'print' ? `${sz.cm} × ${sz.cm} cm` : `${sz?.id} px`}${u?.format ? ` · ${u.format.toUpperCase()}` : ''} — ${u?.friendly || u?.why}`
                          })()}{' '}
                      <Link
                        href={globalUse !== 'per-row' && getUse(globalUse)?.guide ? `/qr-size-guide#use-case-${getUse(globalUse).guide}` : '/qr-size-guide'}
                        className="font-medium text-primary hover:underline underline-offset-2"
                      >
                        Learn more in our Size Guide →
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="md:w-72">
                  <Select value={globalUse} onValueChange={(v) => { setGlobalUse(v); setZipUrl('') }}>
                    <SelectTrigger data-testid="bulk-use-case-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-row">Per row (from Excel)</SelectItem>
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
              </div>
            )}

            {/* Rows table */}
            {rows.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-muted/40">
                  <div className="text-sm">
                    <strong>{rows.length}</strong> rows ready
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={resetAll}><Trash2 className="h-3.5 w-3.5 mr-1" /> Clear</Button>
                    <Button size="sm" onClick={generateAll} disabled={busy}>
                      {busy ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Generating {progress.done}/{progress.total}</>
                      ) : (
                        <><Package className="h-3.5 w-3.5 mr-1" /> Generate {rows.length} QR codes</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="max-h-[380px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/20 sticky top-0">
                      <tr className="text-left">
                        <th className="p-2 font-medium">#</th>
                        <th className="p-2 font-medium">Label</th>
                        <th className="p-2 font-medium">Content</th>
                        <th className="p-2 font-medium">Caption</th>
                        <th className="p-2 font-medium">Size</th>
                        <th className="p-2 font-medium">Format</th>
                        <th className="p-2 font-medium">Colors</th>
                        <th className="p-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolved.map((r, i) => (
                        <tr key={i} className={['border-t', r.error ? 'bg-destructive/5' : ''].join(' ')}>
                          <td className="p-2 text-muted-foreground">{i + 1}</td>
                          <td className="p-2 font-medium">{r.label}</td>
                          <td className="p-2 font-mono max-w-[240px] truncate" title={r.content}>{r.content}</td>
                          <td className="p-2 text-muted-foreground max-w-[140px] truncate" title={r.caption}>{r.caption || '—'}</td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="font-medium">{r.sizeOpt ? `${r.sizeOpt.cm} × ${r.sizeOpt.cm} cm` : `${r.size_px}px`}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {r.use ? r.use.label : r.source === 'excel' ? 'From Excel' : 'Default'}
                              {r.source === 'auto' ? ' · auto-detected' : ''}
                            </div>
                          </td>
                          <td className="p-2 uppercase">{r.format}</td>
                          <td className="p-2 flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-sm border" style={{ background: r.fg_color }} />
                            <span className="inline-block h-3 w-3 rounded-sm border" style={{ background: r.bg_color }} />
                          </td>
                          <td className="p-2">
                            {r.error ? (
                              <span className="text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {r.error}</span>
                            ) : (
                              <button className="text-muted-foreground hover:text-destructive" onClick={() => removeRow(i)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 3 - Download */}
            {zipUrl && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">All done — {rows.length} QR codes generated</div>
                    <div className="text-xs text-muted-foreground">The ZIP also includes a <span className="font-mono">_manifest.csv</span> mapping each file to its content.</div>
                  </div>
                </div>
                <Button onClick={downloadZip} size="lg">
                  <Download className="h-4 w-4 mr-2" /> Download ZIP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 py-14 border-t border-border/60">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">When bulk QR generation saves the day</h2>
          <p className="text-muted-foreground mt-3">Anywhere you need 10+ unique QRs at once. Fill an Excel, click one button, get a ZIP.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            { t: 'Restaurant table tents', d: 'Generate one unique QR per table so each order/feedback links directly to a specific table number.' },
            { t: 'Product SKUs & packaging', d: 'One QR per SKU pointing to that product\u2019s page, manual, warranty form, or reorder link.' },
            { t: 'Event badges & tickets', d: 'Personalized QR per attendee for check-in, seat assignment, or unique landing pages.' },
            { t: 'Real-estate listings', d: 'One QR per property linking to its listing page, tour video, or floor plan PDF.' },
            { t: 'Business card batches', d: 'Generate vCard QRs for every team member in one go — no manual copy-paste.' },
            { t: 'Museum &amp; gallery labels', d: 'A QR per exhibit pointing to background info, audio guide, or the artist\u2019s bio.' },
            { t: 'Retail shelf tags', d: 'Per-item QRs for reviews, ingredient info, allergen warnings, or reorder pages.' },
            { t: 'Multi-location WiFi', d: 'One WiFi QR per store, café, or Airbnb — each pre-baked with the right SSID + password.' },
            { t: 'Coupon &amp; promo campaigns', d: 'Batch-generate individual promo codes so you can track redemptions per code.' },
          ].map((u) => (
            <Card key={u.t} className="border-border/70">
              <CardContent className="p-5">
                <div className="font-semibold mb-1">{u.t}</div>
                <div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: u.d }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-14 border-t border-border/60">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Bulk QR generator FAQ</h2>
        </div>
        <div className="max-w-3xl mx-auto grid gap-3">
          {[
            { q: 'How many QRs can I generate at once?', a: 'There is no hard limit — the whole process runs in your browser. In practice, 500 QRs at 1024px take about 30 seconds. Larger batches work but may be slow on older devices.' },
            { q: 'What Excel columns are supported?', a: 'content (required — the URL or data to encode), label (used in the filename), caption (optional text rendered below the QR in PNG and SVG, auto-sized to stay readable at the print size), use_case (e.g. business-card, menu, flyer, poster — auto-picks the recommended print size; full list in the template’s second sheet), size_px (128 to 4096, overrides use_case), format (png or svg), fg_color and bg_color (hex codes).' },
            { q: 'What content types can I use in bulk?', a: 'Anything a QR can encode: URLs, plain text, tel:+123 phone numbers, mailto:you@example.com emails, sms:, WIFI:T:WPA;S:name;P:pass;; strings, or full vCard blocks. Same as the single QR generator.' },
            { q: 'What is inside the downloaded ZIP?', a: 'One file per row named 001-your-label.png (or .svg), plus a _manifest.csv listing every generated file with its original content — great for audits and records.' },
            { q: 'Are these dynamic or static QR codes?', a: 'Bulk generates static QR codes only. The content is encoded directly into each QR image. They work forever and never expire.' },
            { q: 'Is my data uploaded to a server?', a: 'No. The Excel file is parsed in your browser, QRs are rendered in your browser, and the ZIP is built in your browser. Nothing is transmitted to us.' },
            { q: 'Can I include captions or objectives below each QR?', a: 'Yes — fill the "caption" column in the template. The caption is rendered under each PNG (up to ~60 characters, auto-wraps to 3 lines).' },
            { q: 'Does bulk support logos or transparent backgrounds?', a: 'Not in this first version — bulk keeps things fast and consistent. Use the single QR generator when you need logos, transparent backgrounds, or per-QR customization.' },
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

      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>QR Sizer · Bulk generator</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground">Resize</Link>
            <Link href="/create" className="hover:text-foreground">Single</Link>
            <Link href="/create/bulk" className="hover:text-foreground">Bulk</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
