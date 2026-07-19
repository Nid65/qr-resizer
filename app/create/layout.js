export const metadata = {
  title: 'Free QR Code Generator — Create Custom QR Codes with Logo & Colors',
  description:
    'Free online QR code generator. Create custom static QR codes for URLs, text, email, phone, SMS, WiFi, and contact cards. Add your logo, custom colors, and export as high-resolution PNG or scalable SVG. 100% browser-based, no signup, no ads. QR codes never expire.',
  keywords: [
    'QR code generator',
    'free QR code generator',
    'create QR code',
    'custom QR code',
    'QR code with logo',
    'colored QR code',
    'WiFi QR code generator',
    'vCard QR code generator',
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
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'QR Resizer — free QR code generator' }],
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
      name: 'How do I create a QR code for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pick a QR type (URL, text, email, phone, SMS, WiFi, or contact card), fill in the fields, optionally customize the colors and add a logo, then click Download. The whole thing runs in your browser — no signup, no ads, no expiry.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do QR codes created here expire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. These are static QR codes — the content is encoded directly into the QR image itself. They will keep working forever, even if this website disappears. That is different from “dynamic” QR codes from paid services, which route through a company server and can stop working if you cancel or the service shuts down.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add my logo to the QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Upload any PNG, JPG or SVG logo and it will be placed in the center of the QR. QR Resizer automatically uses the highest error-correction level so the code stays fully scannable with the logo covering up to ~30% of the surface.',
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
