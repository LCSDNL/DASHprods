import { Routes, Route } from 'react-router-dom'
import ProductPage from './pages/ProductPage'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/produtos" element={<ProductPage />} />
    </Routes>
  )
}
