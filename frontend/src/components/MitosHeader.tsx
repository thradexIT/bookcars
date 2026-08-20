import React, { useEffect } from 'react'
import Header from '@/components/Header'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-header.css'

const MitosHeader = () => {
  useEffect(() => {
    document.title = mitosBrand.name
  }, [])

  return (
    <div className="mitos-header-shell">
      <div className="mitos-brand-ribbon">
        <span>{mitosBrand.tagline}</span>
        <span className="mitos-brand-ribbon-market">{mitosBrand.market}</span>
      </div>
      <Header />
    </div>
  )
}

export default MitosHeader
