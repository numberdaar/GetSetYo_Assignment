import React, { useEffect, useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { debounce } from '../utils/debounce.js'

function useQueryState(defaults) {
  const [state, setState] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      search: params.get('search') ?? defaults.search,
      category: params.get('category') ?? defaults.category,
      min: Number(params.get('min') ?? defaults.min),
      max: Number(params.get('max') ?? defaults.max),
    }
  })

  // Persist to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    for (const [k, v] of Object.entries(state)) {
      if (v === '' || v == null) params.delete(k)
      else params.set(k, String(v))
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [state])

  return [state, setState]
}

export default function FilterableList() {
  const { data, error, loading, retry } = useFetch('/products.json')
  const [filters, setFilters] = useQueryState({ search: '', category: 'All', min: 0, max: 1000 })

  const products = Array.isArray(data) ? data : []
  const prices = useMemo(() => products.map(p => p.price), [products])
  const minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 1000

  // Ensure min/max slider bounds follow data
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      min: Math.max(minPrice, Math.min(prev.min, maxPrice)),
      max: Math.max(minPrice, Math.min(prev.max, maxPrice))
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice])

  const setSearchDebounced = useMemo(() => debounce((val) => {
    setFilters(prev => ({ ...prev, search: val }))
  }, 250), [setFilters])

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products])

  const filtered = useMemo(() => {
    const s = filters.search.trim().toLowerCase()
    return products.filter(p => {
      const byName = !s || p.name.toLowerCase().includes(s)
      const byCat = filters.category === 'All' || p.category === filters.category
      const byPrice = p.price >= filters.min && p.price <= filters.max
      return byName && byCat && byPrice
    })
  }, [products, filters])

  if (loading) return <div className="row"><span className="spinner"/> Loading products…</div>
  if (error) return <div className="error">Failed to load products. <button className="button" onClick={retry}>Retry</button></div>

  return (
    <div>
      <div className="controls">
        <div>
          <div className="label">Search by name</div>
          <input
            type="text"
            defaultValue={filters.search}
            placeholder="e.g. Monitor"
            onChange={(e) => setSearchDebounced(e.target.value)}
          />
        </div>

        <div>
          <div className="label">Category</div>
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="range">
          <div>
            <div className="label">Min ${filters.min}</div>
            <input
              type="range"
              min={minPrice}
              max={filters.max}
              value={filters.min}
              onChange={e => setFilters(prev => ({ ...prev, min: Number(e.target.value) }))}
            />
          </div>
          <div>
            <div className="label">Max ${filters.max}</div>
            <input
              type="range"
              min={filters.min}
              max={maxPrice}
              value={filters.max}
              onChange={e => setFilters(prev => ({ ...prev, max: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <div className="row" style={{justifyContent:'space-between'}}>
        {/* <div className="help">URL synced → shareable link retains filters.</div> */}
        <div className="badge">{filtered.length} / {products.length} shown</div>
      </div>

      <div className="grid">
        {filtered.map(p => (
          <div className="item" key={p.id}>
            <h4>{p.name}</h4>
            <div className="subtle">Category: {p.category}</div>
            <div className="badge" style={{marginTop:8}}>${p.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}