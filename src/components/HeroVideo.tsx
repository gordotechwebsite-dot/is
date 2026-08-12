import { useState, useEffect } from 'react'
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
      <div className="relative overflow-hidden rounded-2xl shadow-sm bg-black">
        <video
          key={src}
          className="w-full aspect-video object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  )
}
