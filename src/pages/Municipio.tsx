import { Link, useParams } from 'react-router-dom'
import { MapPin, Truck, RefreshCw, Wrench } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK, boyacaTowns } from '../shared'
import { useSeo, SITE_URL } from '../seo'

export default function Municipio() {
  const { slug } = useParams()
  const town = boyacaTowns.find(t => t.slug === slug)
  const name = town?.name ?? 'Boyacá'
  const isStore = town?.slug === 'ramiriqui'
  const delivery = town?.direct
    ? `entrega con pago contra entrega en ${name} en 1 a 2 días`
    : `envío a domicilio en ${name} en 2 a 4 días`
  const title = `iPhone y celulares en ${name}, Boyacá — nuevos y de exhibición`
  const description = `Compra iPhone, Samsung, iPad y MacBook en ${name}, Boyacá: equipos nuevos y de exhibición con garantía, Trade-In, servicio técnico y ${delivery}.`
  const faqs = [
    { q: `¿Venden iPhone en ${name}?`, a: `Sí. Vendemos iPhone nuevos y de exhibición con garantía y precio en pesos por capacidad, con ${delivery}.` },
    { q: `¿Puedo pagar contra entrega en ${name}?`, a: town?.direct ? `Sí. En ${name} recibes el equipo, lo revisas y pagas al recibir.` : `Escríbenos por WhatsApp y te confirmamos las opciones de pago y envío a ${name}.` },
    { q: `¿Reciben mi celular usado en ${name}?`, a: 'Sí. Con el Trade-In valoramos tu iPhone, Samsung o Android y lo descontamos del equipo nuevo.' },
  ]
  const others = boyacaTowns.filter(t => t.slug !== town?.slug)

  useSeo({
    title,
    description,
    path: `/celulares/${town?.slug ?? ''}`,
    jsonLd: town ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Store', '@id': `${SITE_URL}/#negocio`, name: 'iSphone', url: SITE_URL, telephone: '+573186823290',
          address: { '@type': 'PostalAddress', addressLocality: 'Ramiriquí', addressRegion: 'Boyacá', addressCountry: 'CO' },
          areaServed: { '@type': 'City', name: `${name}, Boyacá` },
        },
        { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Envíos', item: `${SITE_URL}/envios` },
          { '@type': 'ListItem', position: 3, name },
        ] },
      ],
    } : null,
  })

  if (!town) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Municipio no encontrado</h1>
        <Link to="/envios" className="text-purple-700 font-medium hover:underline">Ver cobertura en Boyacá</Link>
      </section>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-700" /> {name}, provincia de {town.province}, Boyacá</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">iPhone y celulares en {name}</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
            {isStore
              ? 'Nuestra tienda está en Ramiriquí: iPhone, Samsung, iPad, MacBook y accesorios nuevos y de exhibición, con garantía y entrega sin costo en el casco urbano.'
              : `Llevamos iPhone, Samsung, iPad, MacBook y accesorios nuevos y de exhibición a ${name}, con garantía y ${delivery}.`}
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <a href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hola, estoy en ${name} y quiero información`)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-800 transition-colors">
              Escribir por WhatsApp
            </a>
            <Link to="/categoria/iphone" className="inline-flex items-center px-6 py-3 rounded-full font-semibold border border-gray-200 text-gray-800 hover:border-purple-700">Ver iPhone</Link>
            <Link to="/categoria/android" className="inline-flex items-center px-6 py-3 rounded-full font-semibold border border-gray-200 text-gray-800 hover:border-purple-700">Ver Samsung</Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {[
              { icon: Truck, title: town.direct ? 'Contra entrega' : 'Envío a domicilio', desc: `Recibe tu equipo en ${name}${town.direct ? ', revísalo y paga al recibir' : ' con empaque protegido'}.`, to: '/envios' },
              { icon: RefreshCw, title: 'Trade-In', desc: 'Tu celular usado como parte de pago del nuevo.', to: '/trade-in' },
              { icon: Wrench, title: 'Servicio técnico', desc: 'Pantalla, batería, puerto de carga y más, con repuestos originales.', to: '/reparaciones' },
            ].map(item => (
              <Link key={item.title} to={item.to} className="block bg-white rounded-2xl border border-gray-100 p-6 hover:border-purple-200 transition-colors">
                <item.icon className="w-6 h-6 text-purple-700 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes en {name}</h2>
          <div className="space-y-4 mb-14">
            {faqs.map(f => (
              <div key={f.q} className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900 mb-1">{f.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Otros municipios de Boyacá</h2>
          <div className="flex flex-wrap gap-2">
            {others.map(t => (
              <Link key={t.slug} to={`/celulares/${t.slug}`} className="bg-white px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200 hover:border-purple-700">{t.name}</Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
