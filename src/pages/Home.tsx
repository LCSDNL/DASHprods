import React, { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#00C49F', '#FFBB28', '#FF4444']

const Home = () => {
  const [data, setData] = useState<any[]>([])
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
      }
    }

    fetchData()
  }, [])

  const handleClick = (entry: any) => {
    if (entry.name === 'Ativos') {
      navigate('/produtos')
    }
    if (entry.name === 'Pausados') {
        navigate('/produtos-pausados')
      }
      if (entry.name === 'Finalizados') {
        navigate('/produtos-finalizados')
      }
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
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl text-center font-semibold mb-6">Status dos Produtos</h1>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              onClick={handleClick}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ cursor: entry.name === 'Ativos' ? 'pointer' : 'default' }}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {renderCustomLegend()}

      </div>
    </div>
  )
}

export default Home
