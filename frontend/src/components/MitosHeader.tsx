import React, { useEffect } from 'react'
import { Language } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-header.css'

const MitosHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isSearch = location.pathname === '/search'

  useEffect(() => {
    document.title = mitosBrand.name
  }, [location.pathname])

  const goToSection = (id: string) => {
    if (!isHome) {
      navigate('/')
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const goToSearch = () => goToSection('mitos-search')

  return (
    <header className="mitos-topbar">
      <button className="mitos-topbar-logo" type="button" aria-label="Mitos Rent a Car - Inicio" onClick={() => goToSection('inicio')} />
      <nav className="mitos-topbar-nav" aria-label="Navegación principal">
        <button type="button" className={isHome ? 'is-active' : ''} onClick={() => goToSection('inicio')}>Inicio</button>
        <button type="button" className={isSearch ? 'is-active' : ''} onClick={() => goToSection('vehiculos')}>Vehículos</button>
        <button type="button" onClick={() => goToSection('como-funciona')}>Cómo funciona</button>
        <button type="button" onClick={() => goToSection('promociones')}>Viajes</button>
        <button type="button" onClick={() => goToSection('preguntas')}>FAQ</button>
        <button type="button" onClick={() => goToSection('contacto')}>Contacto</button>
      </nav>
      <div className="mitos-topbar-actions">
        <button type="button" className="mitos-language" aria-label="Idioma español"><Language fontSize="small" /> ES <span>⌄</span></button>
        <button type="button" className="mitos-search-nav" onClick={goToSearch}>{isSearch ? 'Nueva búsqueda' : 'Buscar auto'}</button>
      </div>
    </header>
  )
}

export default MitosHeader
