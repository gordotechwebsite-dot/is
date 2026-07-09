import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, type Banner } from '../shared'

const INTERVAL = 7000

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/banners`)
      .then(r => r.json())
      .then((data: Banner[]) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    timer.current = setInterval(() => setIndex(i => i + 1), INTERVAL)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [banners.length])

  if (banners.length === 0) return null

  // Append a clone of the first slide for a seamless right-to-left loop.
  const slides = [...banners, banners[0]]

  const handleTransitionEnd = () => {
    if (index === banners.length) {
      setAnimate(false)
      setIndex(0)
    }
  }

  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  const goTo = (i: number) => {
    setAnimate(true)
    setIndex(i)
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate ? 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((b, i) => {
            const content = (
              <img
                src={b.image}
                alt="Promoción"
                className="w-full aspect-[3/1] object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )
            return (
              <div key={`${b.id}-${i}`} className="w-full shrink-0">
                {b.link
                  ? (b.link.startsWith('http')
                      ? <a href={b.link} target="_blank" rel="noopener noreferrer">{content}</a>
                      : <Link to={b.link}>{content}</Link>)
                  : content}
              </div>
            )
          })}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  (index % banners.length) === i ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
