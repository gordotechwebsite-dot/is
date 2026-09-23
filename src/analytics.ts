import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

type GtagFn = (command: 'event' | 'config' | 'js', target: string, params?: Record<string, string | number | boolean>) => void

declare global {
  interface Window {
    gtag?: GtagFn
  }
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.('event', name, params)
}

export function useAnalytics() {
  const location = useLocation()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackEvent('page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const href = anchor.href
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackEvent('whatsapp_click', {
          page_path: window.location.pathname,
          link_text: (anchor.textContent || '').trim().slice(0, 80),
        })
      } else if (href.includes('instagram.com')) {
        trackEvent('instagram_click', { page_path: window.location.pathname })
      } else if (href.startsWith('tel:')) {
        trackEvent('phone_click', { page_path: window.location.pathname })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}
