import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RefreshCw, BadgeCheck, ArrowRight } from 'lucide-react'
import BannerCarousel from '../components/BannerCarousel'
import { ScrollReveal, API_URL, Category, Product } from '../shared'

const BRAND_LABELS: Record<string, string> = {
  apple: 'Apple',
  samsung: 'Samsung',
  xiaomi: 'Xiaomi',
  motorola: 'Motorola',
}

function resolveImage(img: string): string {
  if (!img) return img
  if (img.startsWith('http')) return img
  if (img.startsWith('/api/')) return `${API_URL}${img}`
  return img.replace(/\.png$/i, '.webp')
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Garantía incluida', text: 'Todos nuestros equipos con garantía' },
  { icon: Truck, title: 'Contra entrega', text: 'Envíos a Ramiriquí y todo Boyacá' },
  { icon: RefreshCw, title: 'Trade-In', text: 'Entrega tu equipo y actualiza' },
  { icon: BadgeCheck, title: 'Exhibición como nuevo', text: 'Revisados y al mejor precio' },
]

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(r => r.json())
      .then((data: Category[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then((data: Array<Product & { price_range?: string }>) => {
        const mapped = (Array.isArray(data) ? data : []).map(p => ({
          ...p,
          priceRange: p.price_range || p.priceRange || '',
          image: resolveImage(p.image),
        }))
        setProducts(mapped)
      })
      .catch(() => {})
  }, [])

  const featured = Object.values(
    products.reduce<Record<string, Product>>((acc, p) => {
      if (!acc[p.name]) acc[p.name] = p
      return acc
    }, {})
  ).slice(0, 4)

  return (
    <>
      <BannerCarousel />

      {/* Categorías destacadas */}
      {categories.length > 0 && (
        <section className="py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Explora por categoría</h2>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Encuentra el equipo perfecto para ti</p>
              </div>
              <Link
                to="/catalogo"
                className="hidden sm:inline-flex items-center gap-1 text-purple-700 font-medium hover:text-purple-900 transition-colors shrink-0"
              >
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((cat, i) => (
                <ScrollReveal key={cat.id} delay={i * 0.05}>
                  <Link
                    to={cat.slug === 'ofertas' ? '/ofertas' : `/categoria/${cat.slug}`}
                    className="group block"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
                      <img
                        src={cat.cover_image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="mt-3 text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section className="py-14 lg:py-20 bg-gradient-to-b from-[#f8f6f3] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Destacados</h2>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Los equipos más buscados de la semana</p>
              </div>
              <Link
                to="/destacados"
                className="hidden sm:inline-flex items-center gap-1 text-purple-700 font-medium hover:text-purple-900 transition-colors shrink-0"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 0.05}>
                  <Link
                    to={`/producto/${product.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover cursor-pointer block h-full"
                  >
                    <div className="relative bg-gray-50 p-5 sm:p-6 aspect-square flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-purple-700 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      {product.condition === 'Exhibición' && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                          Exhibición
                        </span>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-[11px] sm:text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                        {BRAND_LABELS[product.brand] || product.brand}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.storage.join(' • ')}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-bold text-sm sm:text-base">{product.priceRange}</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-700 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/destacados"
                className="inline-flex items-center gap-1 text-purple-700 font-medium hover:text-purple-900 transition-colors"
              >
                Ver todos los destacados <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Soporte técnico */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-purple-700 bg-purple-50 px-3 py-1 rounded-full mb-3">
                Servicio técnico
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                También ofrecemos soporte técnico
              </h2>
              <p className="text-gray-500 mt-3 mb-8 text-sm sm:text-base">
                No solo vendemos equipos: reparamos, asesoramos y te acompañamos. Técnicos especializados y repuestos de calidad en Boyacá.
              </p>
              <Link
                to="/reparaciones"
                className="inline-flex items-center justify-center gap-2 bg-purple-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-800 transition-colors shadow-lg"
              >
                Obtén Servicio Técnico <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trade-In CTA band */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 px-6 py-12 sm:px-12 sm:py-16 text-center">
              <div className="absolute -top-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                  ¿Quieres actualizar tu equipo?
                </h2>
                <p className="text-purple-100 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
                  Con Trade-In entregas tu celular actual y pagas menos por el nuevo. Fácil, rápido y con la mejor valoración de Boyacá.
                </p>
                <Link
                  to="/trade-in"
                  className="inline-flex items-center gap-2 bg-white text-purple-800 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors shadow-lg"
                >
                  Conoce el Trade-In <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
