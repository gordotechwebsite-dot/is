import { useState, useEffect, useCallback } from 'react'
import { Trash2, Edit, Plus, LogOut, Save, X, FolderOpen, Package, Home, Zap, Settings, ChevronLeft, Eye } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://isphone-api.vercel.app'

type Product = {
  id: number; name: string; brand: string; condition: string; image: string
  storage: string[]; colors: string[]; price_range: string; badge: string | null; category: string | null
}
type Category = { id: number; name: string; slug: string; cover_image: string }
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

type Section = 'products' | 'categories' | 'landing' | 'offers' | 'settings'

function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('products')
  const [loading, setLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Product form
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formBrand, setFormBrand] = useState('apple')
  const [formCondition, setFormCondition] = useState('Nuevo')
  const [formStorage, setFormStorage] = useState('')
  const [formColors, setFormColors] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formImage, setFormImage] = useState('')

  // Category form
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catCoverImage, setCatCoverImage] = useState('')

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
    const [prods, cats, offs, sc] = await Promise.all([
      fetch(`${API_URL}/api/products`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/offers`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/site-content`).then(r => r.json()).catch(() => null),
    ])
    setProducts(prods)
    setCategories(cats)
    setOffers(offs)
    setSiteContent(sc)
  }, [])

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
    setEditing(null); setShowForm(false)
  }

  const openEditProduct = (p: Product) => {
    setEditing(p); setFormName(p.name); setFormBrand(p.brand); setFormCondition(p.condition)
    setFormStorage(p.storage.join(',')); setFormColors(p.colors.join(','))
    setFormPrice(p.price_range); setFormBadge(p.badge || ''); setFormCategory(p.category || '')
    setFormImage(p.image); setShowForm(true)
  }

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const body = {
      name: formName, brand: formBrand, condition: formCondition, image: formImage,
      storage: formStorage.split(',').map(s => s.trim()).filter(Boolean),
      colors: formColors.split(',').map(s => s.trim()).filter(Boolean),
      price_range: formPrice, badge: formBadge || null, category: formCategory || null,
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
  const resetCatForm = () => { setCatName(''); setCatSlug(''); setCatCoverImage(''); setEditingCat(null); setShowCatForm(false) }

  const openEditCat = (c: Category) => {
    setEditingCat(c); setCatName(c.name); setCatSlug(c.slug); setCatCoverImage(c.cover_image); setShowCatForm(true)
  }

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const body = { name: catName, slug: catSlug, cover_image: catCoverImage }
    const url = editingCat ? `${API_URL}/api/admin/categories/${editingCat.id}` : `${API_URL}/api/admin/categories`
    const method = editingCat ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) { handleLogout(); return }
    if (res.ok) { await fetchAll(); resetCatForm(); flash('Categoría guardada') }
    else flash('Error al guardar')
    setLoading(false)
  }

  const deleteCat = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`${API_URL}/api/admin/categories/${id}`, { method: 'DELETE', headers: headers() })
    await fetchAll(); flash('Categoría eliminada')
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
    { key: 'offers', label: 'Ofertas', icon: <Zap className="w-5 h-5" />, count: offers.length },
    { key: 'landing', label: 'Página principal', icon: <Home className="w-5 h-5" /> },
    { key: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ]

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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 z-40 transition-all duration-200 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && <h1 className="text-lg font-bold"><span className="text-purple-400">iSphone</span> Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {sidebarItems.map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
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
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-200 p-6`}>
        {/* Flash message */}
        {saveMsg && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium z-50 animate-fade-in">
            {saveMsg}
          </div>
        )}

        {/* ====== PRODUCTS ====== */}
        {activeSection === 'products' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Productos</h2>
                <p className="text-gray-500 text-sm mt-1">{products.length} productos en el catálogo</p>
              </div>
              <button onClick={() => { resetProductForm(); setShowForm(true) }}
                className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {showForm && (
              <Modal title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={resetProductForm}>
                <form onSubmit={saveProduct} className="space-y-4">
                  <Input label="URL de imagen" value={formImage} onChange={setFormImage} placeholder="/images/products/..." required />
                  {formImage && (
                    <div className="bg-gray-800 rounded-lg p-2 flex justify-center">
                      <img src={formImage} alt="Preview" className="h-24 object-contain" />
                    </div>
                  )}
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
                {products.map(p => (
                  <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                    <div className="aspect-square bg-gray-800 p-4 relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      {p.badge && <span className="absolute top-2 left-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">{p.badge}</span>}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Categorías</h2>
                <p className="text-gray-500 text-sm mt-1">Organiza tus productos en categorías con portada</p>
              </div>
              <button onClick={() => { resetCatForm(); setShowCatForm(true) }}
                className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors">
                <Plus className="w-4 h-4" /> Nueva categoría
              </button>
            </div>

            {showCatForm && (
              <Modal title={editingCat ? 'Editar categoría' : 'Nueva categoría'} onClose={resetCatForm}>
                <form onSubmit={saveCat} className="space-y-4">
                  <Input label="Nombre" value={catName} onChange={v => { setCatName(v); if (!editingCat) setCatSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} placeholder="Smartphones" required />
                  <Input label="Slug (URL)" value={catSlug} onChange={setCatSlug} placeholder="smartphones" required />
                  <Input label="URL de imagen de portada" value={catCoverImage} onChange={setCatCoverImage} placeholder="https://ejemplo.com/imagen.jpg" required />
                  {catCoverImage && (
                    <div className="rounded-lg overflow-hidden bg-gray-800 aspect-video">
                      <img src={catCoverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
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
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCat(c)} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteCat(c.id)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400">/{c.slug}</p>
                      <p className="text-xs text-gray-500 mt-1">{products.filter(p => p.category === c.slug).length} productos</p>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Ofertas y Promociones</h2>
                <p className="text-gray-500 text-sm mt-1">Administra las ofertas que aparecen en la página de Ofertas</p>
              </div>
              <button onClick={() => { resetOfferForm(); setShowOfferForm(true) }}
                className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors">
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Página Principal</h2>
                <p className="text-gray-500 text-sm mt-1">Edita el contenido del hero, CTA y banner promocional</p>
              </div>
              <button onClick={saveSiteContent} disabled={loading}
                className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors">
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
                  <div className="grid grid-cols-3 gap-3">
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
