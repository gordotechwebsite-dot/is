import { RefreshCw } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK } from '../shared'

export default function TradeIn() {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div>
              <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
                Programa estrella
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Trade-In:
                <span className="block gradient-text">Actualiza tu equipo</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Trae tu teléfono anterior y recibe descuento en tu nuevo equipo.
                Valoramos tu dispositivo al mejor precio del mercado. Proceso rápido y sencillo.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Evaluación gratuita de tu equipo actual',
                  'Descuento inmediato en tu nueva compra',
                  'Aceptamos cualquier marca y modelo',
                  'Proceso en menos de 15 minutos',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20el%20Trade-In`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-purple-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-800 transition-colors shadow-lg shadow-purple-700/25">
                <RefreshCw className="w-5 h-5" />
                Consultar Trade-In
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-purple-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">¿Cómo funciona?</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Escríbenos', desc: 'Cuéntanos qué equipo tienes y cuál quieres' },
                    { step: '2', title: 'Evaluamos', desc: 'Te damos un valor justo por tu teléfono actual' },
                    { step: '3', title: 'Actualiza', desc: 'Paga la diferencia y recibe tu nuevo equipo' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Additional Trade-In info */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">¿Qué equipos aceptamos?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { brand: 'iPhone', desc: 'Desde iPhone 8 en adelante' },
                { brand: 'Samsung', desc: 'Serie S, A y Note' },
                { brand: 'Xiaomi', desc: 'Serie Mi, Redmi y Poco' },
                { brand: 'Otros', desc: 'Motorola, Huawei, OnePlus' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">{item.brand}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
