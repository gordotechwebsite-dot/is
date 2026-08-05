import { useState, useEffect, useCallback, useRef } from 'react'
import { Trash2, Edit, Plus, LogOut, Save, X, FolderOpen, Package, Home, Zap, Settings, ChevronLeft, Eye, Upload, Image, GalleryHorizontalEnd, Menu } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://isphone-api.vercel.app'

type Variant = { storage: string; color: string; price: string }
type Product = {
  id: number; name: string; brand: string; condition: string; image: string; images?: string[]
  storage: string[]; colors: string[]; price_range: string; badge: string | null; category: string | null
  variants?: Variant[]
}
type Category = { id: number; name: string; slug: string; cover_image: string; header_image?: string; position: number }
type Banner = { id: number; image: string; link: string | null; position: number; active: boolean }
type Offer = {
  id: number; title: string; description: string; badge: string | null
  icon: string | null; featured: boolean; active: boolean
}
type SiteContent = {
  hero_subtitle: string; hero_title_1: string; hero_title_2: string; hero_title_3: string
  hero_description: string; hero_image: string; hero_cta_text: string
  cta_title: string; cta_description: string; cta_button_text: string
  banner_text: string; banner_active: boolean
}

type Section = 'products' | 'categories' | 'banners' | 'landing' | 'offers' | 'settings'

