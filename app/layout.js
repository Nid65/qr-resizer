import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'QR Resizer — Regenerate any QR code in high quality',
  description: 'Upload a blurry or low-res QR code and instantly resize it into a crisp, high-resolution PNG or SVG. 100% browser-based. No uploads to any server.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
