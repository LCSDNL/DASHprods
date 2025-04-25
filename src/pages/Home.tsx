import React, { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useNavigate } from 'react-router-dom'

import inventoicon from '../assets/inventoIcon.png'

const COLORS = ['#00C49F', '#FFBB28', '#FF4444']

const Home = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:3100/generalnumbers', {
          headers: {
            'x-api-key': '761552bc22b6aea69ed2a331d50ff31e7ae6411a4e1f9443002f0c982a392db6'
          }
        })
        const json = await res.json()
        const raw = json.result || {}

        const pieData = [
          { name: 'Ativos', value: raw.active?.total || 0 },
          { name: 'Pausados', value: raw.paused?.total || 0 },
          { name: 'Finalizados', value: raw.closed?.total || 0 }
        ]

        setData(pieData)
      } catch (err) {
        console.error('Erro ao buscar dados do gráfico:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleClick = (entry: any) => {
    if (entry.name === 'Ativos') navigate('/produtos')
    if (entry.name === 'Pausados') navigate('/produtos-pausados')
    if (entry.name === 'Finalizados') navigate('/produtos-finalizados')
  }

  const renderCustomLegend = () => (
    <ul className="flex justify-center gap-8 mt-4">
      {data.map((entry, index) => (
        <li
          key={`legend-${index}`}
          className="text-sm cursor-pointer text-center"
          onClick={() => handleClick(entry)}
        >
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span>{entry.name}</span>
          </div>
          <div className="text-white mt-1 font-semibold">{entry.value}</div>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard de Produtos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Card do gráfico de pizza */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-medium mb-4">Status dos Produtos no Mercado Livre</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-red-500 rounded-full"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">Erro ao carregar dados</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    onClick={handleClick}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {renderCustomLegend()}
            </>
          )}
        </div>

        {/* Card das integrações (agora clicável na imagem) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-medium mb-4">Anúncios Vinculados no Invento</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-red-500 rounded-full"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">Erro ao carregar dados</p>
          ) : (
            <div className="flex justify-center items-center h-64">
              <img
                src={inventoicon}
                alt="Invento logo"
                className="object-contain cursor-pointer"
                onClick={() => navigate('/canal-vendas')}
              />
            </div>
          )}
        </div>

        {/* Card teste */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-medium mb-4">Em breve...</h2>
          <p>Novos indicadores serão adicionados aqui.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
