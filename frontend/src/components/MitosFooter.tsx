import React from 'react'
import { Instagram, WhatsApp } from '@mui/icons-material'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-footer.css'

const MitosFooter = () => (
  <footer className="mitos-footer">
    <div className="mitos-footer-brand">
      <div className="mitos-footer-logo" aria-label="Mitos Rent a Car" />
      <p>{mitosBrand.tagline}</p>
      <small>{mitosBrand.market}</small>
    </div>

    <div className="mitos-footer-column">
      <strong>Compañía</strong>
      <a href="#por-que-mitos">Por qué Mitos</a>
      <a href="#vehiculos">Vehículos</a>
      <a href="#promociones">Promociones</a>
    </div>

    <div className="mitos-footer-column">
      <strong>Servicios</strong>
      <a href="#mitos-search">Buscar auto</a>
      <a href="#como-funciona">Cómo alquilar</a>
      <a href="#preguntas">Preguntas frecuentes</a>
    </div>

    <div className="mitos-footer-column">
      <strong>Ayuda</strong>
      <a href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
        <WhatsApp fontSize="small" /> {mitosBrand.whatsappDisplay}
      </a>
      <a href={mitosBrand.instagramUrl} target="_blank" rel="noreferrer">
        <Instagram fontSize="small" /> {mitosBrand.instagramHandle}
      </a>
      <span>{mitosBrand.domain}</span>
    </div>

    <div className="mitos-footer-bottom">
      <span>© 2026 MITOS Rent a Car</span>
      <span>Disponibilidad, precios y condiciones se confirman dentro del flujo de reserva.</span>
    </div>
  </footer>
)

export default MitosFooter
