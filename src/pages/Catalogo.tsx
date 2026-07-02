import { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown, Smartphone } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK, API_URL, Product } from '../shared'

const fallbackProducts: Product[] = [
  { id: 1, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-gray.png', storage: ['128GB', '256GB'], colors: ['Negro', 'Blanco', 'Azul', 'Verde', 'Morado'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 2, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-white.png', storage: ['128GB', '256GB'], colors: ['Blanco', 'Negro', 'Azul', 'Verde', 'Morado'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 3, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-blue.png', storage: ['128GB', '256GB'], colors: ['Azul', 'Negro', 'Blanco', 'Verde', 'Morado'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 4, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-green.png', storage: ['128GB', '256GB'], colors: ['Verde', 'Negro', 'Blanco', 'Azul', 'Morado'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 5, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-purple.png', storage: ['128GB', '256GB'], colors: ['Morado', 'Negro', 'Blanco', 'Azul', 'Verde'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 6, name: 'iPhone 16 Pro', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-16-dark.png', storage: ['128GB', '256GB', '512GB'], colors: ['Titanio Negro', 'Titanio Natural', 'Titanio Desierto'], priceRange: 'Desde $4.800.000', badge: 'Pro' },
  { id: 7, name: 'iPhone SE 4', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-se4-white.png', storage: ['128GB', '256GB'], colors: ['Blanco', 'Azul', 'Negro', 'Rosa'], priceRange: 'Desde $2.200.000', badge: 'Nuevo' },
  { id: 8, name: 'iPhone SE 4', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-se4-blue.png', storage: ['128GB', '256GB'], colors: ['Azul', 'Blanco', 'Negro', 'Rosa'], priceRange: 'Desde $2.200.000', badge: 'Nuevo' },
  { id: 9, name: 'iPhone SE 4', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-se4-black.png', storage: ['128GB', '256GB'], colors: ['Negro', 'Blanco', 'Azul', 'Rosa'], priceRange: 'Desde $2.200.000', badge: 'Nuevo' },
  { id: 10, name: 'iPhone SE 4', brand: 'apple', condition: 'Nuevo', image: '/images/products/iphone-se4-pink.png', storage: ['128GB', '256GB'], colors: ['Rosa', 'Blanco', 'Azul', 'Negro'], priceRange: 'Desde $2.200.000', badge: 'Nuevo' },
  { id: 11, name: 'Samsung Galaxy S25', brand: 'samsung', condition: 'Nuevo', image: '/images/products/samsung-s25-gray.png', storage: ['128GB', '256GB'], colors: ['Negro', 'Azul', 'Menta', 'Plata'], priceRange: 'Desde $3.200.000', badge: 'Galaxy AI' },
  { id: 12, name: 'Samsung Galaxy S24 Ultra', brand: 'samsung', condition: 'Nuevo', image: '/images/products/samsung-s24-ultra-gold.png', storage: ['256GB', '512GB', '1TB'], colors: ['Titanio Dorado', 'Titanio Gris', 'Titanio Negro'], priceRange: 'Desde $4.800.000', badge: 'Ultra' },
  { id: 13, name: 'Samsung Galaxy S25', brand: 'samsung', condition: 'Nuevo', image: '/images/products/samsung-s25-blue.png', storage: ['128GB', '256GB'], colors: ['Azul', 'Negro', 'Menta', 'Plata'], priceRange: 'Desde $3.200.000', badge: 'Galaxy AI' },
  { id: 14, name: 'Samsung Galaxy S25', brand: 'samsung', condition: 'Nuevo', image: '/images/products/samsung-s25-mint.png', storage: ['128GB', '256GB'], colors: ['Menta', 'Negro', 'Azul', 'Plata'], priceRange: 'Desde $3.200.000', badge: 'Galaxy AI' },
]

type FilterBrand = 'all' | 'apple' | 'samsung' | 'xiaomi' | 'motorola'
type FilterCondition = 'all' | 'Nuevo' | 'Exhibición'

export default function Catalogo() {
  const [filterBrand, setFilterBrand] = useState<FilterBrand>('all')
  const [filterCondition, setFilterCondition] = useState<FilterCondition>('all')
  const [showAll, setShowAll] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((p: { id: number; name: string; brand: string; condition: string; image: string; storage: string[]; colors: string[]; price_range: string; badge?: string }) => ({
          ...p,
          priceRange: p.price_range,
        }))
        setProducts(mapped)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const activeProducts = loaded && products.length > 0 ? products : fallbackProducts

  const filtered = activeProducts.filter(p => {
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false
    if (filterCondition !== 'all' && p.condition !== filterCondition) return false
    return true
  })

  const display = showAll ? filtered : filtered.slice(0, 12)

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Nuestros Equipos
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Nuevos y de exhibición — todos con garantía y al mejor precio de la región
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {([['all', 'Todos'], ['apple', 'iPhone'], ['samsung', 'Samsung'], ['xiaomi', 'Xiaomi'], ['motorola', 'Motorola']] as const).map(([value, label]) => (
                <button key={value} onClick={() => setFilterBrand(value as FilterBrand)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    filterBrand === value
                      ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              {([['all', 'Todos'], ['Nuevo', 'Nuevos'], ['Exhibición', 'Exhibición']] as const).map(([value, label]) => (
                <button key={value} onClick={() => setFilterCondition(value as FilterCondition)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCondition === value
                      ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {display.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.05}>
              <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover cursor-pointer"
                onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola!%20Me%20interesa%20el%20${encodeURIComponent(product.name)}%20(${product.condition})`, '_blank')}>
                <div className="relative bg-gray-50 p-6 aspect-square flex items-center justify-center overflow-hidden">
                  <img src={product.image} alt={product.name}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500" />
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
                    {product.brand === 'apple' ? 'Apple' : product.brand === 'samsung' ? 'Samsung' : product.brand === 'xiaomi' ? 'Xiaomi' : 'Motorola'}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {product.storage.join(' • ')}
                  </p>
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

        {filtered.length > 12 && !showAll && (
          <div className="text-center mt-10">
            <button onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-700 text-purple-700 rounded-full font-semibold hover:bg-purple-700 hover:text-white transition-all">
              Ver todos los equipos
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No hay productos con estos filtros</p>
          </div>
        )}
      </div>
    </section>
  )
}
