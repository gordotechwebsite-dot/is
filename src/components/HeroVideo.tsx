export default function HeroVideo() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative overflow-hidden rounded-2xl shadow-sm bg-black">
        <video
          className="w-full aspect-video object-cover"
          src="/video/iphone17-pro.mp4"
          poster="/video/iphone17-pro-poster.jpg"
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
