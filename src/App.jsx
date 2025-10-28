import React from 'react'
import FilterableList from './components/FilterableList.jsx'
import PostList from './components/PostList.jsx'
import PaginatedList from './components/PaginatedList.jsx'

export default function App() {
  return (
    <div className="container">
      <h1>Dynamic Filterable List</h1>
      <p className="subtle">Core + Bonus requirements implemented.</p>

      <section className="card">
        <h2>Products</h2>
        <FilterableList />
      </section>

      <section className="card">
        <h2>PostList</h2>
        <PostList />
      </section>

      <section className="card">
        <h2>Paginated List</h2>
        <PaginatedList />
      </section>
    </div>
  )
}