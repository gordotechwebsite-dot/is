import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react'
import { ScrollReveal, API_URL, Product, Category, productPath, serviceCities } from '../shared'
import { useSeo, SITE_URL } from '../seo'
import Breadcrumbs from '../components/Breadcrumbs'

type CategoryCopy = { title: string; description: string; intro: string; bullets: string[] }

const CITIES = `${serviceCities.slice(0, -1).join(', ')} y ${serviceCities[serviceCities.length - 1]}`

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  iphone: {
    title: 'iPhone nuevos y de exhibición en Tunja y Boyacá — precio en Colombia',
    description: 'Tienda de iPhone en Tunja y Boyacá: iPhone 18, 17, 16 y 15 nuevos y de exhibición con garantía. Precios en pesos colombianos por capacidad, Trade-In y contra entrega en Bogotá, Chía y Cajicá.',
    intro: `En iSphone encuentras iPhone nuevos sellados y iPhone de exhibición (originales, revisados y con garantía) a mejor precio que en las grandes cadenas. Ve el precio en Colombia de cada modelo por capacidad (128 GB, 256 GB, 512 GB, 1 TB) y color, entrega tu equipo actual como parte de pago con Trade-In y recibe contra entrega en ${CITIES}.`,
    bullets: ['iPhone 18 Pro Max, 18 Pro, 17 Pro Max, 17 Pro, 17, 16 y 15', 'Nuevos sellados y de exhibición con garantía', 'Precio por capacidad y color, sin sorpresas', 'Trade-In: tu iPhone o Android usado como parte de pago'],
  },
  android: {
    title: 'Samsung y Android en Tunja y Boyacá — precio en Colombia',
    description: 'Samsung Galaxy S26 Ultra, S25 Ultra, A57, A37, A17 y más, nuevos y con garantía. Precio en Colombia por capacidad, Trade-In y envío contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá.',
    intro: `Celulares Android nuevos con garantía: Samsung Galaxy serie S (S26 Ultra, S26, S25 Ultra) y serie A (A57, A37, A26, A17, A07). Consulta el precio en Colombia por capacidad, cambia tu equipo actual con Trade-In y recibe contra entrega en ${CITIES}.`,
    bullets: ['Samsung Galaxy S26 Ultra y S25 Ultra', 'Galaxy A57, A37, A26, A17 y A07 al mejor precio', 'Equipos nuevos con garantía', 'Soporte técnico Android: pantalla, batería, puerto de carga'],
  },
  accesorios: {
    title: 'Accesorios Apple y celulares en Tunja y Boyacá: AirPods, cargadores, fundas',
    description: 'Accesorios originales para iPhone, iPad, Mac y Android: AirPods, cargadores, cables, fundas y protectores. Compra en Tunja, Boyacá, Bogotá, Chía y Cajicá con envío contra entrega.',
    intro: `Accesorios originales y de calidad para iPhone, iPad, Mac, Apple Watch y Android: AirPods, cargadores, cables, fundas, protectores de pantalla y más. Envíos y contra entrega en ${CITIES}.`,
    bullets: ['AirPods y audio Apple', 'Cargadores y cables originales', 'Fundas y protectores para iPhone y Samsung', 'Asesoría por WhatsApp para elegir el accesorio correcto'],
  },
}

function categoryCopy(slug: string, name: string): CategoryCopy {
  return CATEGORY_COPY[slug] ?? {
    title: `${name} nuevos y de exhibición en Tunja, Boyacá y Bogotá`,
    description: `Compra ${name} en iSphone: equipos nuevos y de exhibición con garantía, precio en Colombia y envío contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá.`,
    intro: `${name} nuevos y de exhibición con garantía en iSphone. Precio en Colombia actualizado, Trade-In y envío contra entrega en ${CITIES}.`,
    bullets: ['Equipos nuevos y de exhibición con garantía', 'Precio en pesos colombianos por variante', 'Trade-In y contra entrega', 'Soporte técnico especializado'],
  }
}

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
  [/ultra/i, 5],
  [/pro\s*max/i, 4],
  [/pro/i, 3],
  [/plus/i, 2],
  [/\d+\s*e\b/i, 0],
]

