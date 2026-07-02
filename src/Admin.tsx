import { useState, useEffect, useCallback } from 'react'
import { Trash2, Edit, Plus, LogOut, Save, X, Upload } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

type Product = {
  id: number
  name: string
  brand: string
  condition: string
  image: string
  storage: string[]
  colors: string[]
  price_range: string
  badge: string | null
}

function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formBrand, setFormBrand] = useState('apple')
  const [formCondition, setFormCondition] = useState('Nuevo')
  const [formStorage, setFormStorage] = useState('')
  const [formColors, setFormColors] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formImage, setFormImage] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`)
      const data = await res.json()
      setProducts(data)
    } catch {
      console.error('Error loading products')
    }
  }, [])

  useEffect(() => {
    if (token) fetchProducts()
  }, [token, fetchProducts])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setLoginError('Usuario o contraseña incorrectos')
        return
      }
      const data = await res.json()
      setToken(data.token)
      localStorage.setItem('admin_token', data.token)
    } catch {
      setLoginError('Error de conexión')
    }
  }

  const handleLogout = () => {
    if (token) {
      fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const resetForm = () => {
    setFormName('')
    setFormBrand('apple')
    setFormCondition('Nuevo')
    setFormStorage('')
    setFormColors('')
    setFormPrice('')
    setFormBadge('')
    setFormImage(null)
    setFormImagePreview('')
    setEditing(null)
    setShowForm(false)
  }

  const openEditForm = (product: Product) => {
    setEditing(product)
    setFormName(product.name)
    setFormBrand(product.brand)
    setFormCondition(product.condition)
    setFormStorage(product.storage.join(','))
    setFormColors(product.colors.join(','))
    setFormPrice(product.price_range)
    setFormBadge(product.badge || '')
    setFormImage(null)
    setFormImagePreview(product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`)
    setShowForm(true)
  }

  const openNewForm = () => {
    resetForm()
    setShowForm(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormImage(file)
      setFormImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)

    const formData = new FormData()
    formData.append('name', formName)
    formData.append('brand', formBrand)
    formData.append('condition', formCondition)
    formData.append('storage', formStorage)
    formData.append('colors', formColors)
    formData.append('price_range', formPrice)
    if (formBadge) formData.append('badge', formBadge)
    if (formImage) formData.append('image', formImage)

    try {
      const url = editing
        ? `${API_URL}/api/admin/products/${editing.id}`
        : `${API_URL}/api/admin/products`
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.status === 401) {
        handleLogout()
        return
      }

      if (!res.ok) {
        alert('Error al guardar el producto')
        return
      }

      await fetchProducts()
      resetForm()
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      await fetchProducts()
    } catch {
      alert('Error al eliminar')
    }
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
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-purple-400">iSphone</span> Admin
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Productos ({products.length})
          </h2>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar producto
          </button>
        </div>

        {/* Product form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-800 my-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editing ? 'Editar producto' : 'Nuevo producto'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image upload */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Imagen</label>
                  <div className="flex items-center gap-4">
                    {formImagePreview && (
                      <img src={formImagePreview} alt="Preview" className="w-20 h-20 object-contain bg-gray-800 rounded-lg" />
                    )}
                    <label className="cursor-pointer flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">{formImage ? formImage.name : 'Subir imagen'}</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  {!editing && !formImage && (
                    <p className="text-xs text-red-400 mt-1">* Imagen requerida para productos nuevos</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="iPhone 16 Pro"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Brand + Condition */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Marca</label>
                    <select
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="apple">Apple</option>
                      <option value="samsung">Samsung</option>
                      <option value="xiaomi">Xiaomi</option>
                      <option value="motorola">Motorola</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Condición</label>
                    <select
                      value={formCondition}
                      onChange={e => setFormCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="Exhibición">Exhibición</option>
                    </select>
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Almacenamiento (separar con coma)</label>
                  <input
                    type="text"
                    value={formStorage}
                    onChange={e => setFormStorage(e.target.value)}
                    placeholder="128GB,256GB,512GB"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Colores (separar con coma)</label>
                  <input
                    type="text"
                    value={formColors}
                    onChange={e => setFormColors(e.target.value)}
                    placeholder="Negro,Blanco,Azul"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rango de precio</label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="Desde $3.400.000"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Etiqueta (opcional)</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={e => setFormBadge(e.target.value)}
                    placeholder="Pro, Ultra, Galaxy AI, Nuevo..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || (!editing && !formImage)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear producto'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No hay productos</p>
            <p className="text-sm mt-1">Agrega tu primer producto con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                <div className="aspect-square bg-gray-800 p-4 relative">
                  <img
                    src={product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  {/* Action buttons on hover */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(product)}
                      className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{product.brand} · {product.condition}</p>
                  <p className="text-purple-400 text-sm font-semibold mt-1">{product.price_range}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
