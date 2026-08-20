import React from 'react'
import { Instagram, WhatsApp } from '@mui/icons-material'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-footer.css'

const MitosFooter = () => (
  <footer className="mitos-footer">
    <div className="mitos-footer-brand">
      <div className="mitos-footer-wordmark">
        <strong>{mitosBrand.shortName}</strong>
        <span>{mitosBrand.descriptor}</span>
      </div>
      <p>{mitosBrand.tagline}</p>
    </div>

    <div className="mitos-footer-links">
      <a href="#vehiculos">Vehículos</a>
      <a href="#como-funciona">Cómo alquilar</a>
      <a href="#promociones">Promociones</a>
      <a href="#preguntas">Preguntas frecuentes</a>
    </div>

    <div className="mitos-footer-contact">
      <a href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
        <WhatsApp fontSize="small" />
        {mitosBrand.whatsappDisplay}
      </a>
      <a href={mitosBrand.instagramUrl} target="_blank" rel="noreferrer">
        <Instagram fontSize="small" />
        {mitosBrand.instagramHandle}
      </a>
      <span>{mitosBrand.domain}</span>
    </div>

    <div className="mitos-footer-bottom">
      <span>MITOS Rent a Car · {mitosBrand.market}</span>
      <span>Disponibilidad, precios y condiciones se confirman en el flujo de reserva.</span>
    </div>
  </footer>
)

export default MitosFooter