const compressImage = (file: File, maxSize = 400): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize } }
        else { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize } }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const hasAlpha = file.type === 'image/png' || file.type === 'image/webp'
        if (hasAlpha) {
          const webp = canvas.toDataURL('image/webp', 0.85)
          resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png'))
        } else {
          resolve(canvas.toDataURL('image/jpeg', 0.6))
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

const ImageUpload = ({ value, onChange, label = 'Imagen', maxSize = 400, aspect = 'aspect-video', fit = 'cover' }: { value: string; onChange: (v: string) => void; label?: string; maxSize?: number; aspect?: string; fit?: 'cover' | 'contain' }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const dataUrl = await compressImage(file, maxSize)
    onChange(dataUrl)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className={`relative rounded-lg overflow-hidden bg-gray-800 ${aspect}`}>
          <img src={value} alt="Preview" className={`w-full h-full ${fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} />
          <div className="absolute top-1.5 right-1.5 flex gap-1.5">
            <button type="button" onClick={() => fileRef.current?.click()} title="Cambiar" aria-label="Cambiar"
              className="w-8 h-8 rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
              <Upload className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => onChange('')} title="Quitar" aria-label="Quitar"
              className="w-8 h-8 rounded-full bg-red-600/90 text-white shadow-md backdrop-blur flex items-center justify-center hover:bg-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-700 rounded-lg py-8 flex flex-col items-center gap-2 text-gray-500 hover:border-purple-500 hover:text-purple-400 transition-colors">
          {uploading ? (
            <span className="text-sm">Comprimiendo...</span>
          ) : (
            <>
              <Image className="w-8 h-8" />
              <span className="text-sm font-medium">Subir imagen</span>
              <span className="text-xs">JPG, PNG — se comprime automáticamente</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-800 my-8 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      {children}
    </div>
  </div>
)

const Input = ({ label, value, onChange, placeholder, required, type = 'text', textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; textarea?: boolean
}) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} rows={3}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
    )}
  </div>
)

function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('products')
  const [loading, setLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Product form
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [prodCondFilter, setProdCondFilter] = useState<'Todos' | 'Nuevo' | 'Exhibición'>('Todos')
  const [prodCatFilter, setProdCatFilter] = useState<string>('Todas')
  const [formName, setFormName] = useState('')
  const [formBrand, setFormBrand] = useState('apple')
  const [formCondition, setFormCondition] = useState('Nuevo')
  const [formStorage, setFormStorage] = useState('')
  const [formColors, setFormColors] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [formVariants, setFormVariants] = useState<Variant[]>([])

  // Category form
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catCoverImage, setCatCoverImage] = useState('')
  const [catHeaderImage, setCatHeaderImage] = useState('')
  const [catPosition, setCatPosition] = useState(0)

  // Banner form
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [bannerImage, setBannerImage] = useState('')
  const [bannerLink, setBannerLink] = useState('')
  const [bannerPosition, setBannerPosition] = useState(0)
  const [bannerActive, setBannerActive] = useState(true)

  // Offer form
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerTitle, setOfferTitle] = useState('')
  const [offerDesc, setOfferDesc] = useState('')
  const [offerBadge, setOfferBadge] = useState('')
  const [offerIcon, setOfferIcon] = useState('gift')
  const [offerFeatured, setOfferFeatured] = useState(false)
  const [offerActive, setOfferActive] = useState(true)

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token])

  const fetchAll = useCallback(async () => {
    const [prods, cats, bans, offs, sc] = await Promise.all([
      fetch(`${API_URL}/api/products`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/admin/banners`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/offers`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/site-content`).then(r => r.json()).catch(() => null),
    ])
    setProducts(prods)
    setCategories(cats)
    setBanners(Array.isArray(bans) ? bans : [])
    setOffers(offs)
    setSiteContent(sc)
  }, [token])

  useEffect(() => { if (token) fetchAll() }, [token, fetchAll])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) { setLoginError('Usuario o contraseña incorrectos'); return }
      const data = await res.json()
      setToken(data.token)
      localStorage.setItem('admin_token', data.token)
    } catch { setLoginError('Error de conexión') }
  }

  const handleLogout = () => {
    if (token) fetch(`${API_URL}/api/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const flash = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 3000) }

  // --- Products ---
  const resetProductForm = () => {
    setFormName(''); setFormBrand('apple'); setFormCondition('Nuevo'); setFormStorage('')
    setFormColors(''); setFormPrice(''); setFormBadge(''); setFormCategory(''); setFormImage('')
    setFormImages([])
    setFormVariants([])
    setEditing(null); setShowForm(false)
  }

  const openEditProduct = (p: Product) => {
    setEditing(p); setFormName(p.name); setFormBrand(p.brand); setFormCondition(p.condition)
    setFormStorage(p.storage.join(',')); setFormColors(p.colors.join(','))
    setFormPrice(p.price_range); setFormBadge(p.badge || ''); setFormCategory(p.category || '')
    setFormVariants(p.variants || [])
    setFormImage(p.image)
    setFormImages(p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []))
    setShowForm(true)
  }

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const gallery = formImages.filter(Boolean)
    const body = {
      name: formName, brand: formBrand, condition: formCondition,
      image: gallery[0] || formImage || '', images: gallery,
      storage: formStorage.split(',').map(s => s.trim()).filter(Boolean),
      colors: formColors.split(',').map(s => s.trim()).filter(Boolean),
      price_range: formPrice, badge: formBadge || null, category: formCategory || null,
      variants: formVariants.filter(v => v.price.trim()),
    }
    const url = editing ? `${API_URL}/api/admin/products/${editing.id}` : `${API_URL}/api/admin/products`
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) { await fetchAll(); resetProductForm(); flash('Producto guardado') }
    else flash('Error al guardar')
    setLoading(false)
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: headers() })
    await fetchAll(); flash('Producto eliminado')
  }

  // --- Categories ---
  const resetCatForm = () => { setCatName(''); setCatSlug(''); setCatCoverImage(''); setCatHeaderImage(''); setCatPosition(0); setEditingCat(null); setShowCatForm(false) }

  const openEditCat = (c: Category) => {
    setEditingCat(c); setCatName(c.name); setCatSlug(c.slug); setCatCoverImage(c.cover_image); setCatHeaderImage(c.header_image || ''); setCatPosition(c.position || 0); setShowCatForm(true)
  }

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const body = { name: catName, slug: catSlug, cover_image: catCoverImage, header_image: catHeaderImage, position: catPosition }
    const url = editingCat ? `${API_URL}/api/admin/categories/${editingCat.id}` : `${API_URL}/api/admin/categories`
    const method = editingCat ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) { await fetchAll(); resetCatForm(); flash('Categoría guardada') }
    else {
      const err = await res.json().catch(() => null)
      flash(err?.detail || 'Error al guardar — la imagen puede ser muy grande')
    }
    setLoading(false)
  }

  const deleteCat = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`${API_URL}/api/admin/categories/${id}`, { method: 'DELETE', headers: headers() })
    await fetchAll(); flash('Categoría eliminada')
  }

  // --- Banners ---
  const resetBannerForm = () => {
    setBannerImage(''); setBannerLink(''); setBannerPosition(0); setBannerActive(true)
    setEditingBanner(null); setShowBannerForm(false)
  }

  const openEditBanner = (b: Banner) => {
    setEditingBanner(b); setBannerImage(b.image); setBannerLink(b.link || '')
    setBannerPosition(b.position || 0); setBannerActive(b.active); setShowBannerForm(true)
  }

  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const body = { image: bannerImage, link: bannerLink || null, position: bannerPosition, active: bannerActive }
    const url = editingBanner ? `${API_URL}/api/admin/banners/${editingBanner.id}` : `${API_URL}/api/admin/banners`
    const method = editingBanner ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) { await fetchAll(); resetBannerForm(); flash('Banner guardado') }
    else {
      const err = await res.json().catch(() => null)
      flash(err?.detail || 'Error al guardar — la imagen puede ser muy grande')
    }
    setLoading(false)
  }

  const deleteBanner = async (id: number) => {
    if (!confirm('¿Eliminar este banner?')) return
    await fetch(`${API_URL}/api/admin/banners/${id}`, { method: 'DELETE', headers: headers() })
    await fetchAll(); flash('Banner eliminado')
  }

  // --- Offers ---
  const resetOfferForm = () => {
    setOfferTitle(''); setOfferDesc(''); setOfferBadge(''); setOfferIcon('gift')
    setOfferFeatured(false); setOfferActive(true); setEditingOffer(null); setShowOfferForm(false)
  }

  const openEditOffer = (o: Offer) => {
    setEditingOffer(o); setOfferTitle(o.title); setOfferDesc(o.description)
    setOfferBadge(o.badge || ''); setOfferIcon(o.icon || 'gift')
    setOfferFeatured(o.featured); setOfferActive(o.active); setShowOfferForm(true)
  }

  const saveOffer = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const body = { title: offerTitle, description: offerDesc, badge: offerBadge || null, icon: offerIcon || null, featured: offerFeatured, active: offerActive }
    const url = editingOffer ? `${API_URL}/api/admin/offers/${editingOffer.id}` : `${API_URL}/api/admin/offers`
    const method = editingOffer ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) { await fetchAll(); resetOfferForm(); flash('Oferta guardada') }
    else flash('Error al guardar')
    setLoading(false)
  }

  const deleteOffer = async (id: number) => {
    if (!confirm('¿Eliminar esta oferta?')) return
    await fetch(`${API_URL}/api/admin/offers/${id}`, { method: 'DELETE', headers: headers() })
    await fetchAll(); flash('Oferta eliminada')
  }

  // --- Site Content ---
  const saveSiteContent = async () => {
    if (!siteContent) return
    setLoading(true)
    const res = await fetch(`${API_URL}/api/admin/site-content`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(siteContent)
    })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) flash('Contenido guardado')
    else flash('Error al guardar')
    setLoading(false)
  }

  // Login screen
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">iSphone Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors">Ingresar</button>
          </form>
        </div>
      </div>
    )
  }

  const sidebarItems: { key: Section; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'products', label: 'Productos', icon: <Package className="w-5 h-5" />, count: products.length },
    { key: 'categories', label: 'Categorías', icon: <FolderOpen className="w-5 h-5" />, count: categories.length },
    { key: 'banners', label: 'Banners', icon: <GalleryHorizontalEnd className="w-5 h-5" />, count: banners.length },
    { key: 'offers', label: 'Ofertas', icon: <Zap className="w-5 h-5" />, count: offers.length },
    { key: 'landing', label: 'Página principal', icon: <Home className="w-5 h-5" /> },
    { key: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-gray-900 border-b border-gray-800 px-4 h-14">
        <button onClick={() => { setMobileMenuOpen(true); setSidebarOpen(true) }} className="text-gray-300 hover:text-white -ml-2 p-2" aria-label="Abrir menú">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold"><span className="text-purple-400">iSphone</span> Admin</h1>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white -mr-2 p-2" aria-label="Ver sitio"><Eye className="w-5 h-5" /></a>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 z-50 flex flex-col transition-transform duration-200 w-64 ${sidebarOpen ? 'lg:w-64' : 'lg:w-16'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && <h1 className="text-lg font-bold"><span className="text-purple-400">iSphone</span> Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-gray-400 hover:text-white p-1" aria-label="Contraer menú">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1" aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {sidebarItems.map(item => (
            <button key={item.key} onClick={() => { setActiveSection(item.key); setMobileMenuOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === item.key ? 'bg-purple-700/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {item.icon}
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          {sidebarOpen && (
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Eye className="w-4 h-4" /> Ver sitio
            </a>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-center gap-2' : 'justify-center'} text-sm text-gray-400 hover:text-red-400 py-2 rounded-lg hover:bg-gray-800 transition-colors`}>
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-200 p-4 sm:p-6 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Flash message */}
        {saveMsg && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium z-50 animate-fade-in">
            {saveMsg}
          </div>
        )}

        {/* ====== PRODUCTS ====== */}
        {activeSection === 'products' && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Productos</h2>
                <p className="text-gray-500 text-sm mt-1">{products.filter(p => (prodCondFilter === 'Todos' || p.condition === prodCondFilter) && (prodCatFilter === 'Todas' || p.category === prodCatFilter)).length} productos en el catálogo</p>
              </div>
              <button onClick={() => { resetProductForm(); setShowForm(true) }}
                className="flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(['Todos', 'Nuevo', 'Exhibición'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setProdCondFilter(opt)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    prodCondFilter === opt
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setProdCatFilter('Todas')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  prodCatFilter === 'Todas'
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-purple-500'
                }`}
              >
                Todas
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setProdCatFilter(c.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    prodCatFilter === c.slug
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {showForm && (
              <Modal title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={resetProductForm}>
                <form onSubmit={saveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Fotos del producto (la primera es la portada)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formImages.map((img, i) => (
                        <ImageUpload
                          key={i}
                          value={img}
                          label={i === 0 ? 'Portada' : `Foto ${i + 1}`}
                          aspect="aspect-square"
                          fit="contain"
                          onChange={v => setFormImages(prev => (
                            v ? prev.map((x, idx) => (idx === i ? v : x)) : prev.filter((_, idx) => idx !== i)
                          ))}
                        />
                      ))}
                      <ImageUpload
                        value=""
                        label="Agregar foto"
                        aspect="aspect-square"
                        fit="contain"
                        onChange={v => { if (v) setFormImages(prev => [...prev, v]) }}
                      />
                    </div>
                  </div>
                  <Input label="Nombre" value={formName} onChange={setFormName} placeholder="iPhone 16 Pro" required />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Marca</label>
                      <select value={formBrand} onChange={e => setFormBrand(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                        <option value="apple">Apple</option>
                        <option value="samsung">Samsung</option>
                        <option value="xiaomi">Xiaomi</option>
                        <option value="motorola">Motorola</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Condición</label>
                      <select value={formCondition} onChange={e => setFormCondition(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                        <option value="Nuevo">Nuevo</option>
                        <option value="Exhibición">Exhibición</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <Input label="Almacenamiento (separar con coma)" value={formStorage} onChange={setFormStorage} placeholder="128GB,256GB,512GB" required />
                  <Input label="Colores (separar con coma)" value={formColors} onChange={setFormColors} placeholder="Negro,Blanco,Azul" required />
                  <Input label="Rango de precio" value={formPrice} onChange={setFormPrice} placeholder="Desde $3.400.000" required />
                  <Input label="Etiqueta (opcional)" value={formBadge} onChange={setFormBadge} placeholder="Pro, Ultra, Nuevo..." />

                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm text-gray-400">Precios por variante (opcional)</label>
                      <button type="button"
                        onClick={() => setFormVariants([...formVariants, {
                          storage: formStorage.split(',').map(s => s.trim()).filter(Boolean)[0] || '',
                          color: formColors.split(',').map(s => s.trim()).filter(Boolean)[0] || '',
                          price: '',
                        }])}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                        <Plus className="w-3 h-3" /> Agregar variante
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Si defines variantes, el cliente elige capacidad + color y verá el precio exacto. Si no, se muestra el precio de arriba.</p>
                    {formVariants.length > 0 && (
                      <div className="space-y-2">
                        {formVariants.map((v, idx) => {
                          const storageOpts = formStorage.split(',').map(s => s.trim()).filter(Boolean)
                          const colorOpts = formColors.split(',').map(s => s.trim()).filter(Boolean)
                          const update = (field: keyof Variant, value: string) => {
                            setFormVariants(formVariants.map((x, i) => i === idx ? { ...x, [field]: value } : x))
                          }
                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              <select value={v.storage} onChange={e => update('storage', e.target.value)}
                                className="flex-1 min-w-0 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                                {storageOpts.length === 0 && <option value="">—</option>}
                                {storageOpts.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <select value={v.color} onChange={e => update('color', e.target.value)}
                                className="flex-1 min-w-0 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                                {colorOpts.length === 0 && <option value="">—</option>}
                                {colorOpts.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <input value={v.price} onChange={e => update('price', e.target.value)} placeholder="$3.400.000"
                                className="flex-1 min-w-0 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                              <button type="button" onClick={() => setFormVariants(formVariants.filter((_, i) => i !== idx))}
                                className="p-2 text-gray-500 hover:text-red-400 shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={resetProductForm} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">Cancelar</button>
                  </div>
                </form>
              </Modal>
            )}

            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No hay productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.filter(p => (prodCondFilter === 'Todos' || p.condition === prodCondFilter) && (prodCatFilter === 'Todas' || p.category === prodCatFilter)).map(p => (
                  <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                    <div className="aspect-square bg-gray-800 p-4 relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      {p.badge && <span className="absolute top-2 left-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">{p.badge}</span>}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditProduct(p)} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.brand} · {p.condition}</p>
                      {p.category && <p className="text-xs text-purple-400 mt-0.5">{p.category}</p>}
                      <p className="text-purple-400 text-sm font-semibold mt-1">{p.price_range}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ====== CATEGORIES ====== */}
        {activeSection === 'categories' && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Categorías</h2>
                <p className="text-gray-500 text-sm mt-1">Organiza tus productos en categorías con portada</p>
              </div>
              <button onClick={() => { resetCatForm(); setShowCatForm(true) }}
                className="flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Nueva categoría
              </button>
            </div>

            {showCatForm && (
              <Modal title={editingCat ? 'Editar categoría' : 'Nueva categoría'} onClose={resetCatForm}>
                <form onSubmit={saveCat} className="space-y-4">
                  <Input label="Nombre" value={catName} onChange={v => { setCatName(v); if (!editingCat) setCatSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} placeholder="Smartphones" required />
                  <Input label="Slug (URL)" value={catSlug} onChange={setCatSlug} placeholder="smartphones" required />
                  <ImageUpload value={catCoverImage} onChange={setCatCoverImage} label="Imagen de portada (tarjeta del catálogo)" aspect="aspect-square" />
                  <ImageUpload value={catHeaderImage} onChange={setCatHeaderImage} label="Imagen del encabezado (fondo del título dentro de la categoría)" />
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Posición (orden en catálogo)</label>
                    <input type="number" min={0} value={catPosition} onChange={e => setCatPosition(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={resetCatForm} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">Cancelar</button>
                  </div>
                </form>
              </Modal>
            )}

            {categories.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No hay categorías</p>
                <p className="text-sm mt-1">Crea tu primera categoría para organizar productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                    <div className="aspect-video bg-gray-800 relative">
                      <img src={c.cover_image} alt={c.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-3 left-4 text-lg font-bold text-white">{c.name}</h3>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCat(c)} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteCat(c.id)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400">/{c.slug}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{products.filter(p => p.category === c.slug).length} productos</p>
                        <p className="text-xs text-gray-500">Pos: {c.position || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ====== BANNERS ====== */}
        {activeSection === 'banners' && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Banners del inicio</h2>
                <p className="text-gray-500 text-sm mt-1">Imágenes del carrusel publicitario (rotan cada 7 segundos)</p>
              </div>
              <button onClick={() => { resetBannerForm(); setShowBannerForm(true) }}
                className="flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Nuevo banner
              </button>
            </div>

            {showBannerForm && (
              <Modal title={editingBanner ? 'Editar banner' : 'Nuevo banner'} onClose={resetBannerForm}>
                <form onSubmit={saveBanner} className="space-y-4">
                  <ImageUpload value={bannerImage} onChange={setBannerImage} label="Imagen del banner (recomendado 1200×400)" maxSize={1000} aspect="aspect-[3/1]" />
                  <Input label="Enlace al tocar (opcional)" value={bannerLink} onChange={setBannerLink} placeholder="/ofertas o https://..." />
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Posición (orden en el carrusel)</label>
                    <input type="number" min={0} value={bannerPosition} onChange={e => setBannerPosition(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-300">Activo (visible en el sitio)</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={resetBannerForm} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">Cancelar</button>
                  </div>
                </form>
              </Modal>
            )}

            {banners.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <GalleryHorizontalEnd className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No hay banners</p>
                <p className="text-sm mt-1">Agrega imágenes para el carrusel del inicio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map(b => (
                  <div key={b.id} className={`bg-gray-900 rounded-xl border ${b.active ? 'border-gray-800' : 'border-gray-800/50 opacity-50'} overflow-hidden group`}>
                    <div className="aspect-[3/1] bg-gray-800 relative">
                      <img src={b.image} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditBanner(b)} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteBanner(b.id)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      {!b.active && <span className="absolute top-2 left-2 text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full">Inactivo</span>}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate">{b.link || 'Sin enlace'}</p>
                      <p className="text-xs text-gray-500 flex-shrink-0 ml-2">Pos: {b.position || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ====== OFFERS ====== */}
        {activeSection === 'offers' && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Ofertas y Promociones</h2>
                <p className="text-gray-500 text-sm mt-1">Administra las ofertas que aparecen en la página de Ofertas</p>
              </div>
              <button onClick={() => { resetOfferForm(); setShowOfferForm(true) }}
                className="flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Nueva oferta
              </button>
            </div>

            {showOfferForm && (
              <Modal title={editingOffer ? 'Editar oferta' : 'Nueva oferta'} onClose={resetOfferForm}>
                <form onSubmit={saveOffer} className="space-y-4">
                  <Input label="Título" value={offerTitle} onChange={setOfferTitle} placeholder="Regalo primera compra" required />
                  <Input label="Descripción" value={offerDesc} onChange={setOfferDesc} placeholder="Descripción de la oferta..." required textarea />
                  <Input label="Etiqueta (opcional)" value={offerBadge} onChange={setOfferBadge} placeholder="🎁 PROMOCIÓN ACTIVA" />
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ícono</label>
                    <select value={offerIcon} onChange={e => setOfferIcon(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                      <option value="gift">🎁 Regalo</option>
                      <option value="percent">💰 Descuento</option>
                      <option value="tag">🏷️ Etiqueta</option>
                      <option value="zap">⚡ Rayo</option>
                      <option value="star">⭐ Estrella</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={offerFeatured} onChange={e => setOfferFeatured(e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" />
                      <span className="text-sm text-gray-300">Destacada (aparece grande)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={offerActive} onChange={e => setOfferActive(e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" />
                      <span className="text-sm text-gray-300">Activa</span>
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={resetOfferForm} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">Cancelar</button>
                  </div>
                </form>
              </Modal>
            )}

            {offers.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No hay ofertas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map(o => (
                  <div key={o.id} className={`bg-gray-900 rounded-xl border ${o.active ? 'border-gray-800' : 'border-gray-800/50 opacity-50'} p-4 flex items-start gap-4 group`}>
                    <div className="w-10 h-10 bg-purple-700/20 rounded-xl flex items-center justify-center text-purple-400 flex-shrink-0">
                      {o.icon === 'gift' ? '🎁' : o.icon === 'percent' ? '💰' : o.icon === 'tag' ? '🏷️' : o.icon === 'zap' ? '⚡' : '⭐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{o.title}</h3>
                        {o.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Destacada</span>}
                        {!o.active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Inactiva</span>}
                        {o.badge && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{o.badge}</span>}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{o.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEditOffer(o)} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteOffer(o.id)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ====== LANDING PAGE ====== */}
        {activeSection === 'landing' && siteContent && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Página Principal</h2>
                <p className="text-gray-500 text-sm mt-1">Edita el contenido del hero, CTA y banner promocional</p>
              </div>
              <button onClick={saveSiteContent} disabled={loading}
                className="flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors w-full sm:w-auto">
                <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Hero */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Hero (sección principal)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtítulo superior</label>
                    <input value={siteContent.hero_subtitle} onChange={e => setSiteContent({ ...siteContent, hero_subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Título línea 1</label>
                      <input value={siteContent.hero_title_1} onChange={e => setSiteContent({ ...siteContent, hero_title_1: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Título línea 2 (degradado)</label>
                      <input value={siteContent.hero_title_2} onChange={e => setSiteContent({ ...siteContent, hero_title_2: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Título línea 3</label>
                      <input value={siteContent.hero_title_3} onChange={e => setSiteContent({ ...siteContent, hero_title_3: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                    <textarea value={siteContent.hero_description} onChange={e => setSiteContent({ ...siteContent, hero_description: e.target.value })} rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">URL imagen hero</label>
                      <input value={siteContent.hero_image} onChange={e => setSiteContent({ ...siteContent, hero_image: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Texto botón CTA</label>
                      <input value={siteContent.hero_cta_text} onChange={e => setSiteContent({ ...siteContent, hero_cta_text: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  {siteContent.hero_image && (
                    <div className="bg-gray-800 rounded-lg p-2 flex justify-center">
                      <img src={siteContent.hero_image} alt="Hero preview" className="h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Sección CTA (llamada a la acción)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Título</label>
                    <input value={siteContent.cta_title} onChange={e => setSiteContent({ ...siteContent, cta_title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                    <textarea value={siteContent.cta_description} onChange={e => setSiteContent({ ...siteContent, cta_description: e.target.value })} rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Texto del botón</label>
                    <input value={siteContent.cta_button_text} onChange={e => setSiteContent({ ...siteContent, cta_button_text: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Banner promocional (móvil)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Texto del banner</label>
                    <input value={siteContent.banner_text} onChange={e => setSiteContent({ ...siteContent, banner_text: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={siteContent.banner_active} onChange={e => setSiteContent({ ...siteContent, banner_active: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-300">Banner activo</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====== SETTINGS ====== */}
        {activeSection === 'settings' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Configuración</h2>
              <p className="text-gray-500 text-sm mt-1">Información general del sitio</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Enlaces del sitio</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-gray-300 font-medium">Sitio público:</span> <a href="https://isphone.vercel.app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">https://isphone.vercel.app</a></p>
                  <p><span className="text-gray-300 font-medium">API:</span> <a href="https://isphone-api.vercel.app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">https://isphone-api.vercel.app</a></p>
                  <p><span className="text-gray-300 font-medium">Admin:</span> <a href="https://isphone.vercel.app/admin" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">https://isphone.vercel.app/admin</a></p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Redes sociales</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-gray-300 font-medium">WhatsApp:</span> +57 318 682 3290</p>
                  <p><span className="text-gray-300 font-medium">Instagram:</span> <a href="https://www.instagram.com/isphonecol" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">@isphonecol</a></p>
                  <p><span className="text-gray-300 font-medium">Facebook:</span> <a href="https://www.facebook.com/share/1LQ2kyQA8z/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">iSphone Facebook</a></p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Credenciales</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-gray-300 font-medium">Usuario:</span> admin</p>
                  <p><span className="text-gray-300 font-medium">Contraseña:</span> isphone2026</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Admin
