import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout.tsx'
import Home from './pages/Home.tsx'
import Catalogo from './pages/Catalogo.tsx'
import TradeIn from './pages/TradeIn.tsx'
import Envios from './pages/Envios.tsx'
import Ofertas from './pages/Ofertas.tsx'
import Contacto from './pages/Contacto.tsx'
import Admin from './Admin.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/trade-in" element={<TradeIn />} />
          <Route path="/envios" element={<Envios />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
