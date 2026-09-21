import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK, API_URL, Product, ColorOption } from '../shared'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const safeHex = (hex: string) => (HEX_RE.test(hex) ? hex : '#888888')

function resolveImage(img: string): string {
  if (!img) return img
  if (img.startsWith('http')) return img
  if (img.startsWith('/api/')) return `${API_URL}${img}`
  return img.replace(/\.png$/i, '.webp')
}

export default function ProductoDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [selStorage, setSelStorage] = useState('')
  const [selColor, setSelColor] = useState('')
  const [selSim, setSelSim] = useState('')
  const [selImage, setSelImage] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then((data: Product[]) => {
        const found = data.find((p: Product) => p.id === Number(id))
        if (found) {
          const simOptions = (found as unknown as { sim_options?: string[] }).sim_options || []
          const gallery = (found.images && found.images.length > 0 ? found.images : [found.image])
            .filter(Boolean)
            .map(resolveImage)
          const colorOptions: ColorOption[] = (found.color_options || []).map(c => ({
            ...c,
            images: (c.images || []).filter(Boolean).map(resolveImage),
          }))
          const colors = colorOptions.length > 0 ? colorOptions.map(c => c.name) : (found.colors || [])
          const firstGallery = colorOptions[0]?.images.length ? colorOptions[0].images : gallery
          setProduct({
            ...found,
            priceRange: (found as unknown as Record<string, string>).price_range || found.priceRange || '',
            image: resolveImage(found.image),
            images: gallery,
            colors,
            color_options: colorOptions,
            simOptions,
          })
          setSelImage(firstGallery[0] || resolveImage(found.image))
          setSelStorage(found.storage?.[0] || '')
          setSelColor(colors[0] || '')
          setSelSim(simOptions[0] || '')
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

  const colorOptions = product.color_options || []
  const activeColor = colorOptions.find(c => c.name === selColor)
  const gallery = activeColor && activeColor.images.length > 0 ? activeColor.images : (product.images || [])
  const selectColor = (name: string) => {
    setSelColor(name)
    const opt = colorOptions.find(c => c.name === name)
    const imgs = opt && opt.images.length > 0 ? opt.images : (product.images || [])
    if (imgs[0]) setSelImage(imgs[0])
  }

  return (
    <section className="py-6 sm:py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <Link
            to={product.category ? `/categoria/${product.category}` : '/catalogo'}
            className="inline-flex items-center gap-1 text-purple-700 text-sm mb-4 sm:mb-6 hover:text-purple-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            {/* Gallery */}
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 flex items-center justify-center h-56 sm:h-72 lg:h-auto lg:aspect-square">
                <img
                  src={selImage || product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 p-2 flex items-center justify-center border-2 transition-colors ${
                        selImage === img ? 'border-purple-600' : 'border-transparent hover:border-purple-300'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="max-w-full max-h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {product.brand !== 'apple' && (
                <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">
                  {product.brand}
                </p>
              )}
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

              {(() => {
                const hasVariants = !!product.variants && product.variants.length > 0
                const matched = hasVariants
                  ? product.variants!.find(
                      v => v.storage === selStorage
                        && (v.color === '' || v.color === selColor)
                        && (!v.sim || v.sim === selSim),
                    )
                  : undefined
                const displayPrice = matched?.price || product.priceRange
                const selDetails = [selStorage, selColor, selSim].filter(Boolean).join(', ')
                const waText = hasVariants
                  ? `Hola! Me interesa el ${product.name} (${product.condition})${selDetails ? ` — ${selDetails}` : ''}${matched?.price ? ` (${matched.price})` : ''}`
                  : `Hola! Me interesa el ${product.name} (${product.condition})`
                return (
                  <>
                    {displayPrice && (
                      <p className="text-2xl font-bold text-purple-700 mb-6">{displayPrice}</p>
                    )}

                    {product.storage && product.storage.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Almacenamiento{hasVariants ? '' : ' disponible'}</p>
                        <div className="flex flex-wrap gap-2">
                          {product.storage.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelStorage(s)}
                              className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                hasVariants && selStorage === s
                                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.simOptions && product.simOptions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tipo de SIM</p>
                        <div className="flex flex-wrap gap-2">
                          {product.simOptions.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelSim(s)}
                              className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                selSim === s
                                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Color{hasVariants || colorOptions.length > 0 ? '' : 'es disponibles'}
                          {colorOptions.length > 0 && selColor && <span className="text-gray-500 font-normal"> · {selColor}</span>}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {colorOptions.length > 0 ? colorOptions.map(c => (
                            <button
                              key={c.name}
                              type="button"
                              title={c.name}
                              aria-label={c.name}
                              aria-pressed={selColor === c.name}
                              onClick={() => selectColor(c.name)}
                              className={`w-9 h-9 rounded-lg border-2 p-0.5 transition-all ${
                                selColor === c.name
                                  ? 'border-purple-600 ring-2 ring-purple-200'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <span className="block w-full h-full rounded-md" style={{ backgroundColor: safeHex(c.hex) }} />
                            </button>
                          )) : product.colors.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setSelColor(c)}
                              className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                hasVariants && selColor === c
                                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasVariants && !matched && (
                      <p className="text-sm text-amber-600 mb-4">Esta combinación no está disponible. Consúltala por WhatsApp.</p>
                    )}

                    <a
                      href={`${WHATSAPP_LINK}?text=${encodeURIComponent(waText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-center sm:self-start w-full max-w-xs inline-flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg text-lg"
                    >
                      Consultar disponibilidad
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </>
                )
              })()}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
