import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Phone, MapPin, Menu, X, Instagram } from 'lucide-react'
import { WhatsAppIcon, WHATSAPP_LINK } from './shared'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/trade-in', label: 'Trade-In' },
    { to: '/envios', label: 'Envíos' },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/isphone-logo.png" alt="iSphone" className="h-20 md:h-24" />
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
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className={`block font-medium py-2 ${
                    location.pathname === link.to ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="block bg-purple-700 text-white px-5 py-3 rounded-full text-center font-medium">
                WhatsApp
              </a>
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
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
        <WhatsAppIcon className="w-14 h-14" />
      </a>
    </div>
  )
}
