import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'QR Optimizer API — everything runs client-side.' })
}

export async function POST() {
  return NextResponse.json({ message: 'QR Optimizer runs entirely in the browser. No server processing.' })
}
