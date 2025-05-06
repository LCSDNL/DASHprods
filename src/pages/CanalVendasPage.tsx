import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/solid'
import rsWelcome from '../assets/RS-Welcome.png'

interface AnuncioInvento {
  CodigoAnuncio: string
  CodigoSKU: string
}

interface ProdutoML {
  id: string
  status: 'active' | 'paused' | 'closed'
}

export default function CanalVendas() {
  const navigate = useNavigate()

  const [inventoAnuncios, setInventoAnuncios] = useState<AnuncioInvento[]>([])
  const [mlProdutosAll, setMlProdutosAll] = useState<ProdutoML[]>([])

  const [loading, setLoading] = useState(false)

  const [onlyInvento, setOnlyInvento] = useState<AnuncioInvento[]>([])
  const [onlyMercadoLivre, setOnlyMercadoLivre] = useState<ProdutoML[]>([])
  const [matchBoth, setMatchBoth] = useState<string[]>([])

  const [skuKit, setSkuKit] = useState<string[]>([])
  const [skuMatch, setSkuMatch] = useState<string[]>([])
  const [skuOnlyKit, setSkuOnlyKit] = useState<string[]>([])

  const [selectedStatus, setSelectedStatus] = useState<'active' | 'paused' | 'closed'>('active')

  const totalInvento = new Set(inventoAnuncios.map(a => a.CodigoAnuncio)).size
  const totalActive = mlProdutosAll.filter(p => p.status === 'active').length
  const totalPaused = mlProdutosAll.filter(p => p.status === 'paused').length
  const totalClosed = mlProdutosAll.filter(p => p.status === 'closed').length

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const headers = {
          'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
        }

        const [inventoRes, skusKitRes] = await Promise.all([
          fetch('http://localhost:3100/inventocanalvendas/30', { headers }),
          fetch('http://localhost:3100/skuskit', { headers })
        ])

        const inventoData = await inventoRes.json()
        const invento = inventoData.result || []
        setInventoAnuncios(invento)

        const skusKitData = await skusKitRes.json()
        const skusKitList: string[] = (skusKitData.result || []).map((s: any) => s.Codigo)
        setSkuKit(skusKitList)

        const matchedSkus = skusKitList.filter(sku =>
          invento.some((inv: { CodigoSKU: string }) => inv.CodigoSKU === sku)
        )
        const onlyInKit = skusKitList.filter(sku =>
          !invento.some((inv: { CodigoSKU: string }) => inv.CodigoSKU === sku)
        )
        setSkuMatch(matchedSkus)
        setSkuOnlyKit(onlyInKit)

        const statuses: ('active' | 'paused' | 'closed')[] = ['active', 'paused', 'closed']
        const mlResults = await Promise.all(
          statuses.map(status =>
            fetch(`http://localhost:3100/mlbitem/${status}`, { headers })
              .then(res => res.json().then(json => ({ status, result: json.result || [] })))
          )
        )

        const mlProdutos: ProdutoML[] = mlResults.flatMap(({ status, result }) =>
          result.filter((r: any) => r.code === 200 && r.body)
            .map((r: any) => ({
              id: r.body.id,
              status
            }))
        )

        const uniqueMlProdutos = Array.from(new Map(mlProdutos.map(p => [p.id, p])).values())
        setMlProdutosAll(uniqueMlProdutos)

        const inventoIds = new Set<string>(invento.map((a: { CodigoAnuncio: string }) => a.CodigoAnuncio))
        const mlIds = new Set<string>(uniqueMlProdutos.map(p => p.id))

        const matched = [...inventoIds].filter(id => mlIds.has(id))
        const onlyInv = invento.filter((a: { CodigoAnuncio: string }) => !mlIds.has(a.CodigoAnuncio))
        const onlyML = uniqueMlProdutos.filter(p => !inventoIds.has(p.id))

        setMatchBoth(matched)
        setOnlyInvento(onlyInv)
        setOnlyMercadoLivre(onlyML)
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredOnlyML = onlyMercadoLivre.filter(p => p.status === selectedStatus)
  const filteredMatch = matchBoth.filter(id =>
    mlProdutosAll.some(p => p.status === selectedStatus && p.id === id)
  )
  const filteredOnlyInv = onlyInvento

  const exportCSV = (rows: string[], filename: string, headers: string[] = []) => {
    const content = [
      headers.join(','),
      ...rows.map(row => `"${row}"`)
    ].filter(line => line.trim()).join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
        <button onClick={() => navigate('/')} className="absolute left-4 p-2 rounded hover:bg-gray-800">
          <HomeIcon className="h-8 w-8 text-white" />
        </button>
        <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
      </header>

      <div className="flex flex-col-2 items-center justify-center mt-8 ">
        <select
          className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 mb-4"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'paused' | 'closed')}
        >
          <option value="active">Produtos Ativos</option>
          <option value="paused">Produtos Pausados</option>
          <option value="closed">Produtos Finalizados</option>
        </select>

        <div className="text-sm text-gray-300 space-y-1 text-center mb-6">
          <span className='p-5'>Total do Invento: <strong>{totalInvento}</strong></span>
          <span className='p-5'>Mercado Livre - Ativos: <strong>{totalActive}</strong></span>
          <span className='p-5'>Mercado Livre - Pausados: <strong>{totalPaused}</strong></span>
          <span className='p-5'>Mercado Livre - Finalizados: <strong>{totalClosed}</strong></span>
        </div>
      </div>

      <main className="p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-opacity-50"></div>
            <p className="text-lg">Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full">
            {/* Ambos */}
            <Card
              title="No Invento e ML"
              color="green"
              data={filteredMatch}
              onExport={() => exportCSV(filteredMatch, 'match_both')}
            />

            {/* Só no Invento */}
            <Card
              title="Somente no Invento"
              color="yellow"
              data={filteredOnlyInv.map(a => `${a.CodigoAnuncio},${a.CodigoSKU}`)}
              onExport={() => exportCSV(filteredOnlyInv.map(a => `${a.CodigoAnuncio},${a.CodigoSKU}`), 'only_invento', ['MLB', 'SKU'])}
            />

            {/* Só no ML */}
            <Card
              title="Somente no ML"
              color="red"
              data={filteredOnlyML.map(a => a.id)}
              onExport={() => exportCSV(filteredOnlyML.map(a => a.id), 'only_ml')}
            />

            {/* SKU x Kit */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 flex flex-col md:col-span-3">
              <h2 className="text-lg font-bold mb-4 text-blue-400 text-center">Comparação Lista SKU x Lista Canal de Vendas</h2>
              <div className="flex flex-col md:flex-row gap-8 justify-around">
                <Card
                  title="Contém ambos"
                  color="green"
                  data={skuMatch}
                  onExport={() => exportCSV(skuMatch, 'sku_match')}
                />
                <Card
                  title="Somente Lista SKU"
                  color="yellow"
                  data={skuOnlyKit}
                  onExport={() => exportCSV(skuOnlyKit, 'sku_only')}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const Card = ({
  title,
  color,
  data,
  onExport
}: {
  title: string
  color: string
  data: string[]
  onExport: () => void
}) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
    <h2 className={`text-${color}-400 font-bold text-lg text-center mb-4`}>{title}</h2>
    <p className="text-center text-2xl mb-2">{data.length}</p>
    <button
      onClick={onExport}
      className="mb-3 mx-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm"
    >
      Exportar CSV
    </button>
    <div className="overflow-y-auto h-64 bg-gray-700 rounded p-2 text-sm break-all">
      {data.map((item, idx) => (
        <div key={idx}>{item}</div>
      ))}
    </div>
  </div>
)
