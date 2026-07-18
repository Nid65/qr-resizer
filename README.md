# QR Resizer

> Upload any QR code and regenerate a clean, high-resolution version in seconds.
> **100% browser-based** — no uploads, no accounts, no tracking.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Got a QR code that's blurry, low-resolution, or just a screenshot? **QR Resizer** decodes it and regenerates a crisp, print-ready copy at up to **2048×2048 px PNG** or infinitely-scalable **SVG** — all locally in your browser.

---

## ✨ Features

- 📄 **Drag & drop upload** — PNG, JPG, JPEG (up to 10 MB)
- 🔍 **Auto-decode** using [`jsQR`](https://github.com/cozmo/jsQR) with multi-scale + inversion attempts (handles blurry & inverted QR codes)
- 🏷️ **Auto-detect QR type** — URL, Email, Phone, SMS, WiFi, Contact, Crypto, Location, Text
- 🎨 **Regenerate at high quality** using [`qrcode`](https://github.com/soldair/node-qrcode) with error-correction level **H**
- 📐 **Choose size** — 256 / 512 / 1024 / 2048 px
- 🖼️ **Choose format** — PNG or SVG
- 🔒 **Fully private** — nothing ever leaves your device
- ⚡ **Fast** — decode + regenerate in under 2 seconds
- 📱 **Mobile responsive** with a modern shadcn/ui interface

---

## 🚀 Demo

> Live: _add your Vercel URL here after deploying_

---

## 🧱 Tech Stack

| Layer          | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Framework      | [Next.js 15](https://nextjs.org/) (App Router)                  |
| UI             | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Icons          | [lucide-react](https://lucide.dev/)                             |
| QR decode      | [jsQR](https://github.com/cozmo/jsQR)                           |
| QR generation  | [qrcode](https://github.com/soldair/node-qrcode)                |
| Toasts         | [sonner](https://sonner.emilkowal.ski/)                         |

---

## 🏃 Run locally

```bash
# 1. Clone
git clone https://github.com/Nid65/qr-resizer.git
cd qr-resizer

# 2. Install dependencies
yarn install

# 3. Start the dev server
yarn dev

# 4. Open http://localhost:3000
```

### Build for production

```bash
yarn build
yarn start
```

---

## 🚀 Deploy to Vercel

The fastest way to host QR Resizer:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNid65%2Fqr-resizer)

Or manually:

1. Push this repo to GitHub (already done ✅)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `Nid65/qr-resizer`
4. Click **Deploy** — no environment variables required.

---

## 📁 Project structure

```
.
├── app/
│   ├── api/[[...path]]/route.js   # (unused) placeholder API route
│   ├── globals.css               # Tailwind + shadcn tokens
│   ├── layout.js                 # Root layout + metadata
│   └── page.js                   # The entire QR Resizer app
├── components/ui/                # shadcn/ui primitives
├── lib/                          # utilities
├── tailwind.config.js
└── package.json
```

All application logic lives in **[`app/page.js`](./app/page.js)** as a single client component. There is no backend — all decoding and regeneration happens client-side.

---

## 🗺️ Roadmap

- [ ] Transparent background option
- [ ] Custom foreground / background colors
- [ ] Copy decoded content to clipboard / "Open link" shortcut for URLs
- [ ] Batch upload multiple QR codes
- [ ] Logo insertion in the center of the QR
- [ ] QR scan-quality score
- [ ] PDF export for print sheets
- [ ] PostHog analytics integration

---

## 📜 License

[MIT](./LICENSE) © 2025

---

## 🙌 Credits

Built with ❤️ on [Emergent](https://emergent.sh).
