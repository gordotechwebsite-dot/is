import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone } from 'lucide-react'
import { ScrollReveal, API_URL, Product } from '../shared'

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

export default function Destacados() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then((data: Array<Product & { price_range?: string }>) => {
        const mapped = (Array.isArray(data) ? data : []).map(p => ({
          ...p,
          priceRange: p.price_range || p.priceRange || '',
          image: resolveImage(p.image),
        }))
        setProducts(mapped)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

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
        <ScrollReveal>
          <div className="text-center mb-10 lg:mb-14">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Destacados</h1>
            <p className="text-gray-500 mt-3 text-sm sm:text-base">Los equipos más buscados de la semana</p>
          </div>
        </ScrollReveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.03}>
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
        ) : (
          <div className="text-center py-16">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay productos disponibles aún</p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 mt-4 text-purple-700 font-medium hover:text-purple-900 transition-colors"
            >
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
