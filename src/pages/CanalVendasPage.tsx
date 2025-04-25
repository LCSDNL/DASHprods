import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/solid'
import rsWelcome from '../assets/RS-Welcome.png'
import { Product } from '../types/ml'

interface AnuncioInvento {
  CodigoAnuncio: string
  CodigoSKU: string
}

interface ProdutoML {
  id: string
}

export default function CanalVendas() {
  const navigate = useNavigate()

  const [inventoAnuncios, setInventoAnuncios] = useState<AnuncioInvento[]>([])
  const [mlProdutos, setMlProdutos] = useState<ProdutoML[]>([])

  const [loading, setLoading] = useState(true)

  const [matchBoth, setMatchBoth] = useState<AnuncioInvento[]>([])
  const [onlyInvento, setOnlyInvento] = useState<AnuncioInvento[]>([])
  const [onlyMercadoLivre, setOnlyMercadoLivre] = useState<ProdutoML[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Puxa anúncios do Invento
        const inventoRes = await fetch('http://localhost:3100/inventocanalvendas/30', {
          headers: {
            'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
          }
        })
        const inventoJson = await inventoRes.json()
        const anuncios = inventoJson.result || []
        setInventoAnuncios(anuncios)

        // Puxa anúncios do Mercado Livre (ativos, pausados e fechados)
        const endpoints = [
          'http://localhost:3100/mlbitem/active',
          'http://localhost:3100/mlbitem/paused',
          'http://localhost:3100/mlbitem/closed'
        ]

        const mlResults = await Promise.all(
          endpoints.map(url =>
            fetch(url, {
              headers: {
                'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
              }
            }).then(res => res.json())
          )
        )

        // Junta todos produtos de todas as listas
        const mlProdutosAll: ProdutoML[] = mlResults
          .flatMap(result => (result.result || []))
          .filter((item: any) => item.code === 200 && item.body)
          .map((item: any) => ({
            id: item.body.id
          }))

        setMlProdutos(mlProdutosAll)

       // Agora compara os IDs
const inventoIds = new Set(anuncios.map((a: AnuncioInvento) => a.CodigoAnuncio))
const mlIds = new Set(mlProdutosAll.map((p: ProdutoML) => p.id)) // usa ProdutoML agora

// 1) Existe nos dois
const matched = anuncios.filter((a: AnuncioInvento) => mlIds.has(a.CodigoAnuncio))
setMatchBoth(matched)

// 2) Só no Invento
const onlyInv = anuncios.filter((a: AnuncioInvento) => !mlIds.has(a.CodigoAnuncio))
setOnlyInvento(onlyInv)

// 3) Só no Mercado Livre
const onlyML = mlProdutosAll.filter((p: ProdutoML) => !inventoIds.has(p.id))
setOnlyMercadoLivre(onlyML)



      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header fixo */}
      <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
        <button
          onClick={() => navigate('/')}
          className="absolute left-4 p-2 rounded hover:bg-gray-800"
        >
          <HomeIcon className="h-8 w-8 text-white" />
        </button>
        <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
      </header>

      {/* Conteúdo principal */}
      <main className="p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-opacity-50"></div>
            <p className="text-lg">Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full">
            {/* 1 - Match dos dois */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-green-400">No Invento e Mercado Livre</h2>
              <p className="text-center text-2xl">{matchBoth.length}</p>
            </div>

            {/* 2 - Só no Invento */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-yellow-400">Só no Invento</h2>
              <p className="text-center text-2xl">{onlyInvento.length}</p>
            </div>

            {/* 3 - Só no Mercado Livre */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-red-400">Só no Mercado Livre</h2>
              <p className="text-center text-2xl">{onlyMercadoLivre.length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
