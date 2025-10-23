import React, { useMemo } from 'react'
import { useFetch } from '../hooks/useFetch.js'


export default function PostList() {
  const { data, error, loading, retry } = useFetch('https://httpbin.org/delay/2?query=abcd')

  const posts = useMemo(() => {
    const q = data?.args?.query ?? 'unknown'
    return Array.from({ length: 5 }, (_, i) => ({ id: i + 1, title: `Post about ${q} #${i + 1}` }))
  }, [data])

  if (loading) return <div className="row"><span className="spinner"/> Loading posts…</div>
  if (error) return <div className="error">Failed to load posts. <button className="button" onClick={retry}>Retry</button></div>

  return (
    <ul>
      {posts.map(p => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}