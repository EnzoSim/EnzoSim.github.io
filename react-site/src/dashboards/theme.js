// Colours and the section tracker shared by the dashboard boards.
import { useEffect, useState } from 'react'

export const C = {
  ink: '#192126', muted: '#475462', line: '#dce3eb', blue: '#2457e6', blueLight: '#9cb4f6', wash: '#e9f0ff',
  reference: '#8d99a6', slate: '#657589', button: '#eff3f8', rail: '#dde4ed', greyLight: '#cbd3dd', greyMid: '#b7c1cd',
  axis: '#aab6c5', range: '#afc3f7',
}

// The view link that is on screen is marked current.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const seen = new Map()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
      const first = ids.find((id) => seen.get(id))
      if (first) setActive(first)
    }, { rootMargin: '-96px 0px -55% 0px' })
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [ids])
  return active
}
