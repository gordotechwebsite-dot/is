import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react'
import { ScrollReveal, API_URL, Product, Category } from '../shared'

function resolveImage(img: string): string {
  if (!img) return img
  if (img.startsWith('http')) return img
  if (img.startsWith('/api/')) return `${API_URL}${img}`
  return img.replace(/\.png$/i, '.webp')
}

function priceValue(p: Product): number {
  const digits = (p.priceRange || '').replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

const PHONE_NAME = /^(iphone|galaxy|samsung|xiaomi|redmi|motorola|moto|poco|honor)\b/i

const TIER_RANK: [RegExp, number][] = [
  [/pro\s*max/i, 4],
  [/pro/i, 3],
  [/plus/i, 2],
  [/\d+\s*e\b/i, 0],
]

// Generación del modelo (17 Pro Max > 17 Pro > 17 > 17e > 16 ...).
// Solo aplica a equipos; el resto queda en 0 y se ordena por precio.
function modelRank(p: Product): number {
  const name = p.name || ''
  if (!PHONE_NAME.test(name)) return 0
  const match = name.match(/\d+/)
  const generation = match ? parseInt(match[0], 10) : 0
  const tier = TIER_RANK.find(([re]) => re.test(name))?.[1] ?? 1
  return generation * 10 + tier
}

export default function CategoriaDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<'Todos' | 'Nuevo' | 'Exhibición'>('Todos')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products`).then(r => r.json()),
      fetch(`${API_URL}/api/categories`).then(r => r.json()),
    ])
      .then(([prods, cats]) => {
        const mapped = prods.map((p: { id: number; name: string; brand: string; condition: string; image: string; storage: string[]; colors: string[]; price_range: string; badge?: string; category?: string }) => ({
          ...p,
          priceRange: p.price_range,
          image: resolveImage(p.image),
        }))
        setProducts(mapped.filter((p: Product) => p.category === slug))
        const cat = cats.find((c: Category) => c.slug === slug)
        setCategory(cat || null)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [slug])

  const filteredProducts = (
    conditionFilter === 'Todos'
      ? products
      : products.filter((p) => p.condition === conditionFilter)
  )
    .slice()
    .sort((a, b) => modelRank(b) - modelRank(a) || priceValue(b) - priceValue(a))

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <img src="/images/apple-logo.webp" alt="Cargando..." className="w-16 h-16 object-contain animate-pulse-logo" />
      </div>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category header with cover */}
        {category && (
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-12 w-full h-44 sm:h-60 lg:h-72">
              <img
                src={resolveImage(category.header_image || category.cover_image)}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al catálogo
                </Link>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {category.name}
                </h1>
              </div>
            </div>
          </ScrollReveal>
        )}

        {!category && (
          <div className="mb-8">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1 text-purple-700 text-sm mb-4 hover:text-purple-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Categoría no encontrada</h1>
          </div>
        )}

        {/* Condition filter */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {(['Todos', 'Nuevo', 'Exhibición'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setConditionFilter(opt)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  conditionFilter === opt
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.05}>
                <Link
                  to={`/producto/${product.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover cursor-pointer block"
                >
                  <div className="relative bg-gray-50 p-5 sm:p-6 aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
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
                        {product.brand === 'samsung'
                          ? 'Samsung'
                          : product.brand === 'xiaomi'
                            ? 'Xiaomi'
                            : 'Motorola'}
                      </p>
                    )}
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
        ) : products.length > 0 ? (
          <div className="text-center py-16">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No hay productos {conditionFilter === 'Nuevo' ? 'nuevos' : 'de exhibición'} en esta categoría
            </p>
            <button
              onClick={() => setConditionFilter('Todos')}
              className="inline-flex items-center gap-2 mt-4 text-purple-700 font-medium hover:text-purple-900 transition-colors"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay productos en esta categoría aún</p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 mt-4 text-purple-700 font-medium hover:text-purple-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
