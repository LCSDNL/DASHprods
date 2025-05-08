import React, { useEffect, useState } from 'react'
import { HomeIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import rsWelcome from '../assets/RS-Welcome.png'
import { format } from 'date-fns'

interface NotaFiscal {
  ValorMerc: number
  ValorICMS: number
  ValorPIS: number
  ValorCOFINS: number
  ValorISS: number
  DataEmissao: string
  Serie?: number
  Tipo?: number
  Descricao?: string
  UF?: string
  MotivoDevolucaoID?: number | null
  DataCancelamento?: string | null
}

export default function Faturamento() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [totalImpostos, setTotalImpostos] = useState({
    ICMS: 0,
    PIS: 0,
    COFINS: 0,
    ISS: 0
  })

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serie: '',
    tipo: '',
    descricao: '',
    uf: '',
    hasMotivo: '',
    hasCancelamento: 'false'
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function fetchData() {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (filters.startDate) query.append('startDate', filters.startDate)
      if (filters.endDate) query.append('endDate', filters.endDate)
      if (filters.serie) query.append('serie', filters.serie)
      if (filters.tipo) query.append('tipo', filters.tipo)
      if (filters.descricao) query.append('descricao', filters.descricao)
      if (filters.uf) query.append('uf', filters.uf)
      if (filters.hasMotivo) query.append('hasMotivo', filters.hasMotivo)
      if (filters.hasCancelamento) query.append('hasCancelamento', filters.hasCancelamento)

      const res = await fetch(`http://localhost:3100/inventonf?${query.toString()}`, {
        headers: {
          'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
        }
      })
      const json = await res.json()
      const data: NotaFiscal[] = json.result || []
      setNotas(data)

      setTotalProdutos(data.reduce((acc, nf) => acc + (nf.ValorMerc || 0), 0))
      setTotalImpostos({
        ICMS: data.reduce((acc, nf) => acc + (nf.ValorICMS || 0), 0),
        PIS: data.reduce((acc, nf) => acc + (nf.ValorPIS || 0), 0),
        COFINS: data.reduce((acc, nf) => acc + (nf.ValorCOFINS || 0), 0),
        ISS: data.reduce((acc, nf) => acc + (nf.ValorISS || 0), 0)
      })
    } catch (err) {
      console.error('Erro ao buscar notas:', err)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    if (!notas.length) return

    const headers = Object.keys(notas[0])
    const rows = notas.map(nf =>
      headers.map(h => {
        const value = nf[h as keyof NotaFiscal];
        if (h === 'DataEmissao' && typeof value === 'string') {
          const date = new Date(value);
          return `"${date.toLocaleString()}"`;
        }
        return `"${String(value ?? '')}"`;
      }).join(',')
    )
    

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `faturamento_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
        <button onClick={() => navigate('/')} className="absolute left-4 p-2 rounded hover:bg-gray-800">
          <HomeIcon className="h-8 w-8 text-white" />
        </button>
        <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
      </header>

      <div className="p-4 bg-gray-800 border-b border-gray-700 w-full">
      <form
  onSubmit={(e) => {
    e.preventDefault()
    fetchData()
  }}
  className="flex flex-wrap gap-4 justify-center text-sm"
>
  <label className="flex flex-col text-white">
    Data Inicial
    <input name="startDate" type="date" value={filters.startDate} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    Data Final
    <input name="endDate" type="date" value={filters.endDate} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    Série
    <input name="serie" type="number" placeholder="Série" value={filters.serie} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    Tipo
    <input name="tipo" type="number" placeholder="Tipo" value={filters.tipo} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    Descrição
    <input name="descricao" type="text" placeholder="Descrição" value={filters.descricao} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    UF
    <input name="uf" type="text" placeholder="UF" value={filters.uf} maxLength={2} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white" />
  </label>

  <label className="flex flex-col text-white">
    Motivo Devolução?
    <select name="hasMotivo" value={filters.hasMotivo} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white">
      <option value="">Todos</option>
      <option value="true">Sim</option>
      <option value="false">Não</option>
    </select>
  </label>

  <label className="flex flex-col text-white">
    Cancelada?
    <select name="hasCancelamento" value={filters.hasCancelamento} onChange={handleChange} disabled={loading} className="bg-gray-700 px-3 py-1 rounded text-white">
      <option value="">Todos</option>
      <option value="true">Sim</option>
      <option value="false">Não</option>
    </select>
  </label>

  <div className="flex items-end gap-2">
    <button type="submit" disabled={loading} className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 text-white">Filtrar</button>
    <button type="button" onClick={exportToCSV} disabled={loading || !notas.length} className="bg-green-600 px-4 py-1 rounded hover:bg-green-700 text-white">Exportar CSV</button>
  </div>
</form>

      </div>

      <main className="p-8 pt-12">
        <h1 className="text-2xl font-semibold mb-6 text-center">Faturamento</h1>

        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-opacity-50"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <h2 className="text-lg font-bold mb-2">Total Produtos (ValorMerc)</h2>
              <p className="text-2xl text-green-400">
                R$ {totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <h2 className="text-lg font-bold mb-2">Total ICMS</h2>
              <p className="text-2xl text-yellow-400">
                R$ {totalImpostos.ICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <h2 className="text-lg font-bold mb-2">Total PIS</h2>
              <p className="text-2xl text-yellow-400">
                R$ {totalImpostos.PIS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <h2 className="text-lg font-bold mb-2">Total COFINS</h2>
              <p className="text-2xl text-yellow-400">
                R$ {totalImpostos.COFINS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <h2 className="text-lg font-bold mb-2">Total ISS</h2>
              <p className="text-2xl text-yellow-400">
                R$ {totalImpostos.ISS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
