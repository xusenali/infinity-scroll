import { useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

const fetchProducts = async ({ pageParam = 0 }) => {
  const limit = 10
  const res = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${pageParam}`)
  return res.json()
}

function App() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage, allPages) => {
      const limit = 10
      const nextSkip = allPages.length * limit
      return nextSkip >= lastPage.total ? undefined : nextSkip
    },
  })

  const observerRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const allProducts = data?.pages.flatMap(p => p.products) || []

  return (
    <div>
      <h1 className='text-2xl mb-4'>Mahsulotlar</h1>

      <div className='w-full h-max flex gap-5 flex-wrap'>
        {allProducts.map(product => (
          <div className='w-70 h-50 border flex flex-col justify-center items-center' key={product.id}>
            <img className='w-full h-30' src={product.thumbnail} alt="" />
            <h1>{product.title}</h1>
          </div>
        ))}
      </div>

      {/* Bu div pastga tushilganda yangi sahifa yuklanadi */}
      <div ref={observerRef} className='h-10 flex justify-center items-center'>
        {isFetchingNextPage && <p>Yuklanmoqda...</p>}
      </div>
    </div>
  )
}

export default App
