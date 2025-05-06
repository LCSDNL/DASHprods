import React, { useEffect, useState } from 'react'
import { HomeIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import rsWelcome from '../assets/RS-Welcome.png'
import { format } from 'date-fns'

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

  // Estados dos filtros
const [filters, setFilters] = useState({
    dataEmissao: format(new Date(), 'yyyy-MM-dd'),
    serie: '',
    tipo: '',
    descricao: '',
    uf: '',
    hasMotivo: '',
    hasCancelamento: ''
  })

  // Atualiza os filtros
function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Requisição com filtros aplicados
async function fetchDataComFiltro() {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('dataEmissao', filters.dataEmissao)
      if (filters.serie) queryParams.append('serie', filters.serie)
      if (filters.tipo) queryParams.append('tipo', filters.tipo)
      if (filters.descricao) queryParams.append('descricao', filters.descricao)
      if (filters.uf) queryParams.append('uf', filters.uf)
      if (filters.hasMotivo !== '') queryParams.append('hasMotivo', filters.hasMotivo)
      if (filters.hasCancelamento !== '') queryParams.append('hasCancelamento', filters.hasCancelamento)
  
      const res = await fetch(`http://localhost:3100/inventonf?${queryParams.toString()}`, {
        headers: {
          'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
        }
      })
      const json = await res.json()
      const notas: NotaFiscal[] = json.result || []
  
      const mapa = new Map<string, number>()
      for (const nf of notas) {
        if (!nf.DataEmissao || !nf.ValorTotal) continue
        const mes = new Date(nf.DataEmissao).toISOString().slice(0, 7)
        mapa.set(mes, (mapa.get(mes) || 0) + nf.ValorTotal)
      }
  
      const agrupado: FaturamentoMensal[] = Array.from(mapa.entries()).map(([mes, total]) => ({
        mes,
        total
      }))
  
      setFaturamentoMensal(agrupado.sort((a, b) => a.mes.localeCompare(b.mes)))
    } catch (error) {
      console.error('Erro ao buscar faturamento com filtros:', error)
    } finally {
      setLoading(false)
    }
  }

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

        <div className="p-4 bg-gray-800 border-b border-gray-700 w-full">
        <form onSubmit={(e) => { e.preventDefault(); fetchDataComFiltro() }} className="flex flex-wrap gap-4 justify-center text-sm">
        <input type="date" name="dataEmissao" value={filters.dataEmissao} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white" />
        <input type="number" name="serie" placeholder="Série" value={filters.serie} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white" />
        <input type="number" name="tipo" placeholder="Tipo" value={filters.tipo} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white" />
        <input type="text" name="descricao" placeholder="Descrição" value={filters.descricao} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white" />
        <input type="text" name="uf" placeholder="UF" maxLength={2} value={filters.uf} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white" />
        
        <select name="hasMotivo" value={filters.hasMotivo} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white">
        <option value="">Motivo devolução?</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
        </select>

        <select name="hasCancelamento" value={filters.hasCancelamento} onChange={handleFilterChange} className="bg-gray-700 px-3 py-1 rounded text-white">
        <option value="">Cancelada?</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
        </select>

        <button type="submit" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 text-white">
        Filtrar
        </button>
    </form>
    </div>




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
