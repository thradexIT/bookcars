import React, { useEffect, useState } from 'react'
import {
  CalendarMonthOutlined,
  DirectionsCarOutlined,
  HeadsetMicOutlined,
  KeyOutlined,
  LocalOfferOutlined,
  LocationOnOutlined,
  SearchOutlined,
  SecurityOutlined,
  WhatsApp,
} from '@mui/icons-material'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '@/components/Layout'
import SearchForm from '@/components/SearchForm'
import MitosFooter from '@/components/MitosFooter'
import { mitosBrand } from '@/config/mitosBrand'
import env from '@/config/env.config'
import * as CarService from '@/services/CarService'
import '@/assets/css/mitos-home.css'

const assets = {
  hero: '/ChatGPT Image Aug 20, 2026, 05_00_04 PM (1).png',
  city: '/ChatGPT Image Aug 20, 2026, 05_00_05 PM (4).png',
  airport: '/ChatGPT Image Aug 20, 2026, 05_00_05 PM (5).png',
  mobility3d: '/ChatGPT Image Aug 20, 2026, 05_05_36 PM (1).png',
  travel3d: '/ChatGPT Image Aug 20, 2026, 05_05_37 PM (2).png',
  route3d: '/ChatGPT Image Aug 20, 2026, 05_05_37 PM (3).png',
}

