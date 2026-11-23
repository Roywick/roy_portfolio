import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import BackToTop from './components/Layout/BackToTop'
import CustomCursor from './components/Layout/CustomCursor'
import LoadingScreen from './components/Layout/LoadingScreen'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

export default function App() {
  const [loading, setLoading] = useState(true)
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="cursor-enabled relative min-h-screen overflow-x-hidden">
      <LoadingScreen visible={loading} />
      <CustomCursor />
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </div>
  )
}
