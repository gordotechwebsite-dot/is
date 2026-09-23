import { useEffect } from 'react'

export const SITE_URL = 'https://isphone.co'
export const SITE_NAME = 'iSphone'
const DEFAULT_IMAGE = `${SITE_URL}/images/isphone-logo.webp`

type SeoOptions = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'product'
  jsonLd?: object | null
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const JSON_LD_ID = 'seo-page-jsonld'

function setJsonLd(data: object | null | undefined) {
  const existing = document.getElementById(JSON_LD_ID)
  if (existing) existing.remove()
  if (!data) return
  const script = document.createElement('script')
  script.id = JSON_LD_ID
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)
  document.head.appendChild(script)
}

export function absoluteUrl(path: string): string {
  if (!path) return DEFAULT_IMAGE
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function useSeo({ title, description, path, image, type = 'website', jsonLd }: SeoOptions) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`
  const img = image ? absoluteUrl(image) : DEFAULT_IMAGE
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    document.title = fullTitle
    setMeta('name', 'title', fullTitle)
    setMeta('name', 'description', description)
    setCanonical(url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'twitter:title', fullTitle)
    setMeta('property', 'twitter:description', description)
    setMeta('property', 'twitter:image', img)
    setJsonLd(ld ? (JSON.parse(ld) as object) : null)
    return () => setJsonLd(null)
  }, [fullTitle, description, url, img, type, ld])
}
