'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CreditCard, Smartphone, RotateCcw, Ruler } from 'lucide-react'
import { scanDistanceLabel } from '@/lib/qr-use-cases'

// Real-world reference objects (mm)
const CARD = { w: 85.6, h: 53.98, r: 3.2 } // ISO/IEC 7810 ID-1 (bank / credit card)
const PHONE = { w: 71.5, h: 147, r: 9 } // typical modern smartphone
const DEFAULT_PX_PER_MM = 96 / 25.4 // CSS reference pixel
const STORAGE_KEY = 'qrsizer_px_per_mm'

export default function RealSizePreview({ open, onOpenChange, imageUrl, cm, label, bgTransparent }) {
  const [pxPerMm, setPxPerMm] = useState(DEFAULT_PX_PER_MM)
  const [reference, setReference] = useState('card')
  const [imgRatio, setImgRatio] = useState(1)

  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(STORAGE_KEY))
      if (saved > 1 && saved < 12) setPxPerMm(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (open) setReference(cm > 6 ? 'phone' : 'card')
  }, [open, cm])

  useEffect(() => {
    if (!imageUrl) return
    const img = new window.Image()
    img.onload = () => setImgRatio(img.naturalHeight / img.naturalWidth || 1)
    img.src = imageUrl
  }, [imageUrl])

  const updateScale = (v) => {
    setPxPerMm(v)
    try { localStorage.setItem(STORAGE_KEY, String(v)) } catch {}
  }
  const resetScale = () => updateScale(DEFAULT_PX_PER_MM)

  const mm = (v) => v * pxPerMm
  const qrW = mm(cm * 10)
  const qrH = qrW * imgRatio
  const ref = reference === 'card' ? CARD : PHONE
  const calibrated = Math.abs(pxPerMm - DEFAULT_PX_PER_MM) > 0.01

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto" data-testid="real-size-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" /> Real-size preview · {label}
          </DialogTitle>
          <DialogDescription>
            This is how big your QR will be when printed, shown next to an everyday object. Scans reliably from up to
            {' '}<strong className="text-foreground">~{scanDistanceLabel(cm)}</strong> away.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Compare with:</span>
          <Button size="sm" variant={reference === 'card' ? 'default' : 'outline'} onClick={() => setReference('card')} data-testid="ref-card">
            <CreditCard className="h-4 w-4 mr-1.5" /> Credit card
          </Button>
          <Button size="sm" variant={reference === 'phone' ? 'default' : 'outline'} onClick={() => setReference('phone')} data-testid="ref-phone">
            <Smartphone className="h-4 w-4 mr-1.5" /> Phone
          </Button>
        </div>

        {/* Stage */}
        <div className="rounded-xl border bg-muted/30 p-6 overflow-auto">
          <div className="flex items-end gap-8 min-w-max">
            {/* Reference object */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {reference === 'card' ? (
                <div
                  className="relative border-2 border-dashed border-foreground/40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
                  style={{ width: mm(ref.w), height: mm(ref.h), borderRadius: mm(ref.r) }}
                  data-testid="ref-object"
                >
                  <div className="absolute rounded-sm bg-amber-300/80 border border-amber-500/50" style={{ left: mm(8), top: mm(18), width: mm(11), height: mm(8.5) }} />
                  <div className="absolute font-mono text-foreground/50 tracking-widest" style={{ left: mm(8), bottom: mm(12), fontSize: mm(3.6) }}>•••• •••• •••• 4242</div>
                  <div className="absolute text-foreground/40 font-semibold" style={{ right: mm(6), top: mm(5), fontSize: mm(3) }}>BANK</div>
                </div>
              ) : (
                <div
                  className="relative border-[3px] border-foreground/60 bg-foreground/5 p-[3px]"
                  style={{ width: mm(ref.w), height: mm(ref.h), borderRadius: mm(ref.r) }}
                  data-testid="ref-object"
                >
                  <div className="h-full w-full bg-background/80" style={{ borderRadius: mm(ref.r - 1.5) }} />
                  <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-foreground/60" style={{ top: mm(3), width: mm(18), height: mm(4) }} />
                </div>
              )}
              <div className="text-[11px] text-muted-foreground">
                {reference === 'card' ? 'Credit card · 8.6 × 5.4 cm' : 'Phone · ~7 × 15 cm'}
              </div>
            </div>

            {/* QR at real size */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="outline outline-1 outline-dashed outline-primary/60"
                style={{
                  width: qrW,
                  height: qrH,
                  backgroundImage: bgTransparent
                    ? 'linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)'
                    : undefined,
                  backgroundSize: '12px 12px',
                }}
                data-testid="real-size-qr"
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="QR at real printed size" className="block w-full h-full" />
                ) : null}
              </div>
              {/* cm ruler */}
              <div
                className="h-3 border-x border-b border-foreground/50"
                style={{
                  width: qrW,
                  backgroundImage: 'repeating-linear-gradient(to right, hsl(var(--foreground) / 0.5) 0 1px, transparent 1px 100%)',
                  backgroundSize: `${mm(10)}px 100%`,
                }}
              />
              <div className="text-[11px] font-medium text-primary">Your QR · {label}</div>
            </div>
          </div>
        </div>

        {/* Calibration */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Make it exact for your screen</div>
            {calibrated && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetScale}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Screens differ in size. Hold a real bank card against the outline above and slide until it matches — we’ll
            remember it on this device.
          </p>
          <Slider
            value={[pxPerMm]}
            min={2}
            max={8}
            step={0.01}
            onValueChange={(v) => { setReference('card'); updateScale(v[0]) }}
            data-testid="calibration-slider"
          />
          <p className="text-[11px] text-muted-foreground">
            Not sure what size you need? <Link href="/qr-size-guide" className="text-primary font-medium hover:underline underline-offset-2">Learn more in our Size Guide →</Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
