import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RefreshCw, BadgeCheck, ArrowRight } from 'lucide-react'
import HeroVideo from '../components/HeroVideo'
import { ScrollReveal, API_URL, Category, Product, fetchList, readCache } from '../shared'
import { useSeo } from '../seo'

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

type RawProduct = Product & { price_range?: string }

function mapProducts(data: RawProduct[]): Product[] {
  return data.map(p => ({
    ...p,
    priceRange: p.price_range || p.priceRange || '',
    image: resolveImage(p.image),
  }))
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Garantía incluida', text: 'Todos nuestros equipos con garantía' },
  { icon: Truck, title: 'Contra entrega', text: 'Envíos a Ramiriquí y todo Boyacá' },
  { icon: RefreshCw, title: 'Trade-In', text: 'Entrega tu equipo y actualiza' },
  { icon: BadgeCheck, title: 'Exhibición como nuevo', text: 'Revisados y al mejor precio' },
]

export default function Home() {
  useSeo({
    title: 'iSphone - Smartphones Nuevos y de Exhibición en Boyacá | iPhone y Android',
    description: 'iSphone: Tu tienda de smartphones en Boyacá. iPhone y Android nuevos y de exhibición con garantía. Trade-In, reparaciones y envíos contra entrega en Ramiriquí y todo Boyacá.',
    path: '/',
  })
  const [categories, setCategories] = useState<Category[]>(() => readCache<Category[]>('/api/categories') || [])
  const [products, setProducts] = useState<Product[]>(() => mapProducts(readCache<RawProduct[]>('/api/products') || []))

  const [categoriesReady, setCategoriesReady] = useState(categories.length > 0)

  useEffect(() => {
    fetchList<Category>('/api/categories')
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCategoriesReady(true))
    fetchList<RawProduct>('/api/products').then(data => setProducts(mapProducts(data))).catch(() => {})
  }, [])

  const featuredSource = products.some(p => p.featured) ? products.filter(p => p.featured) : products
  const featured = Object.values(
    featuredSource.reduce<Record<string, Product>>((acc, p) => {
      if (!acc[p.name]) acc[p.name] = p
      return acc
    }, {})
  ).slice(0, 4)

  return (
    <>
      <HeroVideo />

      {/* Categorías destacadas */}
      {(categories.length > 0 || !categoriesReady) && (
        <section className="py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-center sm:justify-between mb-8 gap-4 px-14 sm:px-0">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Explora por categoría</h2>
              </div>
              <Link
                to="/catalogo"
                className="hidden sm:inline-flex items-center gap-1 text-purple-700 font-medium hover:text-purple-900 transition-colors shrink-0"
              >
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-5">
              {categories.length === 0 && Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}>
                  <div className={`rounded-2xl aspect-square bg-gray-100 animate-pulse ${i === 0 ? 'lg:aspect-auto lg:h-full lg:rounded-3xl' : ''}`} />
                  <div className="mt-3 h-5 w-24 rounded bg-gray-100 animate-pulse lg:mx-auto" />
                </div>
              ))}
              {categories.map((cat, i) => (
                <ScrollReveal key={cat.id} delay={i * 0.05} className={i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}>
                  <Link
                    to={cat.slug === 'ofertas' ? '/ofertas' : `/categoria/${cat.slug}`}
                    className="group flex flex-col h-full"
                  >
                    <div className={`relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 group-hover:shadow-lg transition-shadow ${i === 0 ? 'lg:aspect-auto lg:flex-1 lg:rounded-3xl' : ''}`}>
                      <img
                        src={cat.cover_image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className={`mt-3 text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors lg:text-center ${i === 0 ? 'lg:text-xl' : 'lg:text-base'}`}>
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
                      {product.condition === 'Nuevo' && (
                        <span className="absolute top-3 right-3 bg-green-600 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      {product.brand !== 'apple' && (
                        <p className="text-[11px] sm:text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                          {BRAND_LABELS[product.brand] || product.brand}
                        </p>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
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

      {/* Soporte técnico + Trade-In */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2">
          <ScrollReveal className="h-full">
            <div className="h-full rounded-3xl bg-gray-50 border border-gray-100 px-6 py-12 sm:px-12 lg:py-14 text-center lg:text-left flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Tu equipo en manos expertas
              </h2>
              <p className="text-gray-500 mt-3 mb-8 text-sm sm:text-base">
                No solo vendemos equipos: reparamos, asesoramos y te acompañamos. Técnicos especializados y repuestos originales.
              </p>
              <Link
                to="/reparaciones"
                className="inline-flex self-center lg:self-start items-center justify-center gap-2 bg-purple-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-800 transition-colors shadow-lg"
              >
                Obtén Servicio Técnico <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="h-full">
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 px-6 py-12 sm:px-12 lg:py-14 text-center lg:text-left flex flex-col justify-center">
              <div className="absolute -top-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                  ¿Quieres actualizar tu equipo?
                </h2>
                <p className="text-purple-100 mb-8 text-sm sm:text-base">
                  Entregas tu celular actual y pagas menos por el nuevo. Fácil, rápido y con la mejor valoración de Boyacá.
                </p>
                <Link
                  to="/trade-in"
                  className="inline-flex self-center lg:self-start items-center gap-2 bg-white text-purple-800 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors shadow-lg"
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
