import { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Phone, MapPin, Menu, X, Instagram, Search, Zap } from 'lucide-react'
import { WhatsAppIcon, WHATSAPP_LINK, API_URL, Product } from './shared'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bannerText, setBannerText] = useState('OBTÉN UN REGALO POR TU PRIMERA COMPRA MAYOR A $250.000')
  const [bannerActive, setBannerActive] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    if (searchOpen && allProducts.length === 0) {
      fetch(`${API_URL}/api/products`).then(r => r.json()).then((data: Product[]) => {
        setAllProducts(data.map(p => ({
          ...p,
          priceRange: (p as unknown as Record<string, string>).price_range || p.priceRange || '',
          image: p.image && p.image.startsWith('/api/') ? `${API_URL}${p.image}` : p.image,
        })))
      }).catch(() => {})
    }
  }, [searchOpen])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    setSearchResults(allProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    ))
  }, [searchQuery, allProducts])

  useEffect(() => { setSearchOpen(false); setSearchQuery('') }, [location])

  useEffect(() => {
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data.banner_text) setBannerText(data.banner_text)
        if (data.banner_active !== undefined) setBannerActive(data.banner_active)
      })
      .catch(() => {})
  }, [])

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/trade-in', label: 'Trade-In' },
    { to: '/ofertas', label: 'Ofertas' },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Desktop: logo left */}
            <Link to="/" className="hidden md:flex items-center gap-2">
              <img src="/images/isphone-logo.webp" alt="iSphone" className="h-24" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-purple-700'
                      : 'text-gray-700 hover:text-purple-700'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition-colors flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            {/* Mobile: logo centered absolutely */}
            <Link to="/" className="md:hidden absolute left-1/2 -translate-x-1/2">
              <img src="/images/isphone-logo.webp" alt="iSphone" className="h-32" />
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className={`block font-medium py-2 ${
                    location.pathname === link.to ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                  {link.label}
                </Link>
              ))}
              {/* Social icons */}
              <div className="flex justify-center gap-6 pt-4 border-t border-gray-100">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/share/1LQ2kyQA8z/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/isphonecol" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.34 6.34 0 001.83-4.46V8.73a8.19 8.19 0 004.75 1.52V6.79a4.83 4.83 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img src="/images/isphone-logo.webp" alt="iSphone" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-sm text-gray-500 leading-relaxed">
                Evolución en tus manos. Equipos nuevos y de exhibición con garantía en Boyacá, Colombia.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Ramiriquí, Boyacá</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +57 318 682 3290</p>
                <p className="flex items-center gap-2"><WhatsAppIcon className="w-4 h-4" /> WhatsApp disponible</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Síguenos</h4>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/isphonecol" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} iSphone. Todos los derechos reservados.</p>
            <Link to="/admin" className="inline-block mt-3 text-gray-600 hover:text-purple-400 transition-colors text-xs">
              Login
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile floating island - right side */}
      <div className="md:hidden fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <div className="bg-white/20 backdrop-blur-xl rounded-full py-3 px-2 flex flex-col items-center gap-4 shadow-xl border border-white/30">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-gray-800">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false) }}
            className="w-10 h-10 flex items-center justify-center text-gray-800">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => { navigate('/ofertas'); setMobileMenuOpen(false) }}
            className="w-10 h-10 flex items-center justify-center text-gray-800">
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile promo banner - seamless infinite scrolling */}
      {bannerActive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black text-white overflow-hidden">
          <div className="animate-marquee inline-flex whitespace-nowrap py-2 text-xs font-semibold tracking-wide">
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
            <span className="mx-8">🎁 {bannerText}</span>
          </div>
        </div>
      )}

      {/* Floating WhatsApp button */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-10 md:bottom-6 right-6 z-50 hover:scale-110 transition-all">
        <WhatsAppIcon className="w-14 h-14" />
      </a>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          {/* Search panel */}
          <div className="relative mt-0 w-full max-w-2xl mx-auto flex flex-col max-h-full">
            {/* Search header */}
            <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-purple-600 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-400"
                  autoComplete="off"
                />
                <button onClick={() => setSearchOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[70vh] overflow-y-auto">
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-gray-400 text-sm">No se encontraron resultados para "<span className="text-gray-600 font-medium">{searchQuery}</span>"</p>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="divide-y divide-gray-50">
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        to={`/producto/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-purple-50 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand} · {product.condition}</p>
                          {product.priceRange && <p className="text-xs font-bold text-purple-700 mt-0.5">{product.priceRange}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
