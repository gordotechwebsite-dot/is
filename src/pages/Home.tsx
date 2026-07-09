import BannerCarousel from '../components/BannerCarousel'

export default function Home() {
  return (
    <>
      <BannerCarousel />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f6f4f1] to-[#ece8e2] min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-white/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#e7e2da]/70 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="relative flex justify-center items-start animate-scale-in">
            {/* Soft glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] lg:w-[520px] lg:h-[520px] bg-white/70 rounded-full blur-[110px] lg:blur-[130px]" />

            <div className="relative w-full flex justify-around items-center px-2 sm:px-8 lg:px-16">
              <img
                src="/images/products/iphone-16-purple.webp"
                alt="iPhone"
                className="w-44 sm:w-64 lg:w-[22rem] drop-shadow-2xl animate-float"
                style={{ animationDelay: '0s' } as React.CSSProperties}
              />
              <img
                src="/images/products/iphone-16-blue.webp"
                alt="iPhone"
                className="w-44 sm:w-64 lg:w-[22rem] drop-shadow-2xl animate-float"
                style={{ animationDelay: '0.8s' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
