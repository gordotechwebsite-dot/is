import { Tag, Gift, Percent, Clock } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK } from '../shared'

export default function Ofertas() {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ofertas y Promociones
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Aprovecha nuestras ofertas especiales en equipos nuevos y de exhibición
            </p>
          </div>
        </ScrollReveal>

        {/* Featured promo */}
        <ScrollReveal>
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 mb-12 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10 text-center">
              <span className="inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold mb-6">
                🎁 PROMOCIÓN ACTIVA
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Regalo por tu primera compra
              </h2>
              <p className="text-lg text-purple-200 max-w-lg mx-auto mb-6">
                En compras mayores a $250.000 recibes un regalo sorpresa. Aplica para equipos nuevos y de exhibición.
              </p>
              <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20aprovechar%20la%20promo%20del%20regalo%20por%20primera%20compra`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg">
                <WhatsAppIcon className="w-5 h-5" />
                Reclamar mi regalo
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Offer cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regalo primera compra</h3>
              <p className="text-gray-600 leading-relaxed">
                Compras mayores a $250.000 reciben un regalo sorpresa. Válido para clientes nuevos.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Percent className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trade-In con descuento extra</h3>
              <p className="text-gray-600 leading-relaxed">
                Trae tu equipo anterior y recibe un descuento adicional sobre el valor de Trade-In.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Tag className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Equipos de exhibición</h3>
              <p className="text-gray-600 leading-relaxed">
                Equipos como nuevos con hasta 30% de descuento. Garantía incluida en todos.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Info */}
        <ScrollReveal delay={0.3}>
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-purple-700" />
              <h3 className="text-lg font-bold text-gray-900">Ofertas por tiempo limitado</h3>
            </div>
            <p className="text-gray-500 max-w-lg mx-auto">
              Escríbenos por WhatsApp para conocer las ofertas vigentes y disponibilidad de equipos.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
