// src/components/Sidebar.tsx
import React, { ChangeEvent } from 'react'
import { Product } from '../types/ml'

interface SidebarProps {
  filters: {
    brand: string
    priceMin: string
    priceMax: string
    stock: string
    sold: string
    freeShipping: string
    warranty: string
    variationFilter: string
  }
  setFilters: React.Dispatch<React.SetStateAction<SidebarProps['filters']>>
  allProdutos: Product[]
}

export default function Sidebar({ filters, setFilters, allProdutos }: SidebarProps) {
  const brands     = Array.from(new Set(allProdutos.map(p => p.attributes?.find(a => a.id === 'BRAND')?.value_name || 'Indefinida')))
  const conditions = Array.from(new Set(allProdutos.map(p => p.condition || 'Desconhecida')))
  const warranties = Array.from(new Set(allProdutos.map(p => p.warranty?.trim() || 'Não informada')))
  const prices     = allProdutos.map(p => p.price)
  const minPrice   = prices.length ? Math.min(...prices).toFixed(2) : '0.00'
  const maxPrice   = prices.length ? Math.max(...prices).toFixed(2) : '0.00'

  function handleChange(e: ChangeEvent<HTMLSelectElement|HTMLInputElement>) {
    const { name, value } = e.target
    setFilters(f => ({ ...f, [name]: value }))
  }

  return (
    <div className="h-full bg-gray-800 text-red-400 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Filtros</h2>

      <label className="text-sm font-medium">Marca:</label>
      <select
        name="brand"
        value={filters.brand}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todos</option>
        {brands.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <label className="text-sm font-medium">Preço (R$):</label>
      <div className="flex space-x-2">
        <input
          type="number"
          name="priceMin"
          placeholder={`mín ${minPrice}`}
          value={filters.priceMin}
          onChange={handleChange}
          disabled={!allProdutos.length}
          className="w-1/2 p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
        />
        <input
          type="number"
          name="priceMax"
          placeholder={`máx ${maxPrice}`}
          value={filters.priceMax}
          onChange={handleChange}
          disabled={!allProdutos.length}
          className="w-1/2 p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
        />
      </div>

      <label className="text-sm font-medium">Estoque:</label>
      <select
        name="stock"
        value={filters.stock}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todos</option>
        <option value="zero">0 unidades</option>
        <option value="low">1-5 unidades</option>
        <option value="high">Mais que 5</option>
      </select>

      <label className="text-sm font-medium">Vendas:</label>
      <select
        name="sold"
        value={filters.sold}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todas</option>
        <option value="low">Poucas (&lt;10)</option>
        <option value="medium">Médias (10-100)</option>
        <option value="high">Muitas (101+)</option>
      </select>

      <label className="text-sm font-medium">Frete grátis:</label>
      <select
        name="freeShipping"
        value={filters.freeShipping}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todas</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>

      <label className="text-sm font-medium">Garantia:</label>
      <select
        name="warranty"
        value={filters.warranty}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todas</option>
        {warranties.map(w => <option key={w} value={w}>{w}</option>)}
      </select>

      <label className="text-sm font-medium">Variações:</label>
      <select
        name="variationFilter"
        value={filters.variationFilter}
        onChange={handleChange}
        disabled={!allProdutos.length}
        className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
      >
        <option value="">Todas</option>
        <option value="with">Com variações</option>
        <option value="without">Sem variações</option>
      </select>
    </div>
  )
}
