import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wrench, Play } from 'lucide-react'
import { API_URL } from '../shared'

const DEFAULT_VIDEOS = ['/video/iphone18-pro.mp4', '/video/iphone17-pro.mp4']
const DEFAULT_POSTER = '/video/iphone18-pro-poster.jpg'
const DEFAULT_TITLE = 'Evolución en tus manos'
const DEFAULT_DESCRIPTION = 'Equipos, Accesorios y Soporte Técnico.'
const DEFAULT_CTA = 'Ver catálogo'

export default function HeroVideo() {
  const [playlist, setPlaylist] = useState<string[]>(DEFAULT_VIDEOS)
  const [index, setIndex] = useState(0)
  const src = playlist[index % playlist.length] ?? DEFAULT_VIDEOS[0]
  const [poster, setPoster] = useState(DEFAULT_POSTER)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION)
  const [ctaText, setCtaText] = useState(DEFAULT_CTA)
  const [needsTap, setNeedsTap] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const tryPlay = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true))
  }

  useEffect(() => { tryPlay() }, [index, src])

  useEffect(() => {
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        const list: string[] = Array.isArray(data.hero_videos)
          ? data.hero_videos.filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
          : []
        if (list.length === 0 && data.hero_video) list.push(data.hero_video)
        if (list.length > 0) { setPlaylist(list); setIndex(0) }
        if (data.hero_video_poster) setPoster(data.hero_video_poster)
        if (data.hero_title_1) setTitle(data.hero_title_1)
        if (data.hero_description) setDescription(data.hero_description)
        if (data.hero_cta_text) setCtaText(data.hero_cta_text)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-sm bg-black">
        <video
          ref={videoRef}
          key={`${index}-${src}`}
          className="w-full aspect-video lg:aspect-auto lg:h-[520px] xl:h-[560px] object-cover"
          src={src}
          poster={index === 0 ? poster : undefined}
          autoPlay
          muted
          loop={playlist.length === 1}
          playsInline
          preload="auto"
          onCanPlay={() => { if (videoRef.current?.paused) tryPlay() }}
          onPlaying={() => setNeedsTap(false)}
          onEnded={() => setIndex(i => (i + 1) % playlist.length)}
          onError={() => { if (playlist.length > 1) setIndex(i => (i + 1) % playlist.length) }}
        />
        {playlist.length > 1 && (
          <video
            key={`next-${(index + 1) % playlist.length}`}
            src={playlist[(index + 1) % playlist.length]}
            muted
            playsInline
            preload="auto"
            className="hidden"
            aria-hidden="true"
          />
        )}
        {needsTap && (
          <button
            type="button"
            onClick={tryPlay}
            aria-label="Reproducir video"
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
            </span>
          </button>
        )}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="hidden lg:flex absolute inset-0 items-end p-12 pointer-events-none">
          <div className="max-w-xl pointer-events-auto">
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              {description}
            </p>
            <div className="flex gap-3">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                {ctaText} <ArrowRight className="w-5 h-5" />
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
