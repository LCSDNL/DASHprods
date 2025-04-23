// src/components/ProductItem.tsx
import React, { useState, useEffect } from 'react'
import { Product } from '../types/ml'

interface ProductItemProps {
  produto: Product
}

export default function ProductItem({ produto }: ProductItemProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showModal])

  const {
    thumbnail,
    title,
    seller_custom_field,
    available_quantity,
    sold_quantity,
    price,
    id,
    attributes,
    condition,
    warranty,
    permalink,
    variations = []
  } = produto

  const brand = attributes?.find(a => a.id === 'BRAND')?.value_name || 'Indefinida'

  return (
    <>
      
      <div className="relative bg-gray-800 rounded-lg shadow-lg p-4 pl-28 pb-14 border border-transparent hover:border-red-500 transition transform hover:-translate-y-1">
    
        <img src={thumbnail} alt={title} className="absolute top-4 left-4 w-20 h-20 object-cover rounded border border-gray-700" />

        <div className="absolute top-[108px] left-4 w-20 bg-black bg-opacity-70 rounded text-center px-2 py-1 pointer-events-none">
          <span className="block text-white text-xs font-medium">ESTOQUE:</span>
          <span className="block text-red-500 text-lg font-bold">{available_quantity}</span>
          <span className="block text-[9px] text-gray-400">VENDIDOS: {sold_quantity}</span>
        </div>

        <div className="flex flex-col items-start">
          <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
          <p className="text-red-500 font-bold text-sm mb-1">R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-gray-400 text-xs mb-1">ID: {id}</p>
          <p className="text-gray-400 text-xs mb-1">SKU: {seller_custom_field || 'N/A'}</p>

          <p className="text-white text-xs mb-1 font-bold">Marca: {brand}</p>
          <p className="text-gray-400 text-xs mb-6">Garantia: {warranty?.trim() || 'Não informada'}</p>

          
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-row gap-2">
    {variations.length > 0 && (
      <button
        className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
        onClick={() => setShowModal(true)}
      >
        Ver variações de SKU
      </button>
    )}
    <a
      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 text-center"
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver no ML
    </a>
  </div>
</div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-gray-800 w-4/5 max-w-6xl max-h-[80vh] overflow-y-auto rounded p-6 relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h3 className="text-white text-lg font-semibold mb-4">Variações de SKU</h3>

            <ul className="flex flex-wrap gap-4">
              {variations.map((v: any, idx: number) => {
                const thumb = v.picture_url || thumbnail
                const priceVar = v.price
                const stockVar = v.available_quantity
                const attrs = v.attribute_combinations || []
                const seller_custom_field = v.seller_custom_field || []

                return (
                  <li key={idx} className="bg-gray-700 rounded p-4 flex flex-1 min-w-[45%]">
                    <img src={thumb} alt={`Var ${idx + 1}`} className="w-16 h-16 object-cover rounded mr-4" />
                    <div className="flex-1">
                    <div className="variation-main">
                      <p><strong>Preço:</strong> R$ {priceVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p><strong>Estoque:</strong> {stockVar}</p>
                      <p>
                        <strong>SKU:</strong>{' '}
                        {v.user_product_id || 'N/A'}
                      </p>

                    </div>
                      {attrs.length > 0 && (
                        <ul className="flex flex-wrap gap-2 text-sm text-gray-300">
                          {attrs.map((attr: any) => (
                            <li key={attr.id} className="bg-gray-600 px-2 py-1 rounded">
                              <strong>{attr.name}:</strong> {attr.value_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}