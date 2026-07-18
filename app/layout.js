import './globals.css'
import { Providers } from './providers'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://qr-resizer.vercel.app'

const TITLE = 'QR Resizer — Regenerate any QR code in high quality (PNG & SVG)'
const DESCRIPTION =
  'Free online QR code resizer. Upload any blurry or low-resolution QR code image and instantly regenerate a crisp, high-resolution PNG or SVG up to 2048×2048 px. 100% browser-based — nothing is ever uploaded to a server. No signup, no ads.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | QR Resizer',
  },
  description: DESCRIPTION,
  applicationName: 'QR Resizer',
  authors: [{ name: 'Nid65', url: 'https://github.com/Nid65' }],
  creator: 'Nid65',
  publisher: 'Nid65',
  keywords: [
    'QR resizer',
    'QR code resizer',
    'resize QR code',
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
    siteName: 'QR Resizer',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'QR Resizer — Regenerate any QR code in high quality',
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
  name: 'QR Resizer',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
