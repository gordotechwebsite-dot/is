import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'
import { ScrollReveal, WhatsAppIcon, WHATSAPP_LINK, API_URL, Product } from '../shared'

export default function ProductoDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then((data: Product[]) => {
        const found = data.find((p: Product) => p.id === Number(id))
        if (found) {
          setProduct({
            ...found,
            priceRange: (found as unknown as Record<string, string>).price_range || found.priceRange || '',
            image: found.image && found.image.startsWith('/api/') ? `${API_URL}${found.image}` : found.image,
          })
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [id])

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <img src="/images/apple-logo.webp" alt="Cargando..." className="w-16 h-16 object-contain animate-pulse-logo" />
      </div>
    )
  }

  if (!product) {
    return (
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
          <Link to="/catalogo" className="text-purple-700 font-medium hover:text-purple-900">
            <ArrowLeft className="w-4 h-4 inline mr-1" />Volver al catálogo
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <Link
            to={product.category ? `/categoria/${product.category}` : '/catalogo'}
            className="inline-flex items-center gap-1 text-purple-700 text-sm mb-6 hover:text-purple-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {product.badge && (
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  product.condition === 'Exhibición' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.condition}
                </span>
              </div>

              {product.priceRange && (
                <p className="text-2xl font-bold text-purple-700 mb-6">{product.priceRange}</p>
              )}

              {product.storage && product.storage.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Almacenamiento disponible</p>
                  <div className="flex flex-wrap gap-2">
                    {product.storage.map(s => (
                      <span key={s} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Colores disponibles</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(c => (
                      <span key={c} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hola! Me interesa el ${product.name} (${product.condition})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg text-lg"
              >
                <WhatsAppIcon className="w-6 h-6" />
                Consultar disponibilidad
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