// Serie Samsung: gama alta (S, Z) por encima de la media (A, M, F).
const SERIES_RANK: Record<string, number> = { z: 3, s: 3, a: 2, m: 1, f: 1 }

// Generación del modelo (17 Pro Max > 17 Pro > 17 > 17e > 16 ...; S26 Ultra > S26 > S25 > A57 ...).
// Solo aplica a equipos; el resto queda en 0 y se ordena por precio.
function modelRank(p: Product): number {
  const name = p.name || ''
  if (!PHONE_NAME.test(name)) return 0
  const match = name.match(/(?:\b([a-z]))?\s*(\d+)/i)
  const generation = match?.[2] ? parseInt(match[2], 10) : 0
  const series = match?.[1] ? SERIES_RANK[match[1].toLowerCase()] ?? 2 : 2
  const tier = TIER_RANK.find(([re]) => re.test(name))?.[1] ?? 1
  return series * 10000 + generation * 10 + tier
}

// Evita que dos productos del mismo modelo (misma foto) queden seguidos:
// toma siempre el siguiente que no repita el nombre anterior.
function spreadDuplicates(items: Product[]): Product[] {
  const pending = items.slice()
  const out: Product[] = []
  while (pending.length) {
    const next = pending.findIndex((p) => p.name !== out[out.length - 1]?.name)
    out.push(...pending.splice(next === -1 ? 0 : next, 1))
  }
  return out
}

export default function CategoriaDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<'Todos' | 'Nuevo' | 'Exhibición'>('Nuevo')

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
        const ofCategory = mapped.filter((p: Product) => p.category === slug)
        setProducts(ofCategory)
        setConditionFilter(ofCategory.some((p: Product) => p.condition === 'Nuevo') ? 'Nuevo' : 'Todos')
        const cat = cats.find((c: Category) => c.slug === slug)
        setCategory(cat || null)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [slug])

  const catName = category?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Categoría')
  const copy = categoryCopy(slug ?? '', catName)
  const crumbs = [{ label: 'Inicio', to: '/' }, { label: 'Catálogo', to: '/catalogo' }, { label: catName }]
  useSeo({
    title: copy.title,
    description: copy.description,
    path: `/categoria/${slug ?? ''}`,
    image: category?.cover_image,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.label,
          ...(c.to ? { item: `${SITE_URL}${c.to}` } : {}),
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: copy.title,
        url: `${SITE_URL}/categoria/${slug ?? ''}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.slice(0, 30).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: `${SITE_URL}${productPath(p)}`,
          })),
        },
      },
    ],
  })

  const hasMixedConditions = new Set(products.map((p) => p.condition)).size > 1

  const sorted = (
    conditionFilter === 'Todos'
      ? products
      : products.filter((p) => p.condition === conditionFilter)
  )
    .slice()
    .sort((a, b) => modelRank(b) - modelRank(a) || priceValue(b) - priceValue(a))

  const filteredProducts = conditionFilter === 'Todos' ? spreadDuplicates(sorted) : sorted

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
        <Breadcrumbs items={crumbs} className="mb-4" />
        {/* Category header with cover */}
        {category && (
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-12 w-full aspect-[8/3]">
              <img
                src={resolveImage(category.header_image || category.cover_image)}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              {category.header_image ? (
                <h1 className="sr-only">{category.name}</h1>
              ) : (
                <>
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
                </>
              )}
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
        {hasMixedConditions && (
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
                  to={productPath(product)}
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

        <div className="mt-12 sm:mt-16 grid md:grid-cols-3 gap-8 border-t border-gray-100 pt-10">
          <div className="md:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{catName} con garantía en Tunja, Boyacá y Bogotá</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{copy.intro}</p>
            <div className="flex flex-wrap gap-3 mt-5 text-sm font-medium">
              <Link to="/trade-in" className="text-purple-700 hover:text-purple-900">Trade-In →</Link>
              <Link to="/reparaciones" className="text-purple-700 hover:text-purple-900">Servicio técnico →</Link>
              <Link to="/envios" className="text-purple-700 hover:text-purple-900">Envíos y contra entrega →</Link>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {copy.bullets.map(b => (
              <li key={b} className="flex gap-2"><span className="text-purple-600">✓</span>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
