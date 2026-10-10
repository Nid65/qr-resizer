// Shared size + use-case recommendations for QR Sizer.
// Print sizes are rendered at 240 px per cm (~610 DPI) — comfortably above the 300 DPI print minimum.

export const SIZES = [
  { id: 256, label: '256 × 256 px', group: 'digital' },
  { id: 512, label: '512 × 512 px', group: 'digital' },
  { id: 1024, label: '1024 × 1024 px', group: 'digital' },
  { id: 2048, label: '2048 × 2048 px', group: 'digital' },
  { id: 150, label: '0.5 × 0.5"  ·  ~1.3 cm', group: 'print', cm: 1.27, inch: 0.5 },
  { id: 300, label: '1 × 1"  ·  ~2.5 cm', group: 'print', cm: 2.54, inch: 1 },
  { id: 480, label: '2 × 2 cm  ·  ~0.8"', group: 'print', cm: 2 },
  { id: 600, label: '2.5 × 2.5 cm  ·  ~1"', group: 'print', cm: 2.5 },
  { id: 720, label: '3 × 3 cm  ·  ~1.2"', group: 'print', cm: 3 },
  { id: 960, label: '4 × 4 cm  ·  ~1.6"', group: 'print', cm: 4 },
  { id: 1200, label: '5 × 5 cm  ·  ~2"', group: 'print', cm: 5 },
  { id: 2400, label: '10 × 10 cm  ·  ~4"', group: 'print', cm: 10 },
  { id: 3600, label: '15 × 15 cm  ·  ~6"', group: 'print', cm: 15 },
]

// Print sizes ordered small -> large (used for the data-density bump)
const PRINT_ORDER = SIZES.filter((s) => s.group === 'print').sort((a, b) => a.cm - b.cm)

export const PRINT_USES = [
  { id: 'screen', label: 'Website, email or social media', group: 'Digital', sizeId: 1024, format: 'png', distance: 'On-screen', why: '1024 px stays sharp on any phone, laptop or social post.', guide: null, friendly: 'Sharing online? 1024 px looks crisp on every phone and laptop — perfect for websites, emails and social posts.' },
  { id: 'presentation', label: 'Presentation / digital signage', group: 'Digital', sizeId: 2048, format: 'png', distance: '1 – 6 m', why: 'High pixel density so the QR stays crisp on projectors and large screens.', guide: 5, friendly: 'Showing it on a big screen? 2048 px keeps every square sharp, so your audience can scan from their seats.' },
  { id: 'business-card', label: 'Business card', group: 'Small print', sizeId: 480, distance: 'A few inches', why: 'The guide minimum for close-up scanning is 2 × 2 cm.', guide: 1, friendly: 'Business cards are scanned up close, so 2 × 2 cm is plenty — it fits neatly beside your details and scans instantly.' },
  { id: 'label', label: 'Small label / sticker', group: 'Small print', sizeId: 300, distance: 'A few inches', why: '1 inch fits small labels while still scanning reliably. Keep the data short.', guide: 9, friendly: 'Tiny labels work best at about 1 inch. Keep your link short so the pattern stays simple and easy to scan.' },
  { id: 'packaging', label: 'Product packaging', group: 'Small print', sizeId: 480, distance: 'Up to arm’s length', why: 'Packaging needs 1 – 2 cm; 2 cm adds safety for curved or glossy surfaces.', guide: 2, friendly: 'On packaging, 2 cm gives phones enough to grab onto — even on curved or shiny surfaces.' },
  { id: 'wristband', label: 'Wristband', group: 'Small print', sizeId: 480, distance: 'Close-up', why: 'Wristbands need at least 2 cm width for reliable scanning.', guide: 12, friendly: 'Wristbands bend and move, so 2 cm wide is the safe minimum for quick, reliable scans.' },
  { id: 'ticket', label: 'Event ticket', group: 'Small print', sizeId: 600, distance: 'Close-up', why: '2.5 cm scans fast at entry gates, even with a logo.', guide: 7, friendly: 'At 2.5 cm, tickets scan in a blink at the entry gate — even with your logo in the middle.' },
  { id: 'flyer', label: 'Flyer, brochure or magazine', group: 'Medium print', sizeId: 720, distance: '30 – 70 cm', why: 'Arm’s-length reading calls for 2 – 3 cm; 3 cm is the safe pick.', guide: 3, friendly: 'People hold flyers at arm’s length, so 3 × 3 cm lets them scan without bringing the page closer.' },
  { id: 'handout', label: 'Handout / educational sheet', group: 'Medium print', sizeId: 600, distance: 'Close-up to arm’s length', why: '2.5 cm suits A4/Letter handouts without dominating the page.', guide: 10, friendly: '2.5 cm is easy to scan on a handout without taking over the page.' },
  { id: 'menu', label: 'Restaurant menu / table tent', group: 'Medium print', sizeId: 1200, distance: 'A few inches', why: 'Menus use 2 – 5 cm; 5 cm lets guests scan instantly from their seat.', guide: 8, friendly: 'Guests scan menus from their seat — 5 × 5 cm makes it effortless, even in dim restaurant lighting.' },
  { id: 'wifi-sign', label: 'WiFi sign / counter card', group: 'Medium print', sizeId: 1200, distance: 'Up to ~50 cm', why: '5 cm is easy to scan from a counter or wall at arm’s length.', guide: null, friendly: 'Guests should be able to scan from the counter or wall — 5 × 5 cm makes joining your WiFi effortless.' },
  { id: 'poster', label: 'Poster / indoor signage', group: 'Large print', sizeId: 2400, format: 'svg', distance: '1 – 3 m', why: 'Posters need 10 – 30 cm (10:1 rule). SVG lets you scale it up without blur.', guide: 4, friendly: 'Posters are scanned from 1 – 3 m away, so go big: 10 cm or more. We picked SVG so you can scale it up without blur.' },
  { id: 'real-estate', label: 'Real estate sign', group: 'Large print', sizeId: 3600, format: 'svg', distance: 'Medium to long', why: 'Yard signs use ~12 – 20 cm (4.75" – 7.75"). SVG keeps edges sharp.', guide: 11, friendly: 'Passers-by scan yard signs from the sidewalk — 15 cm keeps it readable. SVG lets your printer go even bigger.' },
  { id: 'billboard', label: 'Banner / billboard', group: 'Large print', sizeId: 3600, format: 'svg', distance: '10 – 50 m', why: 'Billboards need 1 – 5 m QRs. Download SVG and scale it to final size (10:1 rule).', guide: 6, friendly: 'Billboards are seen from far away — download the SVG and scale it to about 1/10 of the viewing distance.' },
]

