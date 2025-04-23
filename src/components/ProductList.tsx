// src/components/ProductList.tsx
import React from 'react'
import ProductItem from './ProductItem'
import { Product } from '../types/ml'

interface ProductListProps {
  produtos: Product[]
}

export default function ProductList({ produtos }: ProductListProps) {
  if (!produtos.length) {
    return <p className="text-yellow-400">Nenhum produto corresponde aos filtros.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map(p => (
        <ProductItem key={p.id} produto={p} />
      ))}
    </div>
  )
}