import { useState, useEffect } from 'react'
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
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f6f4f1] to-[#ece8e2] min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-white/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#e7e2da]/70 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="relative flex justify-center items-start animate-scale-in">
            {/* Soft glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] lg:w-[520px] lg:h-[520px] bg-white/70 rounded-full blur-[110px] lg:blur-[130px]" />

            <div className="relative flex justify-center items-start gap-4 sm:gap-8 lg:gap-12">
              <img
                src="/images/products/iphone-16-dark.webp"
                alt="iPhone"
                className="w-28 sm:w-40 lg:w-60 drop-shadow-2xl animate-float"
                style={{ animationDelay: '0s' } as React.CSSProperties}
              />
              <img
                src="/images/products/iphone-16-purple.webp"
                alt="iPhone"
                className="w-28 sm:w-40 lg:w-60 drop-shadow-2xl animate-float"
                style={{ animationDelay: '0.8s' } as React.CSSProperties}
              />
              <img
                src="/images/products/iphone-16-blue.webp"
                alt="iPhone"
                className="w-28 sm:w-40 lg:w-60 drop-shadow-2xl animate-float"
                style={{ animationDelay: '1.6s' } as React.CSSProperties}
              />
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
