import { useEffect, useRef, useState } from 'react'
const cache = new Map()

/**
 * useFetch(url)
 *  - Fetches when url changes
 *  - Returns { data, error, loading, retry }
 *  - Caches successful url -> data so repeated urls return immediately
 *  - Supports simple retry() which re-runs the request ignoring cache
 */
export function useFetch(url) {
  const [data, setData] = useState(() => cache.get(url))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!cache.has(url))
  const currentUrl = useRef(url)
  const ignoreCache = useRef(false)

  const fetchNow = async (signal) => {
    if (!url) return

    // If we have it cached and not forcing, return immediately
    if (!ignoreCache.current && cache.has(url)) {
      setData(cache.get(url))
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      cache.set(url, json)
      setData(json)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err)
    } finally {
      setLoading(false)
      ignoreCache.current = false
    }
  }

  useEffect(() => {
    currentUrl.current = url
    const controller = new AbortController()
    fetchNow(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const retry = () => {
    ignoreCache.current = true
    // trigger effect by updating state with a micro change
    // (use the same url; we can just call fetchNow directly)
    const controller = new AbortController()
    fetchNow(controller.signal)
  }

  return { data, error, loading, retry }
}