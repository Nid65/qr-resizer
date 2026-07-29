export const metadata = {
  title: 'Static QR Code Generator with Logo — Free, Never Expires · QR Sizer',
  description:
    'Free static QR code generator with logo. Create custom QR codes for URLs, WiFi, business cards, food menus, and more. Add brand colors, transparent background. Print sizes from 2 cm to 5 cm. 100% browser-based, no signup, no ads. Static QR codes never expire and never depend on our server.',
  keywords: [
    'static QR code generator',
    'static QR code',
    'permanent QR code',
    'QR code that never expires',
    'QR code generator with logo',
    'QR code with logo',
    'create QR code with logo',
    'add logo to QR code',
    'custom logo QR code',
    'branded QR code',
    'QR code generator',
    'free QR code generator',
    'create QR code',
    'generate QR code',
    'custom QR code',
    'colored QR code',
    'transparent QR code',
    'WiFi QR code generator',
    'vCard QR code generator',
    'business card QR code',
    'food menu QR code',
    'QR code maker',
    'QR code creator online',
    'no signup QR generator',
    'permanent QR code',
    'static QR code',
    'QR code PNG SVG',
  ],
  alternates: { canonical: '/create' },
  openGraph: {
    title: 'Free QR Code Generator — Custom QR Codes with Logo & Colors',
    description:
      'Create custom QR codes with your logo and brand colors. 100% free, no signup, no expiry. Export as PNG or SVG.',
    url: '/create',
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'QR Sizer — free QR code generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Code Generator — Custom QR Codes with Logo & Colors',
    description: 'Create custom QR codes with your logo and brand colors. 100% free, no signup, no expiry.',
    images: ['/og.svg'],
  },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I generate a QR code with a logo for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fill in your content (URL, WiFi, business card, etc.), click "Upload logo" in the Style section, pick a PNG, JPG or SVG file, then click Download. QR Sizer automatically raises the error-correction level to H so your QR still scans reliably with the logo in the center. Most QR generators charge for logo overlays — here it is always free with no watermark or signup.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create a QR code for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pick a QR type (URL, text, email, phone, SMS, WiFi, business card, or food menu), fill in the fields, optionally customize the colors and add a logo, then click Download. The whole thing runs in your browser — no signup, no ads, no expiry.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do QR codes created here expire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. These are static QR codes — the content is encoded directly into the QR image itself. They will keep working forever, even if this website disappears. That is different from "dynamic" QR codes from paid services, which route through a company server and can stop working if you cancel or the service shuts down.',
      },
    },
    {
      '@type': 'Question',
      name: 'How big should the logo be on my QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QR Sizer sizes the logo automatically to about 22% of the QR area — the sweet spot for scannability. With error-correction level H, up to about 30% of the QR can be obscured, so there is a small safety margin.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use custom colors on my QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — pick any foreground and background color with the color pickers. For best scannability, keep good contrast (dark modules on a light background) and avoid inverting the colors.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a WiFi QR code and a vCard QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A WiFi QR code encodes network credentials — anyone who scans it joins the network without typing a password. A vCard QR code encodes contact details like name, phone, email, company — the scanner is prompted to save the person to their address book. Both are useful and both are free here.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data sent to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All QR generation happens locally in your browser using JavaScript. The content you type, the logo you upload, and the generated QR image never leave your device.',
      },
    },
  ],
}

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to create a free custom QR code online',
  description:
    'Create a custom QR code with your logo and brand colors, then download it as a high-resolution PNG or scalable SVG — 100% free and in your browser.',
  totalTime: 'PT30S',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose QR type', text: 'Pick what you want to encode: URL, text, email, phone, SMS, WiFi, or contact card.' },
    { '@type': 'HowToStep', position: 2, name: 'Fill in the details', text: 'Enter the content for your chosen QR type.' },
    { '@type': 'HowToStep', position: 3, name: 'Customize (optional)', text: 'Change the QR colors and upload a logo to place in the center.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Choose a size and format (PNG or SVG) and download your QR code.' },
  ],
}

export default function CreateLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      {children}
    </>
  )
}
