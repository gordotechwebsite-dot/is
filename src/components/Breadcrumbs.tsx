import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export type Crumb = { label: string; to?: string }

export default function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Ruta de navegación" className={`text-sm text-gray-500 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1 min-w-0">
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-purple-700 transition-colors">{c.label}</Link>
            ) : (
              <span className="text-gray-900 font-medium truncate" aria-current="page">{c.label}</span>
            )}
            {i < items.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
