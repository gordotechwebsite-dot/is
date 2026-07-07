import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ScrollReveal, API_URL, Category } from '../shared'

export default function Catalogo() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {})
  }, [])

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories grid - Samsung style */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">Explora por categoría</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((cat, i) => (
                <ScrollReveal key={cat.id} delay={i * 0.05}>
                  <Link
                    to={cat.slug === 'ofertas' ? '/ofertas' : `/categoria/${cat.slug}`}
                    className="group block"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
                      <img
                        src={cat.cover_image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="mt-3 text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No hay categorías disponibles</p>
          </div>
        )}
      </div>
    </section>
  )
}
