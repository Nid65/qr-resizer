const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://qr-resizer.vercel.app'

export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
