export const metadata = {
  title: 'Bulk QR Code Generator — Create Hundreds of QR Codes from Excel · Free',
  description:
    'Free bulk QR code generator. Upload an Excel file with URLs, labels, and captions — download every QR code as one ZIP in seconds. Perfect for restaurant table tents, product SKUs, event badges, real-estate listings, and any campaign needing 10+ unique QR codes. 100% browser-based, no signup, no watermark.',
  keywords: [
    'bulk QR code generator',
    'bulk QR generator',
    'batch QR code generator',
    'generate multiple QR codes',
    'QR codes from Excel',
    'QR code generator from spreadsheet',
    'CSV to QR code',
    'Excel to QR code bulk',
    'mass QR code generator',
    'bulk QR code download',
    'QR code generator for restaurants',
    'QR code for table tents',
    'QR code for product SKUs',
    'QR code for event badges',
    'batch generate QR codes free',
    'multiple QR codes at once',
    'bulk QR ZIP download',
    'QR code batch tool',
  ],
  alternates: { canonical: '/create/bulk' },
  openGraph: {
    title: 'Bulk QR Code Generator — Create Hundreds of QR Codes from Excel',
    description:
      'Upload Excel, generate hundreds of custom QR codes at once, download as ZIP. Free, no signup, browser-based.',
    url: '/create/bulk',
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'QR Sizer — Bulk QR code generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk QR Code Generator — Free Excel-to-QR Batch Tool',
    description: 'Upload an Excel, download hundreds of QR codes as a ZIP.',
    images: ['/og.svg'],
  },
}

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QR Sizer — Bulk QR Code Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  url: 'https://qr-sizer.com/create/bulk',
  description:
    'Free bulk QR code generator. Upload Excel with rows of URLs, labels, colors, and captions — download all generated QR codes as one ZIP. 100% browser-based.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Generate hundreds of QR codes at once from an Excel file',
    'Custom label, caption, size, format, and colors per row',
    'PNG or SVG output',
    'Download all QR codes as a single ZIP',
    'Includes _manifest.csv audit file mapping each file to its content',
    '100% client-side — spreadsheet never leaves your browser',
    'No signup, no ads, no watermark',
  ],
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I generate multiple QR codes from Excel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Download the QR Sizer Excel template, fill in one row per QR code (URL, label, caption, size, colors), upload the file, and click "Generate". All QR codes are packaged into a single ZIP with numbered filenames and a manifest CSV. Everything runs in your browser — free, no signup.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I generate hundreds of QR codes at once for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. QR Sizer\'s bulk generator has no hard limit — most bulk jobs of 500 QR codes at 1024 pixels complete in under 30 seconds, all inside your browser. There is no signup, no watermark, and no per-QR cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'What Excel columns does the bulk QR generator support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The template has 7 columns: content (URL or data), label (used in filename), caption (rendered under each PNG), size_px (128–4096), format (png or svg), fg_color (hex), and bg_color (hex).',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the bulk QR generator free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — completely free. No signup, no ads, no watermarks, no per-QR fee. Everything runs locally in your browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I generate QR codes for restaurant table tents in bulk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Fill one row per table in the Excel template (label them Table-01, Table-02, etc. with individual URLs like example.com/menu?table=1). Upload, generate, and print — one QR per table in seconds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I generate QR codes for product SKUs in bulk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — great for e-commerce, retail, and warehouses. Put one SKU per row, add the URL that each SKU should link to (product page, warranty form, reorder link), and download all QRs as a ZIP for printing on packaging or shelf labels.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the ZIP download?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A PNG or SVG file for every row (named like 001-your-label.png), plus a _manifest.csv listing every generated file with its original content, caption, size, and format — perfect for audit trails and record-keeping.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are these dynamic or static QR codes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The bulk generator produces static QR codes only — the destination is encoded directly into each QR image. They work forever and never expire. Dynamic QR codes (with editable destinations and scan analytics) are coming soon.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my Excel data uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Your spreadsheet is parsed in your browser, all QR codes are rendered in your browser, and the ZIP is built in your browser. Nothing is transmitted, stored, or logged on any server.',
      },
    },
  ],
}

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to generate bulk QR codes from an Excel file',
  description:
    'Generate hundreds of unique QR codes at once by uploading an Excel spreadsheet, then download all of them as a single ZIP.',
  totalTime: 'PT2M',
  supply: [{ '@type': 'HowToSupply', name: 'An Excel file (.xlsx) with your list of URLs and labels' }],
  tool: [{ '@type': 'HowToTool', name: 'A modern web browser' }],
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Download the Excel template', text: 'Click "Download template" to get a pre-formatted .xlsx file with 7 columns and example rows.' },
    { '@type': 'HowToStep', position: 2, name: 'Fill in your rows', text: 'One row per QR code. Enter the URL/content, label, optional caption, size, format, and colors.' },
    { '@type': 'HowToStep', position: 3, name: 'Upload the filled Excel', text: 'Click "Upload filled Excel" and select the file. QR Sizer parses it in your browser and shows a preview.' },
    { '@type': 'HowToStep', position: 4, name: 'Generate all QR codes', text: 'Click "Generate N QR codes". Watch the progress counter as each QR is rendered.' },
    { '@type': 'HowToStep', position: 5, name: 'Download ZIP', text: 'Click "Download ZIP" to get all QR codes plus a manifest CSV in one archive.' },
  ],
}

export default function BulkLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      {children}
    </>
  )
}
