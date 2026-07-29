import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://qr-sizer.com'

const TITLE = 'QR Sizer — Create, Resize & Share QR Codes (Free · No Signup)'
const DESCRIPTION =
  'Free online QR code platform. Create custom QR codes with your logo and brand colors, or resize an existing blurry QR into a crisp high-resolution PNG or SVG. Print sizes from 2 cm business cards to 5 cm labels. 100% browser-based, nothing ever uploaded. No signup, no ads, no expiry.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | QR Sizer',
  },
  description: DESCRIPTION,
  applicationName: 'QR Sizer',
  authors: [{ name: 'Nid65', url: 'https://github.com/Nid65' }],
  creator: 'Nid65',
  publisher: 'Nid65',
  keywords: [
    'QR resizer',
    'QR code resizer',
    'resize QR code',
    'small QR code',
    'smallest QR code size',
    'QR code 2cm',
    '2x2 cm QR code',
    'QR code for business card',
    'QR code for print',
    'print QR code',
    'QR code 300 DPI',
    'upscale QR code',
    'QR code high resolution',
    'QR code PNG',
    'QR code SVG',
    'regenerate QR code',
    'QR code enhancer',
    'QR code optimizer',
    'fix blurry QR code',
    'QR code print quality',
    'free QR code tool',
    'browser QR tool',
  ],
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'QR Sizer',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'QR Sizer — Create, resize and share QR codes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.svg'],
    creator: '@Nid65',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  verification: {
    // Add your codes here once you verify with Search Console / Bing.
    // google: 'xxxxx',
    // yandex: 'xxxxx',
  },
}

export const viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QR Sizer',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any (web browser)',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  url: SITE_URL,
  description: DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Decode existing QR code images (PNG, JPG, JPEG up to 10 MB)',
    'Regenerate QR codes at 256, 512, 1024, or 2048 px',
    'Export as PNG or SVG',
    'Auto-detects QR type (URL, Email, Phone, WiFi, SMS, Text, and more)',
    '100% client-side — images never leave the browser',
    'No signup, no ads, no tracking of QR contents',
  ],
  author: {
    '@type': 'Person',
    name: 'Nid65',
    url: 'https://github.com/Nid65',
  },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I resize a QR code online for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload your existing QR code image to QR Sizer, wait a moment for it to be decoded, choose your desired size (up to 2048 pixels) and format (PNG or SVG), and click Download. The whole process is 100% free, requires no signup, and completes in under 30 seconds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is QR Sizer really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — QR Sizer is completely free with no ads, no watermarks, no signup, and no usage limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I make a blurry QR code sharp again?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. QR Sizer decodes the QR content and regenerates a brand-new, mathematically perfect QR code at whatever resolution you choose, so a blurry screenshot can become a razor-sharp 2048×2048 pixel print-ready image.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my QR code data uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Everything — decoding, type detection, and regeneration — happens locally in your browser. Your QR image and its decoded content never leave your device.',
      },
    },
    {
      '@type': 'Question',
      name: 'What image formats can I upload?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can upload PNG, JPG, or JPEG images up to 10 MB.',
      },
    },
    {
      '@type': 'Question',
      name: 'PNG or SVG — which format should I choose?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Choose PNG for social media, websites, screens, and most printing needs. Choose SVG when you need infinite scalability without any quality loss — ideal for large banners, packaging, and business cards.',
      },
    },
    {
      '@type': 'Question',
      name: 'What sizes can I export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Two categories: Digital (256, 512, 1024, or 2048 pixels for screens, social media, and websites) and Print (2, 2.5, 3, 4, or 5 cm at 300 DPI for business cards, product labels, stickers and print media). Export as SVG for unlimited scaling.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the smallest scannable QR code size?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The generally accepted minimum is 2 x 2 cm (0.8 x 0.8 inches) when scanned from about 20 cm away. QR Sizer lets you regenerate at exact print sizes — 2 cm, 2.5 cm, 3 cm, 4 cm and 5 cm — at 300 DPI so the printed code stays crisp and scannable.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I make a QR code the right size for a business card?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pick 2 x 2 cm or 2.5 x 2.5 cm from the size selector. QR Sizer generates the QR at 300 DPI which prints sharply at business-card size. For zero pixelation at any size, choose SVG format.',
      },
    },
    {
      '@type': 'Question',
      name: 'What DPI should a QR code be printed at?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aim for at least 300 DPI. QR Sizer\u2019s print sizes are pre-calculated at 300 DPI so you can drop them into any print layout without doing the math yourself.',
      },
    },
  ],
}

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to resize a QR code online',
  description:
    'Resize an existing QR code image to a higher resolution (up to 2048×2048 PNG or scalable SVG) for free in your browser.',
  totalTime: 'PT30S',
  supply: [{ '@type': 'HowToSupply', name: 'An existing QR code image (PNG, JPG, or JPEG)' }],
  tool: [{ '@type': 'HowToTool', name: 'A modern web browser' }],
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload the QR image', text: 'Drag and drop your PNG, JPG or JPEG QR code into the upload area, or click to browse.' },
    { '@type': 'HowToStep', position: 2, name: 'Automatic decoding', text: 'QR Sizer reads the QR code locally and displays the decoded content and detected type.' },
    { '@type': 'HowToStep', position: 3, name: 'Choose size and format', text: 'Select an output size (256–2048 px) and format (PNG or SVG).' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Click Download to save your freshly generated, high-resolution QR code.' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
