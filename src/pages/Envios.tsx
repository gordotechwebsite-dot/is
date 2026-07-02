import { Truck, MapPin, Send, Clock, Shield } from 'lucide-react'
import { ScrollReveal, coverageTowns } from '../shared'

export default function Envios() {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Envíos y Contra Entrega
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Llevamos tu equipo hasta tu puerta en todo Boyacá. Paga al recibir.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contra Entrega</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Recibes tu equipo primero, lo revisas y pagas. Sin riesgos. Disponible en Ramiriquí y pueblos aledaños.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" /> Revisas antes de pagar</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-600" /> Entrega en 1-2 días</li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover h-full">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Send className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Envíos a Todo Boyacá</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Hacemos envíos a todo el departamento de Boyacá. Empaque seguro y entrega rápida.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" /> Empaque protegido</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-600" /> Entrega en 2-4 días</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* Coverage towns */}
        <ScrollReveal delay={0.2}>
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-700" />
              Cobertura contra entrega
            </h3>
            <div className="flex flex-wrap gap-2">
              {coverageTowns.map(town => (
                <span key={town} className="bg-white px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200">
                  {town}
                </span>
              ))}
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                Y más...
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ-like info */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Gratis en Ramiriquí', desc: 'Entrega sin costo adicional en el casco urbano' },
              { icon: Clock, title: 'Rápido', desc: 'Envíos el mismo día para pedidos antes de las 2pm' },
              { icon: Shield, title: 'Seguro', desc: 'Todos los envíos con empaque premium y protegido' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
