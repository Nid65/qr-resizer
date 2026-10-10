'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Table2, Check } from 'lucide-react'
import { PRINT_USES, PRINT_USE_GROUPS, getSize, scanDistanceLabel } from '@/lib/qr-use-cases'

function sizeText(sizeId) {
  const s = getSize(sizeId)
  if (!s) return ''
  return s.group === 'print' ? s.label.split('·')[0].trim() : `${s.id} px`
}

/**
 * Compact, collapsible size chart: use case -> scan distance -> recommended size.
 * Clicking a row selects that use case.
 */
export default function SizeChart({ activeUseId, onSelect, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border" data-testid="size-chart">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium hover:bg-muted/40 rounded-lg"
        data-testid="size-chart-toggle"
      >
        <span className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-primary" /> QR size chart — which size for what?
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t">
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-2 font-medium">Use case</th>
                  <th className="p-2 font-medium">Scan distance</th>
                  <th className="p-2 font-medium">Recommended</th>
                </tr>
              </thead>
              <tbody>
                {PRINT_USE_GROUPS.map((g) => (
                  <FragmentGroup key={g} group={g} activeUseId={activeUseId} onSelect={onSelect} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>Tap a row to use that size. Rule of thumb: scan distance ÷ 10 = minimum QR width.</span>
            <Link href="/qr-size-guide" className="font-medium text-primary hover:underline underline-offset-2">
              Learn more in our Size Guide →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function FragmentGroup({ group, activeUseId, onSelect }) {
  const items = PRINT_USES.filter((u) => u.group === group)
  return (
    <>
      <tr>
        <td colSpan={3} className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
          {group}
        </td>
      </tr>
      {items.map((u) => {
        const active = u.id === activeUseId
        const s = getSize(u.sizeId)
        return (
          <tr
            key={u.id}
            onClick={() => onSelect?.(u.id)}
            className={`border-t cursor-pointer transition-colors ${active ? 'bg-primary/10' : 'hover:bg-muted/40'}`}
            data-testid={`size-chart-row-${u.id}`}
          >
            <td className="p-2 font-medium">
              <span className="flex items-center gap-1.5">
                {active && <Check className="h-3 w-3 text-primary" />}
                {u.label}
              </span>
            </td>
            <td className="p-2 text-muted-foreground">{u.distance}</td>
            <td className="p-2 whitespace-nowrap">
              <span className="font-medium text-foreground">{sizeText(u.sizeId)}</span>
              {u.format && <span className="ml-1 text-muted-foreground">· {u.format.toUpperCase()}</span>}
              {s?.group === 'print' && (
                <div className="text-[10px] text-muted-foreground">scans up to ~{scanDistanceLabel(s.cm)}</div>
              )}
            </td>
          </tr>
        )
      })}
    </>
  )
}
