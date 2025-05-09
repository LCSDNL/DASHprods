import { Routes, Route } from 'react-router-dom'
import ProductPageActive from './pages/ProductPageActive'
import ProductPagePaused from './pages/ProductPagePaused'
import ProductPageClosed from './pages/ProductPageClosed'
import CanalVendasPage from './pages/CanalVendasPage'
import FaturamentoPage from './pages/FaturamentoPage'
import FaturamentoItemPage from './pages/FaturamentoItemPage'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/produtos" element={<ProductPageActive />} />
      <Route path="/produtos-pausados" element={<ProductPagePaused />} />
      <Route path="/produtos-finalizados" element={<ProductPageClosed />} />
      <Route path="/canal-vendas" element={<CanalVendasPage />} />
      <Route path="/faturamento" element={<FaturamentoPage />} />
      <Route path="/faturamentoitem" element={<FaturamentoItemPage />} />
    </Routes>
)
}
