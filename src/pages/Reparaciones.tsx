import { useState, useRef } from 'react'
import {
  Smartphone, Tablet, Laptop, Monitor, Watch, Plug,
  ChevronRight, ChevronLeft, BatteryCharging, ScanFace, Layers,
  CircuitBoard, MemoryStick, Camera, Volume2, Settings, Sparkles,
  Keyboard, Cpu, HelpCircle, Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ScrollReveal, WHATSAPP_LINK } from '../shared'

type Device = {
  id: string
  name: string
  icon: LucideIcon
  desc: string
  options: string[]
}

const DEVICES: Device[] = [
  {
    id: 'iphone',
    name: 'iPhone',
    icon: Smartphone,
    desc: 'Reparación de iPhone disponible desde el iPhone 7 hasta el último.',
    options: [
      'Reparación de batería',
      'Reparación de pantalla',
      'Reparación de Face ID',
      'Reparación cristal trasero',
      'Reparaciones electrónicas',
      'Aumento de memoria',
      'Reparación cristal cámara',
      'Reparación auricular',
      'Mantenimiento',
      'Otro tipo de fallas',
    ],
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: Tablet,
    desc: 'Servicio técnico experto para tu iPad con precisión y calidad.',
    options: [
      'Reparación electrónica',
      'Reparación de cristal',
      'Cambio de cristal táctil',
      'Cambio de display',
      'Reparación de Face ID',
      'Alineación de BackCover',
      'Cambio de batería',
      'Otro tipo de fallas',
    ],
  },
  {
    id: 'macbook',
    name: 'MacBook',
    icon: Laptop,
    desc: 'Especialistas en hardware y microelectrónica, con garantía.',
    options: [
      'Reparación electrónica',
      'Reparación Flex Gate',
      'Cambio de teclado',
      'Cambio de batería',
      'Optimización',
      'Reemplazo Touch Bar',
      'Reemplazo LCD',
      'Bisel de pantalla',
      'Otro tipo de fallas',
    ],
  },
  {
    id: 'imac',
    name: 'iMac',
    icon: Monitor,
    desc: 'Reparaciones y mantenimiento de computadores Apple.',
    options: [
      'Reparación electrónica',
      'Optimización y mantenimiento',
      'Cambio de pantalla',
      'Otro tipo de fallas',
    ],
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: Watch,
    desc: 'Servicio especializado para tu Apple Watch.',
    options: ['Reparación de pantalla', 'Cambio de batería', 'Otro tipo de fallas'],
  },
  {
    id: 'cargadores',
    name: 'Cargadores',
    icon: Plug,
    desc: 'No lo cambies, nosotros lo restauramos.',
    options: ['Reparación de cargador', 'Otro tipo de fallas'],
  },
]

function optionIcon(option: string): LucideIcon {
  const o = option.toLowerCase()
  if (o.includes('otro')) return HelpCircle
  if (o.includes('batería')) return BatteryCharging
  if (o.includes('face id')) return ScanFace
  if (o.includes('cámara')) return Camera
  if (o.includes('cristal')) return Layers
  if (o.includes('electrón')) return CircuitBoard
  if (o.includes('memoria')) return MemoryStick
  if (o.includes('auricular')) return Volume2
  if (o.includes('optimiz') || o.includes('flex')) return Sparkles
  if (o.includes('mantenimiento')) return Settings
  if (o.includes('teclado') || o.includes('touch bar')) return Keyboard
  if (o.includes('display') || o.includes('lcd') || o.includes('bisel')) return Monitor
  if (o.includes('pantalla')) return Smartphone
  if (o.includes('backcover')) return Cpu
  if (o.includes('cargador')) return Plug
  return Wrench
}

export default function Reparaciones() {
  const [selected, setSelected] = useState<Device>(DEVICES[0]!)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  const waLink = (option: string) =>
    `${WHATSAPP_LINK}?text=${encodeURIComponent(
      `Hola! Necesito reparación de mi ${selected.name}: ${option}`
    )}`

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
              Servicio técnico
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              ¿Qué deseas reparar?
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Selecciona tu dispositivo y elige el servicio. Técnicos especializados y repuestos de calidad, con garantía en Boyacá.
            </p>
          </div>
        </ScrollReveal>

        {/* Selector deslizable de dispositivos */}
        <div className="relative mb-10">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center text-gray-600 hover:text-purple-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
          >
            {DEVICES.map(device => {
              const Icon = device.icon
              const active = selected.id === device.id
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelected(device)}
                  className={`snap-start shrink-0 w-36 sm:w-44 rounded-2xl border p-5 text-center transition-all ${
                    active
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                      active ? 'bg-purple-700' : 'bg-purple-50'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${active ? 'text-white' : 'text-purple-700'}`} />
                  </div>
                  <p className={`font-bold ${active ? 'text-purple-700' : 'text-gray-900'}`}>
                    {device.name}
                  </p>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center text-gray-600 hover:text-purple-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones del dispositivo seleccionado */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">{selected.name}</h2>
          <p className="text-purple-100 text-sm sm:text-base">{selected.desc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selected.options.map(option => {
            const OptIcon = optionIcon(option)
            return (
              <a
                key={option}
                href={waLink(option)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <span className="flex items-center gap-3 text-gray-800 font-medium">
                  <span className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <OptIcon className="w-4 h-4 text-purple-700" />
                  </span>
                  {option}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-700 transition-colors" />
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
