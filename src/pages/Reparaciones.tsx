import { Wrench, ShieldCheck, Headphones, Smartphone, BatteryCharging, Cpu } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK } from '../shared'

const SERVICES = [
  { icon: Smartphone, title: 'Cambio de pantalla', desc: 'Displays originales y de alta calidad para todas las marcas.' },
  { icon: BatteryCharging, title: 'Batería y carga', desc: 'Reemplazo de batería y reparación de puerto de carga.' },
  { icon: Cpu, title: 'Reparación de placa', desc: 'Diagnóstico y reparación a nivel de componentes.' },
  { icon: Wrench, title: 'Daños por líquido', desc: 'Limpieza y recuperación de equipos con humedad.' },
  { icon: ShieldCheck, title: 'Software y respaldo', desc: 'Actualización, desbloqueo y respaldo de tu información.' },
  { icon: Headphones, title: 'Accesorios y más', desc: 'Cámaras, botones, altavoces y otros repuestos.' },
]

const STEPS = [
  { step: '1', title: 'Escríbenos', desc: 'Cuéntanos qué le pasa a tu equipo' },
  { step: '2', title: 'Diagnóstico gratis', desc: 'Revisamos y te damos una cotización clara' },
  { step: '3', title: 'Reparamos', desc: 'Con garantía y en el menor tiempo posible' },
]

export default function Reparaciones() {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
              Servicio técnico
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Reparaciones
              <span className="block gradient-text">para tu equipo</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Técnicos especializados y repuestos de calidad. Reparamos iPhone, Android, iPads y más, con garantía y diagnóstico gratuito en Boyacá.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <ScrollReveal key={title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 hover:border-purple-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">¿Cómo funciona?</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map(item => (
                <div key={item.step} className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-12 text-center">
          <a
            href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hola! Necesito una reparación para mi equipo')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Solicitar reparación
          </a>
        </div>
      </div>
    </section>
  )
}
