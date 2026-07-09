import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK, API_URL } from '../shared'

type SiteContent = {
  hero_subtitle: string; hero_title_1: string; hero_title_2: string; hero_title_3: string
  hero_description: string; hero_image: string; hero_cta_text: string
  cta_title: string; cta_description: string; cta_button_text: string
}

const defaults: SiteContent = {
  hero_subtitle: 'Evolución en tus manos',
  hero_title_1: 'Tu próximo',
  hero_title_2: 'smartphone',
  hero_title_3: 'te espera',
  hero_description: 'Equipos nuevos y de exhibición. iPhone y Android al mejor precio en Boyacá. Envíos y contra entrega.',
  hero_image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=700&fit=crop',
  hero_cta_text: 'Ver catálogo',
  cta_title: '¿Listo para actualizar?',
  cta_description: 'Escríbenos por WhatsApp y te asesoramos con el equipo perfecto para ti',
  cta_button_text: 'Escribir por WhatsApp',
}

export default function Home() {
  const [content, setContent] = useState<SiteContent>(defaults)

  useEffect(() => {
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => setContent({ ...defaults, ...data }))
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <p className="text-purple-300 text-sm font-semibold tracking-widest uppercase mb-4">{content.hero_subtitle}</p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                {content.hero_title_1}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  {content.hero_title_2}
                </span>
                {content.hero_title_3}
              </h1>
              <p className="text-lg text-purple-200/80 max-w-md mb-8">
                {content.hero_description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalogo" className="bg-white text-purple-900 px-8 py-4 rounded-full font-semibold text-center hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  {content.hero_cta_text}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center animate-scale-in">
              <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[560px]">
                {/* Glow behind phones */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] lg:w-[420px] lg:h-[420px] bg-purple-500/25 rounded-full blur-[100px] lg:blur-[120px]" />

                {/* Back phone - left */}
                <img
                  src="/images/products/iphone-16-dark.webp"
                  alt="iPhone"
                  className="absolute left-2 sm:left-6 lg:left-0 top-10 lg:top-16 w-32 sm:w-40 lg:w-52 drop-shadow-2xl animate-float"
                  style={{ '--rot': '-10deg', animationDelay: '0.8s' } as React.CSSProperties}
                />
                {/* Back phone - right */}
                <img
                  src="/images/products/iphone-16-blue.webp"
                  alt="iPhone"
                  className="absolute right-2 sm:right-6 lg:right-0 top-16 lg:top-24 w-36 sm:w-44 lg:w-56 drop-shadow-2xl animate-float"
                  style={{ '--rot': '9deg', animationDelay: '1.6s' } as React.CSSProperties}
                />
                {/* Front phone - center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <img
                    src="/images/products/iphone-16-purple.webp"
                    alt="iPhone"
                    className="w-44 sm:w-56 lg:w-72 drop-shadow-2xl animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {content.cta_title}
                </h2>
                <p className="text-lg text-purple-200 max-w-xl mx-auto mb-8">
                  {content.cta_description}
                </p>
                <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20equipos%20disponibles`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg">
                  <WhatsAppIcon className="w-5 h-5" />
                  {content.cta_button_text}
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
