import React, { useEffect, useState } from 'react'
import { HomeIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import rsWelcome from '../assets/RS-Welcome.png'

interface NotaFiscal {
  DataEmissao: string
  ValorTotal: number
}

interface FaturamentoMensal {
  mes: string
  total: number
}

export default function Faturamento() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [faturamentoMensal, setFaturamentoMensal] = useState<FaturamentoMensal[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:3100/inventonf/', {
          headers: {
            'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
          }
        })
        const json = await res.json()
        const notas: NotaFiscal[] = json.result || []

        // Agrupa e soma por mês
        const mapa = new Map<string, number>()

        for (const nf of notas) {
          if (!nf.DataEmissao || !nf.ValorTotal) continue
          const mes = new Date(nf.DataEmissao).toISOString().slice(0, 7) // YYYY-MM
          mapa.set(mes, (mapa.get(mes) || 0) + nf.ValorTotal)
        }

        const agrupado: FaturamentoMensal[] = Array.from(mapa.entries()).map(([mes, total]) => ({
          mes,
          total
        }))

        setFaturamentoMensal(agrupado.sort((a, b) => a.mes.localeCompare(b.mes)))
      } catch (error) {
        console.error('Erro ao buscar faturamento:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Cabeçalho padrão */}
      <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
        <button onClick={() => navigate('/')} className="absolute left-4 p-2 rounded hover:bg-gray-800">
          <HomeIcon className="h-8 w-8 text-white" />
        </button>
        <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
      </header>

      <main className="p-8 pt-12">
        <h1 className="text-2xl font-semibold mb-6 text-center">Faturamento por Mês</h1>

        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-opacity-50"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {faturamentoMensal.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center shadow"
              >
                <h2 className="text-lg font-bold mb-2 text-white">{item.mes}</h2>
                <p className="text-2xl text-green-400">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
