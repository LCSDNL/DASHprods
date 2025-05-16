import React, { useState, useMemo } from 'react'
import { HomeIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import rsWelcome from '../assets/RS-Welcome.png'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartOptions
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartDataLabels
)

interface NFItem {
  TipoProduto: number
  NotaFiscalID: number
  Chave: string
  Descricao: string
  DataCancelamento: string | null
  DataEmissao: string
  CodigoProduto: string
  DescricaoProduto: string
  Quantidade: number
  ValorUnit: number
  ValorTotal: number
}

export default function FaturamentoItem() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<NFItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDateEmissao: '',
    endDateEmissao: '',
    CodigoProduto: '',
    Descricao: '',
    Chave: '',
    DescricaoProduto: '',
    hasCancelamento: 'false'
  })

  const [sortField, setSortField] = useState<keyof NFItem | ''>('')
  const [sortAsc, setSortAsc] = useState(true)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const res = await fetch(`http://localhost:3100/inventonf/item/?${params.toString()}`, {
        headers: {
          'x-api-key':
            '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
        }
      })
      const json = await res.json()
      setDados(json.result || [])
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  function sortBy(field: keyof NFItem) {
    const asc = sortField === field ? !sortAsc : true
    setSortField(field)
    setSortAsc(asc)
    setDados(prev =>
      [...prev].sort((a, b) => {
        const valA = a[field]
        const valB = b[field]
        if (typeof valA === 'number' && typeof valB === 'number') {
          return asc ? valA - valB : valB - valA
        }
        return asc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
    )
  }

  function exportToCSV() {
    if (!dados.length) return
    const headers = Object.keys(dados[0])
    const rows = dados.map(item =>
      headers.map(h => `"${String(item[h as keyof NFItem] ?? '')}"`).join(',')
    )
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `faturamento_itens_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 1) agrega ValorTotal por produto
  const aggregated = useMemo(() => {
    const map = new Map<string, number>()
    dados.forEach(item => {
      const key = `${item.CodigoProduto} – ${item.DescricaoProduto}`
      map.set(key, (map.get(key) || 0) + item.ValorTotal)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [dados])

  const top8 = aggregated.slice(0, 8)
  const totalSum = aggregated.reduce((sum, x) => sum + x.value, 0)

  // 2) prepara data & options do Chart.js
  const data = {
    labels: top8.map(x => x.name),
    datasets: [
      {
        label: 'Valor Total',
        data: top8.map(x => x.value),
        backgroundColor: '#4ade80'
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'left',
        labels: {
          boxWidth: 10,
          color: '#bbb',
          font: { size: 10 }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.x as number
            return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: (value: number) =>
          `${Math.round((value / totalSum) * 100)}%`,
        color: '#ffffff',
        font: { size: 10 }
      }
    },
    scales: {
      x: {
        ticks: { color: '#bbb' },
        grid: { color: '#555' }
      },
      y: {
        // Limita a largura do eixo Y a 20% do canvas
        afterFit: (scale) => {
          const chartWidth = (scale.chart as any).width
          scale.width = chartWidth * 0.2
        },
        ticks: {
          color: '#ffffff80',
          font: { size: 10 }
        },
        grid: { display: false }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
        <button onClick={() => navigate('/')} className="absolute left-4 p-2 rounded hover:bg-gray-800">
          <HomeIcon className="h-8 w-8 text-white" />
        </button>
        <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
      </header>

      {/* FILTROS */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 w-full">
      <form onSubmit={(e) => { e.preventDefault(); fetchData() }} className="flex flex-wrap gap-6 justify-center text-sm">
          <fieldset className="border p-3 rounded border-gray-600 flex flex-row flex-wrap gap-4 items-end">
            <legend className="text-sm text-gray-300 px-2 w-full">Nota Fiscal</legend>
            <label className="flex flex-col text-white min-w-[150px]">Data Inicial
              <input name="startDateEmissao" type="date" value={filters.startDateEmissao} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
            <label className="flex flex-col text-white min-w-[150px]">Data Final
              <input name="endDateEmissao" type="date" value={filters.endDateEmissao} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
            <label className="flex flex-col text-white min-w-[200px]">Descrição
              <input name="Descricao" type="text" value={filters.Descricao} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
            <label className="flex flex-col text-white min-w-[280px]">Chave
              <input name="Chave" type="text" value={filters.Chave} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
            <label className="flex flex-col text-white min-w-[160px]">Cancelada?
              <select name="hasCancelamento" value={filters.hasCancelamento} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded">
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="border p-3 rounded border-gray-600 flex flex-row flex-wrap gap-4 items-end">
            <legend className="text-sm text-gray-300 px-2 w-full">Produto</legend>
            <label className="flex flex-col text-white min-w-[200px]">Código Produto
              <input name="CodigoProduto" type="text" value={filters.CodigoProduto} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
            <label className="flex flex-col text-white min-w-[280px]">Descrição Produto
              <input name="DescricaoProduto" type="text" value={filters.DescricaoProduto} onChange={handleChange} className="bg-gray-700 px-2 py-1 rounded" />
            </label>
          </fieldset>

          <div className="flex items-end gap-2">
            <button type="submit" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 text-white">Filtrar</button>
            <button type="button" onClick={exportToCSV} className="bg-green-600 px-4 py-1 rounded hover:bg-green-700 text-white">Exportar CSV</button>
          </div>
        </form>
      </div>

      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Itens de Notas Fiscais
        </h1>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin h-10 w-10 border-t-4 border-red-500 rounded-full" />
          </div>
        ) : (
          <>

            {/* ← TOTAL GERAL → */}
      <div className="flex justify-end mb-2 text-sm text-gray-400">
        Total Geral: R${' '}
        {totalSum.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>



             {/* → GRÁFICO DE BARRAS HORIZONTAIS ← */}
             <div className="bg-gray-800 p-4 rounded-lg mb-8" style={{ height: 500 }}>
              <Bar data={data} options={options} />
              <div className="flex justify-end mt-2">
                <button
                  className="text-sm text-gray-400 hover:underline"
                  onClick={() => {
                    /* ação de “Ver mais” */
                  }}
                >
                  Ver mais
                </button>
              </div>
            </div>

            {/* → TABELA EXISTENTE ← */}
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full text-sm text-left border border-gray-700">
                <thead className="bg-gray-800 text-gray-300 sticky top-0 z-10">
                  <tr>
                    {[
                      { label: 'Data', key: 'DataEmissao' },
                      { label: 'Chave', key: 'Chave' },
                      { label: 'Descrição', key: 'Descricao' },
                      { label: 'Cancelada', key: 'DataCancelamento' },
                      { label: 'Código Produto', key: 'CodigoProduto' },
                      { label: 'Descrição Produto', key: 'DescricaoProduto' },
                      { label: 'Quantidade', key: 'Quantidade' },
                      { label: 'Valor Unit.', key: 'ValorUnit' },
                      { label: 'Valor Total', key: 'ValorTotal' }
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => sortBy(col.key as keyof NFItem)}
                        className="px-4 py-2 cursor-pointer hover:underline whitespace-nowrap"
                      >
                        {col.label} {sortField === col.key && (sortAsc ? '↑' : '↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-700">
                      <td className="px-4 py-2">{new Date(item.DataEmissao).toLocaleString()}</td>
                      <td className="px-4 py-2 break-all">{item.Chave}</td>
                      <td className="px-4 py-2">{item.Descricao}</td>
                      <td className="px-4 py-2">{item.DataCancelamento ? 'Sim' : 'Não'}</td>
                      <td className="px-4 py-2">{item.CodigoProduto}</td>
                      <td className="px-4 py-2">{item.DescricaoProduto}</td>
                      <td className="px-4 py-2">{item.Quantidade}</td>
                      <td className="px-4 py-2">R$ {item.ValorUnit.toFixed(2)}</td>
                      <td className="px-4 py-2">R$ {item.ValorTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
