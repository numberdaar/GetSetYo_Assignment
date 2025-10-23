// A tiny mock API that returns paginated data with a delay and occasional errors.

const ITEMS = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  title: `Mock Item #${i + 1}`,
}))

export function fetchPage({ page, pageSize = 8 }) {
  return new Promise((resolve, reject) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const slice = ITEMS.slice(start, end)

    // Simulate latency 500–900ms
    const delay = 500 + Math.floor(Math.random() * 400)

    // Simulate a 15% failure rate
    const shouldFail = Math.random() < 0.15

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network hiccup, please retry.'))
      } else {
        resolve({
          items: slice,
          hasMore: end < ITEMS.length,
          nextPage: end < ITEMS.length ? page + 1 : null,
        })
      }
    }, delay)
  })
}