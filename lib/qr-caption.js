// Caption sizing + rendering shared by the single and bulk QR generators.
// Captions are sized by PHYSICAL size for print outputs so they stay readable:
//   - never smaller than ~6.5 pt (2.3 mm) on tiny prints (cards, labels)
//   - ~7.5% of the QR width on larger prints (≈ 21 pt on a 10 cm poster QR)
// Digital outputs keep a proportional 4.5% of the width.

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const MM_PER_PT = 0.3528
const MIN_MM = 2.3 // ≈ 6.5 pt — smallest comfortably readable print size
const SHRINK_FLOOR = 0.75 // auto-shrink long words down to 75% of target, at most
export const MAX_CAPTION_LINES = 3

/** Font size as a fraction of the QR width */
export function captionFontRatio(sizeOpt) {
  if (sizeOpt?.group === 'print' && sizeOpt.cm) {
    const widthMm = sizeOpt.cm * 10
    const fontMm = Math.max(MIN_MM, widthMm * 0.075)
    return Math.min(0.2, fontMm / widthMm)
  }
  return 0.045
}

let _measureCtx = null
function measureCtx() {
  if (!_measureCtx) _measureCtx = document.createElement('canvas').getContext('2d')
  return _measureCtx
}

/**
 * Lays out a caption for a given QR pixel width.
 * Returns font size, line height, padding, wrapped lines and whether text was cut.
 */
export function layoutCaption(text, widthPx, fontRatio) {
  const ctx = measureCtx()
  const padding = Math.round(widthPx * 0.04)
  const maxWidth = widthPx - padding * 2
  let fontPx = Math.max(10, widthPx * fontRatio)
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)

  // Shrink a little if a single word is wider than the available width
  ctx.font = `600 ${fontPx}px ${FONT_STACK}`
  const widest = Math.max(0, ...words.map((w) => ctx.measureText(w).width))
  let shrunk = false
  if (widest > maxWidth) {
    const factor = Math.max(SHRINK_FLOOR, maxWidth / widest)
    fontPx = fontPx * factor
    shrunk = true
    ctx.font = `600 ${fontPx}px ${FONT_STACK}`
  }

  const lines = []
  let cur = ''
  for (const word of words) {
    const t = cur ? cur + ' ' + word : word
    if (ctx.measureText(t).width <= maxWidth) cur = t
    else {
      if (cur) lines.push(cur)
      cur = word
    }
  }
  if (cur) lines.push(cur)

  const shown = lines.slice(0, MAX_CAPTION_LINES)
  const lineHeight = fontPx * 1.25
  const height = padding * 2 + shown.length * lineHeight
  return { fontPx, lineHeight, padding, lines: shown, totalLines: lines.length, truncated: lines.length > MAX_CAPTION_LINES, shrunk, height }
}

/** Human-readable info for the UI (print point size, line count, warnings) */
export function captionInfo(text, sizeOpt, widthPx) {
  if (!text?.trim() || typeof document === 'undefined') return null
  const ratio = captionFontRatio(sizeOpt)
  const isPrint = sizeOpt?.group === 'print'
  const w = isPrint ? 1000 : widthPx || 1024
  const lay = layoutCaption(text, w, ratio)
  const info = { lines: lay.lines.length, truncated: lay.truncated, shrunk: lay.shrunk, isPrint }
  if (isPrint) {
    const mm = (lay.fontPx / w) * sizeOpt.cm * 10
    info.mm = mm
    info.pt = mm / MM_PER_PT
  } else {
    info.px = Math.round(lay.fontPx)
  }
  return info
}

/** Returns a new canvas = QR + caption strip underneath */
export function addCaptionToCanvas(qrCanvas, text, bgColor, fgColor, fontRatio = 0.045) {
  if (!text?.trim()) return qrCanvas
  const w = qrCanvas.width
  const lay = layoutCaption(text, w, fontRatio)
  const out = document.createElement('canvas')
  out.width = w
  out.height = Math.ceil(qrCanvas.height + lay.height)
  const ctx = out.getContext('2d')
  const transparent = !bgColor || bgColor === '#00000000' || bgColor === 'transparent'
  if (!transparent) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, out.width, out.height)
  }
  ctx.drawImage(qrCanvas, 0, 0)
  ctx.font = `600 ${lay.fontPx}px ${FONT_STACK}`
  ctx.fillStyle = fgColor || '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lay.lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, qrCanvas.height + lay.padding + i * lay.lineHeight + lay.lineHeight / 2)
  })
  return out
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function parseViewBox(svg) {
  const m = svg.match(/viewBox="([\d.\s-]+)"/)
  if (!m) return null
  const [x, y, w, h] = m[1].trim().split(/\s+/).map(Number)
  return { x, y, w, h }
}

/** Appends a caption strip to a qrcode-generated SVG (vector text, extends the viewBox) */
export function addCaptionToSvg(svg, text, bgColor, fgColor, fontRatio = 0.045, transparent = false) {
  if (!text?.trim()) return svg
  const vb = parseViewBox(svg)
  if (!vb) return svg
  // Lay out at a virtual 1000px width, then scale to viewBox units
  const virtualW = 1000
  const lay = layoutCaption(text, virtualW, fontRatio)
  const k = vb.w / virtualW
  const capH = lay.height * k
  const newH = vb.h + capH
  const bg = transparent
    ? ''
    : `<rect x="${vb.x}" y="${vb.y + vb.h}" width="${vb.w}" height="${capH}" fill="${bgColor || '#ffffff'}"/>`
  const texts = lay.lines
    .map((line, i) => {
      const y = vb.y + vb.h + (lay.padding + i * lay.lineHeight + lay.lineHeight / 2) * k
      return `<text x="${vb.x + vb.w / 2}" y="${y}" font-family='${FONT_STACK}' font-weight="600" font-size="${lay.fontPx * k}" fill="${fgColor || '#000000'}" text-anchor="middle" dominant-baseline="central">${escapeXml(line)}</text>`
    })
    .join('')
  let out = svg.replace(/viewBox="[\d.\s-]+"/, `viewBox="${vb.x} ${vb.y} ${vb.w} ${newH}"`)
  const wm = out.match(/<svg[^>]*\swidth="([\d.]+)"/)
  if (wm) {
    const wPx = Number(wm[1])
    out = out.replace(/(<svg[^>]*\s)height="[\d.]+"/, `$1height="${(wPx * newH) / vb.w}"`)
  }
  return out.replace(/<\/svg>\s*$/, `${bg}${texts}</svg>`)
}

/** Sets physical cm width on an SVG, keeping the aspect ratio (e.g. with a caption strip) */
export function setSvgPhysicalSize(svg, cm) {
  const vb = parseViewBox(svg)
  const ratio = vb ? vb.h / vb.w : 1
  const hCm = +(cm * ratio).toFixed(3)
  return svg
    .replace(/(<svg[^>]*\s)width="[\d.]+(?:cm)?"/, `$1width="${cm}cm"`)
    .replace(/(<svg[^>]*\s)height="[\d.]+(?:cm)?"/, `$1height="${hCm}cm"`)
}
