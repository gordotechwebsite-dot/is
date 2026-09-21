import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'
import { API_URL } from '../shared'

const DEFAULT_VIDEO = '/video/iphone17-pro.mp4'
const DEFAULT_POSTER = '/video/iphone17-pro-poster.jpg'

export default function HeroVideo() {
  const [src, setSrc] = useState(DEFAULT_VIDEO)
  const [poster, setPoster] = useState(DEFAULT_POSTER)

  useEffect(() => {
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data.hero_video) setSrc(data.hero_video)
        if (data.hero_video_poster) setPoster(data.hero_video_poster)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-sm bg-black">
        <video
          key={src}
          className="w-full aspect-video lg:aspect-auto lg:h-[520px] xl:h-[560px] object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="hidden lg:flex absolute inset-0 items-end p-12">
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-200 bg-white/10 backdrop-blur px-3 py-1 rounded-full mb-4">
              Boyacá · Nuevos y de exhibición
            </span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Evolución en tus manos
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              iPhone, Android, iPad, Mac y accesorios con garantía. Envíos contra entrega en todo Boyacá.
            </p>
            <div className="flex gap-3">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                Ver catálogo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/reparaciones"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                <Wrench className="w-5 h-5" /> Servicio técnico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
