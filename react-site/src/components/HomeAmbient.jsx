import { useEffect, useRef } from 'react'

const preferenceQueries = [
  '(prefers-reduced-motion: reduce)',
  '(prefers-reduced-transparency: reduce)',
  '(prefers-contrast: more)',
]

export function HomeAmbient() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) return undefined

    const preferences = preferenceQueries.map((query) => window.matchMedia(query))
    const capableViewport = window.matchMedia('(min-width: 48rem)')
    const connection = navigator.connection
    let cancelMount = null
    let disposeScene = null
    let generation = 0
    let stopped = false

    const isBlocked = () => (
      preferences.some((preference) => preference.matches)
      || !capableViewport.matches
      || connection?.saveData === true
    )

    const cancelScheduledMount = () => {
      cancelMount?.()
      cancelMount = null
    }

    const stop = () => {
      generation += 1
      cancelScheduledMount()
      disposeScene?.()
      disposeScene = null
    }

    const mount = async () => {
      cancelMount = null
      const mountGeneration = generation

      try {
        const { mountAmbientScene } = await import('@/lib/mount-ambient-scene.js')

        if (stopped || mountGeneration !== generation || isBlocked()) return

        disposeScene = mountAmbientScene(host)
      } catch {
        // The CSS atmosphere remains the complete fallback when WebGL is unavailable.
      }
    }

    const scheduleMount = () => {
      if (stopped || isBlocked() || cancelMount || disposeScene) return

      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(mount, { timeout: 700 })
        cancelMount = () => window.cancelIdleCallback(idleId)
        return
      }

      const timeoutId = window.setTimeout(mount, 120)
      cancelMount = () => window.clearTimeout(timeoutId)
    }

    const syncPreference = () => {
      if (isBlocked()) {
        stop()
      } else {
        scheduleMount()
      }
    }

    preferences.forEach((preference) => {
      preference.addEventListener?.('change', syncPreference)
    })
    capableViewport.addEventListener?.('change', syncPreference)
    connection?.addEventListener?.('change', syncPreference)
    scheduleMount()

    return () => {
      stopped = true
      stop()
      preferences.forEach((preference) => {
        preference.removeEventListener?.('change', syncPreference)
      })
      capableViewport.removeEventListener?.('change', syncPreference)
      connection?.removeEventListener?.('change', syncPreference)
    }
  }, [])

  return <div aria-hidden="true" className="home-ambient" ref={hostRef} />
}
