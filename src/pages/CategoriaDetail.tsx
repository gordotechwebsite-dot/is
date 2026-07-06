import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK, API_URL, Product, Category } from '../shared'

export default function CategoriaDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products`).then(r => r.json()),
      fetch(`${API_URL}/api/categories`).then(r => r.json()),
    ])
      .then(([prods, cats]) => {
        const mapped = prods.map((p: { id: number; name: string; brand: string; condition: string; image: string; storage: string[]; colors: string[]; price_range: string; badge?: string; category?: string }) => ({
          ...p,
          priceRange: p.price_range,
        }))
        setProducts(mapped.filter((p: Product) => p.category === slug))
        const cat = cats.find((c: Category) => c.slug === slug)
        setCategory(cat || null)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [slug])

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category header with cover */}
        {category && (
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden mb-12 aspect-[3/1] min-h-[200px]">
              <img
                src={category.cover_image}
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

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.05}>
                <div
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover cursor-pointer"
                  onClick={() =>
                    window.open(
                      `${WHATSAPP_LINK}?text=Hola!%20Me%20interesa%20el%20${encodeURIComponent(product.name)}%20(${product.condition})`,
                      '_blank'
                    )
                  }
                >
                  <div className="relative bg-gray-50 p-6 aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-purple-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    {product.condition === 'Exhibición' && (
                      <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Exhibición
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                      {product.brand === 'apple'
                        ? 'Apple'
                        : product.brand === 'samsung'
                          ? 'Samsung'
                          : product.brand === 'xiaomi'
                            ? 'Xiaomi'
                            : 'Motorola'}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{product.storage.join(' • ')}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-bold">{product.priceRange}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        Consultar <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
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
