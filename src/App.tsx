import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ProductList from './components/ProductList'
import { Product } from './types/ml'


export default function App() {
  const [allProdutos, setAllProdutos] = useState<Product[]>([])
  const [filteredProdutos, setFilteredProdutos] = useState<Product[]>([])
  const [filters, setFilters] = useState({
    brand: '',
    priceMin: '',
    priceMax: '',
    stock: '',
    sold: '',
    freeShipping: '',
    warranty: '',
    variationFilter: ''
  })
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 20
  const [infiniteScroll, setInfiniteScroll] = useState(false)
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await fetch('http://localhost:3100/mlbitem/active', {
          headers: {
            'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
          }
        })
        if (!res.ok) throw new Error('Erro ao carregar')
        const data = await res.json()
        const bodies = (data.result || [])
          .filter((x: any) => x.code === 200 && x.body)
          .map((x: any) => x.body as Product)
        setAllProdutos(bodies)
        setFilteredProdutos(bodies)
      } catch (err) {
        console.error('Erro ao carregar produtos.', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProdutos()
  }, [])

  useEffect(() => {
    const result = allProdutos.filter(p => {
      if (filters.brand && (p.attributes?.find(a => a.id === 'BRAND')?.value_name || '') !== filters.brand) return false
      if (filters.priceMin && p.price < parseFloat(filters.priceMin)) return false
      if (filters.priceMax && p.price > parseFloat(filters.priceMax)) return false

      const aq = p.available_quantity
      const sq = p.sold_quantity
      if (filters.stock === 'zero' && aq !== 0) return false
      if (filters.stock === 'low' && (aq < 1 || aq > 5)) return false
      if (filters.stock === 'high' && aq <= 5) return false
      if (filters.sold === 'low' && sq >= 10) return false
      if (filters.sold === 'medium' && (sq < 10 || sq > 100)) return false
      if (filters.sold === 'high' && sq <= 100) return false
      if (filters.freeShipping === 'true' && !p.shipping?.free_shipping) return false
      if (filters.freeShipping === 'false' && p.shipping?.free_shipping) return false
      if (filters.warranty && (p.warranty?.trim() || '') !== filters.warranty) return false

      const hasVar = Array.isArray(p.variations) && p.variations.length > 0
      if (filters.variationFilter === 'with' && !hasVar) return false
      if (filters.variationFilter === 'without' && hasVar) return false

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase()
        const inTitle = p.title.toLowerCase().includes(term)
        const inId = p.id.toLowerCase().includes(term)
        const inSku = p.variations?.some((v: any) =>
          String(v.id || '').toLowerCase().includes(term)
        )
        if (!(inTitle || inId || inSku)) return false
      }
      

      
      return true
    })

    setFilteredProdutos(result)
    setCurrentPage(0)
  }, [filters, allProdutos, searchTerm])

  useEffect(() => {
    if (!infiniteScroll) return
    function onScroll() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.9) {
        setCurrentPage(cp => cp + 1)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [infiniteScroll])

  const visibleProdutos = filteredProdutos.slice(0, (currentPage + 1) * pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-opacity-50"></div>
        <p className="text-lg tracking-wide">RECEBENDO PRODUTOS...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-900 text-white">
      <Sidebar filters={filters} setFilters={setFilters} allProdutos={allProdutos} />
      <main className="p-6 bg-gray-900">
      <input
  type="text"
  placeholder="Buscar por título, ID ou SKU..."
  value={searchInput}
  onChange={e => setSearchInput(e.target.value)}
  onKeyDown={e => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput)
    }
  }}
  className="w-full mb-6 p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-red-500"
/>

        <ProductList produtos={visibleProdutos} />
        {!infiniteScroll && filteredProdutos.length > visibleProdutos.length && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded block mx-auto mt-12"
            onClick={() => setInfiniteScroll(true)}
          >
            Carregar Mais
          </button>
        )}
      </main>
    </div>
  )
}