const formatFleetLabel = (value?: string) => {
  if (!value) return ''
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const MitosHome = () => {
  const [fleet, setFleet] = useState<CarService.PublicFleetCar[]>([])
  const [fleetLoading, setFleetLoading] = useState(true)
  const [fleetError, setFleetError] = useState(false)

  useEffect(() => {
    let active = true

    const loadFleet = async () => {
      try {
        const cars = await CarService.getPublicFleet(4)
        if (active) {
          setFleet(cars)
          setFleetError(false)
        }
      } catch (err) {
        console.error('[MitosHome] Unable to load public fleet', err)
        if (active) {
          setFleet([])
          setFleetError(true)
        }
      } finally {
        if (active) setFleetLoading(false)
      }
    }

    loadFleet()

    return () => {
      active = false
    }
  }, [])

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getFleetMeta = (car: CarService.PublicFleetCar) => {
    const details = [
      formatFleetLabel(car.range),
      formatFleetLabel(car.gearbox),
      car.seats ? `${car.seats} asientos` : '',
    ].filter(Boolean)

    return details.join(' · ') || 'Consulta sus características al iniciar tu búsqueda.'
  }

  return (
    <Layout strict={false}>
      <main className="mitos-home">
        <section className="mitos-frame mitos-frame-hero" id="inicio">
          <div className="mitos-hero-media" style={{ backgroundImage: `url("${assets.hero}")` }}>
            <div className="mitos-hero-shade" />
            <div className="mitos-hero-copy">
              <span>MITOS RENT A CAR</span>
              <h1>Tu ruta empieza<br />cuando tú decides.</h1>
              <p>{mitosBrand.tagline}</p>
            </div>

            <div className="mitos-search-card" id="mitos-search">
              <div className="mitos-search-title">
                <SearchOutlined />
                <div>
                  <strong>Encuentra tu auto ideal</strong>
                  <small>Elige dónde y cuándo, y continúa tu reserva en Mitos.</small>
                </div>
              </div>
              <SearchForm variant="mitos" defaultSameLocation />
            </div>
          </div>

          <div className="mitos-hero-benefits" aria-label="Beneficios de Mitos">
            <article><SecurityOutlined /><div><b>Reserva simple</b><span>Empieza tu búsqueda en pocos pasos.</span></div></article>
            <article><DirectionsCarOutlined /><div><b>Flota real</b><span>Los vehículos publicados vienen del sistema de alquiler.</span></div></article>
            <article><HeadsetMicOutlined /><div><b>Atención rápida</b><span>Habla con Mitos cuando necesites ayuda.</span></div></article>
            <article><LocalOfferOutlined /><div><b>Condiciones claras</b><span>Disponibilidad y precio se confirman en tu búsqueda.</span></div></article>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-why" id="por-que-mitos">
          <div className="mitos-section-heading centered">
            <span>POR QUÉ MITOS</span>
            <h2>¿Por qué elegir Mitos?</h2>
            <p>Una experiencia de alquiler clara, directa y pensada para que avances sin fricción.</p>
          </div>

          <div className="mitos-why-layout">
            <div className="mitos-benefit-grid">
              <article><SecurityOutlined /><h3>Atención confiable</h3><p>Comunicación directa para acompañarte cuando lo necesites.</p></article>
              <article><DirectionsCarOutlined /><h3>Flota conectada</h3><p>La landing presenta vehículos registrados en el sistema de alquiler.</p></article>
              <article><CalendarMonthOutlined /><h3>Reserva fácil</h3><p>Empieza desde ubicación y fechas en el primer bloque.</p></article>
              <article><HeadsetMicOutlined /><h3>Ayuda cercana</h3><p>Contacta directamente a Mitos por WhatsApp cuando necesites soporte.</p></article>
            </div>
            <img className="mitos-3d-visual" src={assets.mobility3d} alt="Ilustración 3D de movilidad Mitos" />
          </div>
        </section>

        <section className="mitos-frame mitos-frame-fleet" id="vehiculos">
          <div className="mitos-section-heading split-heading">
            <div>
              <span>NUESTRA FLOTA</span>
              <h2>Vehículos para tu próxima ruta.</h2>
              <p>Esta vitrina se alimenta del Rent A Car. La disponibilidad concreta se confirma con ubicación y fechas.</p>
            </div>
            <button type="button" className="mitos-outline-action" onClick={() => goTo('mitos-search')}>Buscar disponibilidad</button>
          </div>

          <div className="mitos-fleet-grid">
            {fleetLoading && (
              <div className="mitos-fleet-state" role="status">
                <DirectionsCarOutlined />
                <strong>Cargando flota Mitos…</strong>
                <span>Estamos consultando los vehículos registrados.</span>
              </div>
            )}

            {!fleetLoading && fleetError && (
              <div className="mitos-fleet-state is-error" role="alert">
                <DirectionsCarOutlined />
                <strong>No pudimos cargar la flota.</strong>
                <span>No mostramos vehículos de respaldo inventados. Puedes iniciar una búsqueda o contactar a Mitos.</span>
              </div>
            )}

            {!fleetLoading && !fleetError && fleet.length === 0 && (
              <div className="mitos-fleet-state">
                <DirectionsCarOutlined />
                <strong>No hay vehículos publicados en este momento.</strong>
                <span>La landing refleja el estado real del sistema y no agrega autos manualmente.</span>
              </div>
            )}

            {!fleetLoading && !fleetError && fleet.map((car) => (
              <article className="mitos-car-card" key={car._id}>
                {car.image ? (
                  <img src={bookcarsHelper.joinURL(env.CDN_CARS, car.image)} alt={car.name} />
                ) : (
                  <div className="mitos-car-image-placeholder" aria-label={`${car.name} sin imagen`}>
                    <DirectionsCarOutlined />
                  </div>
                )}
                <div>
                  <small>FLOTA MITOS</small>
                  <h3>{car.name}</h3>
                  <p>{getFleetMeta(car)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mitos-frame mitos-frame-how" id="como-funciona">
          <div className="mitos-how-copy">
            <span>CÓMO FUNCIONA</span>
            <h2>Así de fácil<br />alquilar tu auto.</h2>
            <p>Mitos presenta la experiencia; el Rent A Car mantiene la autoridad de disponibilidad, precio y reserva.</p>
          </div>

          <div className="mitos-steps">
            <article><b>1</b><SearchOutlined /><h3>Define tu ruta</h3><p>Ingresa ubicación y fechas.</p></article>
            <article><b>2</b><CalendarMonthOutlined /><h3>Revisa opciones</h3><p>Consulta los autos realmente disponibles.</p></article>
            <article><b>3</b><KeyOutlined /><h3>Confirma</h3><p>Continúa con el checkout de tu reserva.</p></article>
            <article><b>4</b><LocationOnOutlined /><h3>Disfruta tu camino</h3><p>Tu experiencia Mitos continúa.</p></article>
          </div>

          <img className="mitos-how-graphic" src={assets.route3d} alt="Ilustración 3D de ruta y alquiler" />
        </section>

        <section className="mitos-frame mitos-frame-promos" id="promociones">
          <div className="mitos-section-heading split-heading">
            <div>
              <span>PLANEA TU VIAJE</span>
              <h2>Elige según tu ruta.</h2>
              <p>No publicamos precios estáticos como si fueran tarifas vigentes. Tu búsqueda determina disponibilidad y precio reales.</p>
            </div>
            <a className="mitos-outline-action" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">Consultar con Mitos</a>
          </div>

          <div className="mitos-promo-grid">
            <article><img src={assets.city} alt="Movilidad urbana" /><div><small>CIUDAD</small><h3>Muévete a tu ritmo</h3><p>Busca el vehículo adecuado para tus fechas y punto de recojo.</p></div></article>
            <article><img src={assets.airport} alt="Movilidad desde aeropuerto" /><div><small>TRASLADOS</small><h3>Conecta tu llegada</h3><p>Consulta las ubicaciones habilitadas directamente en el buscador.</p></div></article>
            <article><img src={assets.hero} alt="Ruta con vehículo Mitos" /><div><small>VIAJE</small><h3>Empieza por la disponibilidad real</h3><p>El sistema calcula las opciones que aplican a tu ruta y tus fechas.</p></div></article>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-trust" id="experiencia">
          <div className="mitos-trust-copy">
            <span>EXPERIENCIA MITOS</span>
            <h2>Una sola experiencia de alquiler.</h2>
            <p>La marca acompaña el recorrido completo mientras el sistema de Rent A Car conserva la verdad transaccional.</p>
          </div>

          <div className="mitos-trust-cards">
            <article><span>01</span><h3>Flota desde backend</h3><p>La landing ya no mantiene una lista paralela de vehículos.</p></article>
            <article><span>02</span><h3>Disponibilidad por búsqueda</h3><p>Ubicación y fechas determinan las opciones reales.</p></article>
            <article><span>03</span><h3>Reserva con la misma autoridad</h3><p>Precio, checkout y booking siguen perteneciendo al Rent A Car.</p></article>
          </div>

          <img className="mitos-travel-3d" src={assets.travel3d} alt="Ilustración 3D de viaje y alquiler" />
        </section>

        <section className="mitos-frame mitos-frame-faq" id="preguntas">
          <div className="mitos-faq-copy">
            <span>PREGUNTAS FRECUENTES</span>
            <h2>Preguntas frecuentes</h2>
            <p>Todo claro antes de iniciar tu reserva.</p>
          </div>

          <div className="mitos-faq-grid">
            <details><summary>¿Cómo empiezo mi reserva?</summary><p>Usa el buscador inicial para ingresar ubicación y fechas.</p></details>
            <details><summary>¿Qué autos están disponibles?</summary><p>La vitrina muestra la flota publicada; la disponibilidad para tu viaje se confirma después de ingresar ubicación y fechas.</p></details>
            <details><summary>¿Puedo devolver el auto en otro lugar?</summary><p>El buscador permite solicitar una ubicación de devolución diferente cuando exista una opción válida.</p></details>
            <details><summary>¿El seguro está incluido?</summary><p>La cobertura exacta, sus reglas y costos deben confirmarse antes de cerrar la reserva.</p></details>
            <details><summary>¿Cómo funcionan los precios?</summary><p>El precio vigente se determina dentro del flujo de reserva según las condiciones aplicables.</p></details>
            <details><summary>¿Necesito ayuda?</summary><p>Puedes hablar directamente con Mitos por WhatsApp.</p></details>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-final" id="contacto">
          <div className="mitos-final-cta">
            <div>
              <span>EMPIEZA TU RUTA</span>
              <h2>¿Listo para comenzar tu viaje?</h2>
              <p>Busca tu auto o habla con Mitos.</p>
            </div>
            <div className="mitos-final-actions">
              <button type="button" className="mitos-white-action" onClick={() => goTo('mitos-search')}><SearchOutlined /> Buscar mi auto</button>
              <a className="mitos-ghost-action" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer"><WhatsApp /> Hablar con Mitos</a>
            </div>
          </div>
          <MitosFooter />
        </section>
      </main>
    </Layout>
  )
}

export default MitosHome