export const PRINT_USE_GROUPS = ['Digital', 'Small print', 'Medium print', 'Large print']

// Default use case derived from the QR type
export const TYPE_DEFAULT_USE = {
  url: 'screen',
  text: 'screen',
  email: 'screen',
  phone: 'business-card',
  sms: 'flyer',
  wifi: 'wifi-sign',
  vcard: 'business-card',
  menu: 'menu',
}

export function getUse(id) {
  return PRINT_USES.find((u) => u.id === id) || null
}

export function getSize(id) {
  return SIZES.find((s) => s.id === id) || null
}

/**
 * Returns the recommended size for a use case, bumping small print sizes up one
 * step when the encoded data is dense (e.g. vCards, long URLs).
 */
export function getRecommendation(useId, dataLength = 0) {
  const use = getUse(useId)
  if (!use) return null
  let sizeId = use.sizeId
  let bumped = false
  const base = getSize(sizeId)
  if (base?.group === 'print' && base.cm < 3 && dataLength > 120) {
    const idx = PRINT_ORDER.findIndex((s) => s.id === sizeId)
    const next = PRINT_ORDER[idx + 1]
    if (next) {
      sizeId = next.id
      bumped = true
    }
  }
  return { use, sizeId, size: getSize(sizeId), format: use.format || null, bumped }
}

// 10:1 rule — max reliable scan distance for a given print size
export function scanDistanceLabel(cm) {
  const d = cm * 10
  return d >= 100 ? `${(d / 100).toFixed(d % 100 === 0 ? 0 : 1)} m` : `${Math.round(d)} cm`
}

export function sizeShortLabel(sizeId) {
  const s = getSize(sizeId)
  if (!s) return `${sizeId}px`
  return s.group === 'print' ? `${s.inch ? `${s.inch}"` : `${s.cm} × ${s.cm} cm`}` : `${s.id} px`
}

// Best-guess use case from raw QR content (used by bulk mode when no size/use is given)
export function detectUseFromContent(content) {
  const c = String(content || '').trim()
  if (/^WIFI:/i.test(c)) return 'wifi-sign'
  if (/^BEGIN:VCARD/i.test(c) || /^MECARD:/i.test(c)) return 'business-card'
  if (/menu/i.test(c)) return 'menu'
  return null
}
