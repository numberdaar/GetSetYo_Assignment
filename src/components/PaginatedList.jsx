import React, { useEffect, useState } from 'react'
import { fetchPage } from '../mock/mockApi.js'

export default function PaginatedList() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async (nextPage = page) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPage({ page: nextPage, pageSize: 8 })
      setItems(prev => [...prev, ...res.items])
      setHasMore(res.hasMore)
      if (res.nextPage) setPage(res.nextPage)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  return (
    <div>
      <div className="grid">
        {items.map(it => (
          <div className="item" key={it.id}>
            <h4>{it.title}</h4>
            <div className="subtle">ID: {it.id}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="row" style={{marginTop: 12}}>
          <div className="error" style={{flex:1}}>{error.message}</div>
          <button className="button" onClick={() => load(page)}>Retry</button>
        </div>
      )}

      <div className="row" style={{marginTop: 12}}>
        <button className="button" disabled={!hasMore || loading} onClick={() => load(page)}>
          {loading ? <span className="spinner"/> : 'Load More'}
        </button>
        {!hasMore && <span className="subtle">No more items.</span>}
      </div>
    </div>
  )
}