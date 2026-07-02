import { Phone, MapPin } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK } from '../shared'

export default function Contacto() {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Estamos para asesorarte. Escríbenos y te ayudamos a elegir el equipo perfecto.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* WhatsApp card */}
          <ScrollReveal>
            <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20equipos%20disponibles`}
              target="_blank" rel="noopener noreferrer"
              className="block bg-green-50 border border-green-200 rounded-2xl p-8 hover:shadow-lg transition-shadow h-full">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <WhatsAppIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">El canal más rápido. Respuesta en minutos.</p>
              <span className="text-green-700 font-semibold">+57 318 682 3290</span>
            </a>
          </ScrollReveal>

          {/* Phone card */}
          <ScrollReveal delay={0.1}>
            <a href="tel:+573186823290"
              className="block bg-purple-50 border border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-shadow h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Llamar</h3>
              <p className="text-gray-600 mb-4">Lunes a sábado, 8am - 7pm.</p>
              <span className="text-purple-700 font-semibold">+57 318 682 3290</span>
            </a>
          </ScrollReveal>
        </div>

        {/* Location */}
        <ScrollReveal delay={0.2}>
          <div className="mt-12 bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ubicación</h3>
                <p className="text-gray-600">Ramiriquí, Boyacá, Colombia</p>
                <p className="text-sm text-gray-500 mt-1">Envíos y contra entrega en todo Boyacá</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden max-w-4xl mx-auto">
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                ¿Listo para actualizar?
              </h2>
              <p className="text-purple-200 max-w-md mx-auto mb-6">
                Te asesoramos gratis. Sin compromiso.
              </p>
              <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20asesoría%20para%20elegir%20un%20equipo`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg">
                <WhatsAppIcon className="w-5 h-5" />
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
