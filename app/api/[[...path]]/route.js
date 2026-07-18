import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'QR Resizer API — everything runs client-side.' })
}

export async function POST() {
  return NextResponse.json({ message: 'QR Resizer runs entirely in the browser. No server processing.' })
}
