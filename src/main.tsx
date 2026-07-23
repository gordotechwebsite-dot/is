import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.tsx'
import Home from './pages/Home.tsx'
import './index.css'

const Catalogo = lazy(() => import('./pages/Catalogo.tsx'))
const Destacados = lazy(() => import('./pages/Destacados.tsx'))
const TradeIn = lazy(() => import('./pages/TradeIn.tsx'))
const Envios = lazy(() => import('./pages/Envios.tsx'))
const Ofertas = lazy(() => import('./pages/Ofertas.tsx'))
const Contacto = lazy(() => import('./pages/Contacto.tsx'))
const CategoriaDetail = lazy(() => import('./pages/CategoriaDetail.tsx'))
const ProductoDetail = lazy(() => import('./pages/ProductoDetail.tsx'))
const Admin = lazy(() => import('./Admin.tsx'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <img src="/images/apple-logo.webp" alt="Cargando..." className="w-16 h-16 object-contain animate-pulse-logo" />
    </div>
  )
}

export { PageLoader }

const loader = document.getElementById('loader')
if (loader) {
  loader.style.transition = 'opacity 0.3s ease'
  loader.style.opacity = '0'
  setTimeout(() => loader.remove(), 300)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/destacados" element={<Destacados />} />
            <Route path="/trade-in" element={<TradeIn />} />
            <Route path="/envios" element={<Envios />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/categoria/:slug" element={<CategoriaDetail />} />
            <Route path="/producto/:id" element={<ProductoDetail />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
