import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, RefreshCw, Star } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK } from '../shared'

export default function Home() {
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
              <p className="text-purple-300 text-sm font-semibold tracking-widest uppercase mb-4">Evolución en tus manos</p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Tu próximo
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  smartphone
                </span>
                te espera
              </h1>
              <p className="text-lg text-purple-200/80 max-w-md mb-8">
                Equipos nuevos y de exhibición. iPhone y Android al mejor precio en Boyacá. Envíos y contra entrega.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalogo" className="bg-white text-purple-900 px-8 py-4 rounded-full font-semibold text-center hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  Ver catálogo
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-[3rem] blur-xl" />
                <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=700&fit=crop"
                  alt="Smartphones" className="relative rounded-[2rem] w-80 object-cover shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props strip */}
      <section className="bg-gray-50 py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 justify-center py-3">
              <Shield className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Garantía incluida</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <Truck className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Contra entrega</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <RefreshCw className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Trade-In disponible</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <Star className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">100% originales</span>
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
                  ¿Listo para actualizar?
                </h2>
                <p className="text-lg text-purple-200 max-w-xl mx-auto mb-8">
                  Escríbenos por WhatsApp y te asesoramos con el equipo perfecto para ti
                </p>
                <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20equipos%20disponibles`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg">
                  <WhatsAppIcon className="w-5 h-5" />
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
