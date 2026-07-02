import { useState, useEffect, useRef } from 'react'
import { Phone, MessageCircle, MapPin, Truck, ArrowRight, Star, Shield, RefreshCw, Smartphone, ChevronDown, Menu, X, Instagram, Send } from 'lucide-react'

// Scroll animation hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setIsVisible(true); observer.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, isVisible }
}

function ScrollReveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number
}) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div ref={ref} className={`scroll-reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

// WhatsApp link
const WHATSAPP_NUMBER = '573186823290'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

// Product types
type Product = {
  id: number
  name: string
  brand: 'apple' | 'samsung' | 'xiaomi' | 'motorola'
  condition: 'Nuevo' | 'Exhibición'
  image: string
  storage: string[]
  colors: string[]
  priceRange: string
  badge?: string
}

// Product catalog
const products: Product[] = [
  // iPhones Nuevos
  { id: 1, name: 'iPhone 15', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Azul', 'Rosa'], priceRange: 'Desde $2.800.000', badge: 'Nuevo' },
  { id: 2, name: 'iPhone 15 Pro', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=500&fit=crop', storage: ['128GB', '256GB', '512GB'], colors: ['Titanio Natural', 'Titanio Azul', 'Titanio Negro'], priceRange: 'Desde $4.200.000', badge: 'Pro' },
  { id: 3, name: 'iPhone 15 Pro Max', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=500&fit=crop', storage: ['256GB', '512GB', '1TB'], colors: ['Titanio Natural', 'Titanio Azul', 'Titanio Negro'], priceRange: 'Desde $5.500.000', badge: 'Pro Max' },
  { id: 4, name: 'iPhone 16', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1710023038956-3dce1ef3ac38?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Blanco', 'Azul'], priceRange: 'Desde $3.400.000', badge: 'Nuevo' },
  { id: 5, name: 'iPhone 16 Pro', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1710023038956-3dce1ef3ac38?w=400&h=500&fit=crop', storage: ['128GB', '256GB', '512GB'], colors: ['Titanio Natural', 'Titanio Desierto', 'Titanio Negro'], priceRange: 'Desde $4.800.000', badge: 'Pro' },
  { id: 6, name: 'iPhone 16 Pro Max', brand: 'apple', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1710023038956-3dce1ef3ac38?w=400&h=500&fit=crop', storage: ['256GB', '512GB', '1TB'], colors: ['Titanio Natural', 'Titanio Desierto', 'Titanio Negro'], priceRange: 'Desde $6.200.000', badge: 'Pro Max' },

  // iPhones Exhibición
  { id: 7, name: 'iPhone 13', brand: 'apple', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&h=500&fit=crop', storage: ['128GB'], colors: ['Negro', 'Blanco', 'Azul'], priceRange: 'Desde $1.400.000' },
  { id: 8, name: 'iPhone 14', brand: 'apple', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Morado', 'Blanco'], priceRange: 'Desde $1.900.000' },
  { id: 9, name: 'iPhone 14 Pro', brand: 'apple', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Dorado', 'Morado'], priceRange: 'Desde $2.600.000' },
  { id: 10, name: 'iPhone 15', brand: 'apple', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?w=400&h=500&fit=crop', storage: ['128GB'], colors: ['Negro', 'Azul', 'Rosa'], priceRange: 'Desde $2.400.000' },

  // Samsung Nuevos
  { id: 11, name: 'Samsung Galaxy S24', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Violeta', 'Crema'], priceRange: 'Desde $2.600.000', badge: 'Galaxy AI' },
  { id: 12, name: 'Samsung Galaxy S24 Ultra', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['256GB', '512GB', '1TB'], colors: ['Titanio Gris', 'Titanio Negro', 'Titanio Violeta'], priceRange: 'Desde $4.800.000', badge: 'Ultra' },
  { id: 13, name: 'Samsung Galaxy S25', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Azul Hielo', 'Plata', 'Negro'], priceRange: 'Desde $3.200.000', badge: 'Nuevo' },
  { id: 14, name: 'Samsung Galaxy S25 Ultra', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['256GB', '512GB', '1TB'], colors: ['Titanio Negro', 'Titanio Gris', 'Titanio Azul'], priceRange: 'Desde $5.400.000', badge: 'Ultra' },
  { id: 15, name: 'Samsung Galaxy A55', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Azul', 'Lila', 'Negro'], priceRange: 'Desde $1.400.000' },
  { id: 16, name: 'Samsung Galaxy Z Flip 6', brand: 'samsung', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['256GB', '512GB'], colors: ['Azul', 'Menta', 'Amarillo'], priceRange: 'Desde $4.200.000', badge: 'Plegable' },

  // Samsung Exhibición
  { id: 17, name: 'Samsung Galaxy S23', brand: 'samsung', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Crema', 'Verde'], priceRange: 'Desde $1.600.000' },
  { id: 18, name: 'Samsung Galaxy S23 Ultra', brand: 'samsung', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['256GB', '512GB'], colors: ['Negro', 'Crema', 'Verde'], priceRange: 'Desde $2.800.000' },
  { id: 19, name: 'Samsung Galaxy S24', brand: 'samsung', condition: 'Exhibición', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Violeta', 'Crema'], priceRange: 'Desde $2.200.000' },

  // Xiaomi
  { id: 20, name: 'Xiaomi 14', brand: 'xiaomi', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=500&fit=crop', storage: ['256GB', '512GB'], colors: ['Negro', 'Blanco', 'Verde'], priceRange: 'Desde $2.400.000', badge: 'Leica' },
  { id: 21, name: 'Xiaomi Redmi Note 13 Pro', brand: 'xiaomi', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=500&fit=crop', storage: ['128GB', '256GB'], colors: ['Negro', 'Azul', 'Morado'], priceRange: 'Desde $950.000' },

  // Motorola
  { id: 22, name: 'Motorola Edge 50 Pro', brand: 'motorola', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=500&fit=crop', storage: ['256GB'], colors: ['Negro', 'Azul'], priceRange: 'Desde $1.800.000' },
]

// Testimonials
const testimonials = [
  { name: 'Carlos M.', city: 'Ramiriquí', text: 'Excelente servicio, me dieron buen precio por mi teléfono anterior y el nuevo llegó perfecto.', rating: 5 },
  { name: 'María L.', city: 'Tunja', text: 'El Trade-In fue súper fácil. Me ahorraron mucho en la actualización a mi nuevo Samsung.', rating: 5 },
  { name: 'Andrés R.', city: 'Jenesano', text: 'Contra entrega, sin problema. El equipo llegó tal cual como lo prometieron. 100% recomendados.', rating: 5 },
  { name: 'Sofía P.', city: 'Tibaná', text: 'Compré un iPhone de exhibición y está como nuevo. Muy buen precio y atención.', rating: 5 },
]

// Coverage towns
const coverageTowns = [
  'Ramiriquí', 'Tunja', 'Jenesano', 'Tibaná', 'Boyacá', 'Viracachá',
  'Ciénega', 'Zetaquira', 'Miraflores', 'Ventaquemada', 'Nuevo Colón',
  'Úmbita', 'Chinavita', 'Garagoa', 'Tenza'
]

type FilterBrand = 'all' | 'apple' | 'samsung' | 'xiaomi' | 'motorola'
type FilterCondition = 'all' | 'Nuevo' | 'Exhibición'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filterBrand, setFilterBrand] = useState<FilterBrand>('all')
  const [filterCondition, setFilterCondition] = useState<FilterCondition>('all')
  const [showAllProducts, setShowAllProducts] = useState(false)

  const filteredProducts = products.filter(p => {
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false
    if (filterCondition !== 'all' && p.condition !== filterCondition) return false
    return true
  })

  const displayProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 8)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Samsung style */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/images/isphone-logo.png" alt="iSphone" className="h-10" />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Inicio</a>
              <a href="#productos" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Productos</a>
              <a href="#trade-in" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Trade-In</a>
              <a href="#envios" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Envíos</a>
              <a href="#contacto" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Contacto</a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Inicio</a>
              <a href="#productos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Productos</a>
              <a href="#trade-in" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Trade-In</a>
              <a href="#envios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Envíos</a>
              <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Contacto</a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="block bg-purple-700 text-white px-5 py-3 rounded-full text-center font-medium">
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Samsung inspired: big, clean, bold */}
      <section id="inicio" className="pt-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 min-h-[90vh] flex items-center">
          {/* Subtle background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-up">
                <p className="text-purple-300 text-sm font-semibold tracking-widest uppercase mb-4">Evolución en tus manos</p>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  Tu próximo
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                    smartphone
                  </span>
                  te espera
                </h1>
                <p className="text-lg text-purple-200/80 max-w-md mb-8">
                  Equipos nuevos y de exhibición. iPhone y Android al mejor precio en Boyacá. Envíos y contra entrega.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#productos" className="bg-white text-purple-900 px-8 py-4 rounded-full font-semibold text-center hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                    Ver catálogo
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href={`${WHATSAPP_LINK}?text=Hola!%20Me%20interesa%20conocer%20los%20equipos%20disponibles`} target="_blank" rel="noopener noreferrer"
                    className="border border-purple-400/50 text-white px-8 py-4 rounded-full font-semibold text-center hover:bg-purple-800/50 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Escríbenos
                  </a>
                </div>
              </div>

              <div className="hidden lg:flex justify-center animate-scale-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-[3rem] blur-xl" />
                  <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=700&fit=crop"
                    alt="Smartphones" className="relative rounded-[2rem] w-80 object-cover shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props - Samsung style horizontal strip */}
      <section className="bg-gray-50 py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 justify-center py-3">
              <Shield className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Garantía incluida</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <Truck className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Contra entrega</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <RefreshCw className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">Trade-In disponible</span>
            </div>
            <div className="flex items-center gap-3 justify-center py-3">
              <Star className="w-5 h-5 text-purple-700" />
              <span className="text-sm font-medium text-gray-700">100% originales</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Nuestros Equipos
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Nuevos y de exhibición — todos con garantía y al mejor precio de la región
              </p>
            </div>
          </ScrollReveal>

          {/* Filters - Samsung style pills */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              {/* Brand filter */}
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
              {/* Condition filter */}
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

          {/* Product grid - Samsung style cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.05}>
                <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover cursor-pointer"
                  onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola!%20Me%20interesa%20el%20${encodeURIComponent(product.name)}%20(${product.condition})`, '_blank')}>
                  {/* Image */}
                  <div className="relative bg-gray-50 p-6 aspect-square flex items-center justify-center overflow-hidden">
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
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
                  {/* Info */}
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

          {/* Show more */}
          {filteredProducts.length > 8 && !showAllProducts && (
            <div className="text-center mt-10">
              <button onClick={() => setShowAllProducts(true)}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-700 text-purple-700 rounded-full font-semibold hover:bg-purple-700 hover:text-white transition-all">
                Ver todos los equipos
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No hay productos con estos filtros</p>
            </div>
          )}
        </div>
      </section>

      {/* Trade-In Section - Featured */}
      <section id="trade-in" className="py-20 lg:py-28 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
                  Programa estrella
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Trade-In:
                  <span className="block gradient-text">Actualiza tu equipo</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Trae tu teléfono anterior y recibe descuento en tu nuevo equipo.
                  Valoramos tu dispositivo al mejor precio del mercado. Proceso rápido y sencillo.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'Evaluación gratuita de tu equipo actual',
                    'Descuento inmediato en tu nueva compra',
                    'Aceptamos cualquier marca y modelo',
                    'Proceso en menos de 15 minutos',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20el%20Trade-In`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-800 transition-colors shadow-lg shadow-purple-700/25">
                  <RefreshCw className="w-5 h-5" />
                  Consultar Trade-In
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-8 h-8 text-purple-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">¿Cómo funciona?</h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      { step: '1', title: 'Escríbenos', desc: 'Cuéntanos qué equipo tienes y cuál quieres' },
                      { step: '2', title: 'Evaluamos', desc: 'Te damos un valor justo por tu teléfono actual' },
                      { step: '3', title: 'Actualiza', desc: 'Paga la diferencia y recibe tu nuevo equipo' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Shipping/Coverage Section */}
      <section id="envios" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Envíos y Contra Entrega
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Llevamos tu equipo hasta tu puerta en todo Boyacá. Paga al recibir.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ScrollReveal>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="w-7 h-7 text-purple-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contra Entrega</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recibes tu equipo primero, lo revisas y pagas. Sin riesgos. Disponible en Ramiriquí y pueblos aledaños.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 card-hover">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Send className="w-7 h-7 text-purple-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Envíos a Todo Boyacá</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hacemos envíos a todo el departamento de Boyacá. Empaque seguro y entrega rápida.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Coverage towns */}
          <ScrollReveal delay={0.2}>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-700" />
                Cobertura contra entrega
              </h3>
              <div className="flex flex-wrap gap-2">
                {coverageTowns.map(town => (
                  <span key={town} className="bg-white px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200">
                    {town}
                  </span>
                ))}
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                  Y más...
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Lo que dicen nuestros clientes
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-700">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.city}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contacto" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  ¿Listo para actualizar?
                </h2>
                <p className="text-lg text-purple-200 max-w-xl mx-auto mb-8">
                  Escríbenos por WhatsApp y te asesoramos con el equipo perfecto para ti
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={`${WHATSAPP_LINK}?text=Hola!%20Quiero%20información%20sobre%20equipos%20disponibles`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                    Escribir por WhatsApp
                  </a>
                  <a href="tel:+573186823290"
                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors">
                    <Phone className="w-5 h-5" />
                    Llamar
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img src="/images/isphone-logo.png" alt="iSphone" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-sm text-gray-500 leading-relaxed">
                Evolución en tus manos. Equipos nuevos y de exhibición con garantía en Boyacá, Colombia.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Ramiriquí, Boyacá</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +57 318 682 3290</p>
                <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp disponible</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Síguenos</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} iSphone. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110">
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  )
}

export default App
