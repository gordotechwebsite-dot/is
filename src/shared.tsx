import { useState, useEffect, useRef } from 'react'

export const WHATSAPP_NUMBER = '573186823290'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`
export const API_URL = import.meta.env.VITE_API_URL || 'https://isphone-api.vercel.app'

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 175.216 175.552" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wa-gradient" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324a60.95 60.95 0 0 0 31.29 8.554c33.736 0 61.178-27.426 61.178-61.165-.006-16.348-6.365-31.724-17.901-43.282a60.84 60.84 0 0 0-43.395-17.898" fill="url(#wa-gradient)" />
      <path fill="#fff" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647" />
    </svg>
  )
}

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setIsVisible(true); observer.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, isVisible }
}

export function ScrollReveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number
}) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div ref={ref} className={`scroll-reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

export type Variant = {
  storage: string
  color: string
  price: string
}

export type Product = {
  id: number
  name: string
  brand: string
  condition: string
  image: string
  images?: string[]
  storage: string[]
  colors: string[]
  priceRange: string
  badge?: string
  category?: string
  variants?: Variant[]
}

export type Category = {
  id: number
  name: string
  slug: string
  cover_image: string
  header_image?: string
  position: number
}

export type Banner = {
  id: number
  image: string
  link?: string | null
  position: number
  active: boolean
}

export const testimonials = [
  { name: 'Carlos M.', city: 'Ramiriquí', text: 'Excelente servicio, me dieron buen precio por mi teléfono anterior y el nuevo llegó perfecto.', rating: 5 },
  { name: 'María L.', city: 'Tunja', text: 'El Trade-In fue súper fácil. Me ahorraron mucho en la actualización a mi nuevo Samsung.', rating: 5 },
  { name: 'Andrés R.', city: 'Jenesano', text: 'Contra entrega, sin problema. El equipo llegó tal cual como lo prometieron. 100% recomendados.', rating: 5 },
  { name: 'Sofía P.', city: 'Tibaná', text: 'Compré un iPhone de exhibición y está como nuevo. Muy buen precio y atención.', rating: 5 },
]

export const coverageTowns = [
  'Ramiriquí', 'Tunja', 'Jenesano', 'Tibaná', 'Boyacá', 'Viracachá',
  'Ciénega', 'Zetaquira', 'Miraflores', 'Ventaquemada', 'Nuevo Colón',
  'Úmbita', 'Chinavita', 'Garagoa', 'Tenza'
]
