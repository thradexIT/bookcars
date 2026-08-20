import React from 'react'
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
import Layout from '@/components/Layout'
import SearchForm from '@/components/SearchForm'
import MitosFooter from '@/components/MitosFooter'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-home.css'

const assets = {
  hero: '/ChatGPT Image Aug 20, 2026, 05_00_04 PM (1).png',
  corolla: '/ChatGPT Image Aug 20, 2026, 05_00_04 PM (2).png',
  raize: '/ChatGPT Image Aug 20, 2026, 05_00_05 PM (3).png',
  city: '/ChatGPT Image Aug 20, 2026, 05_00_05 PM (4).png',
  airport: '/ChatGPT Image Aug 20, 2026, 05_00_05 PM (5).png',
  mobility3d: '/ChatGPT Image Aug 20, 2026, 05_05_36 PM (1).png',
  travel3d: '/ChatGPT Image Aug 20, 2026, 05_05_37 PM (2).png',
  route3d: '/ChatGPT Image Aug 20, 2026, 05_05_37 PM (3).png',
}

const MitosHome = () => {
  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            <article><DirectionsCarOutlined /><div><b>Autos modernos</b><span>Modelos recientes comunicados por Mitos.</span></div></article>
            <article><HeadsetMicOutlined /><div><b>Atención rápida</b><span>Habla con Mitos cuando necesites ayuda.</span></div></article>
            <article><LocalOfferOutlined /><div><b>Promociones</b><span>Consulta vigencia y condiciones antes de reservar.</span></div></article>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-why" id="por-que-mitos">
          <div className="mitos-section-heading centered">
            <span>FRAME 02 · POR QUÉ MITOS</span>
            <h2>¿Por qué elegir Mitos?</h2>
            <p>Una experiencia de alquiler clara, directa y pensada para que avances sin fricción.</p>
          </div>

          <div className="mitos-why-layout">
            <div className="mitos-benefit-grid">
              <article><SecurityOutlined /><h3>Atención confiable</h3><p>Comunicación directa para acompañarte cuando lo necesites.</p></article>
              <article><DirectionsCarOutlined /><h3>Modelos recientes</h3><p>Vehículos publicados para ciudad, trabajo y viaje.</p></article>
              <article><CalendarMonthOutlined /><h3>Reserva fácil</h3><p>Empieza desde ubicación y fechas en el primer frame.</p></article>
              <article><HeadsetMicOutlined /><h3>Ayuda cercana</h3><p>WhatsApp hoy; agente Mitos como siguiente capa.</p></article>
            </div>
            <img className="mitos-3d-visual" src={assets.mobility3d} alt="Ilustración 3D de movilidad Mitos" />
          </div>
        </section>

        <section className="mitos-frame mitos-frame-fleet" id="vehiculos">
          <div className="mitos-section-heading split-heading">
            <div>
              <span>FRAME 03 · NUESTRA FLOTA</span>
              <h2>Vehículos para tu próxima ruta.</h2>
              <p>Las imágenes son referencias visuales; la disponibilidad real se confirma en el buscador.</p>
            </div>
            <button type="button" className="mitos-outline-action" onClick={() => goTo('mitos-search')}>Buscar disponibilidad</button>
          </div>

          <div className="mitos-fleet-grid">
            <article className="mitos-car-card">
              <img src={assets.hero} alt="Toyota Yaris azul en carretera costera" />
              <div><small>MODELO PUBLICADO</small><h3>Toyota Yaris 2025/26</h3><p>Económico · ciudad y trayectos diarios</p></div>
            </article>
            <article className="mitos-car-card">
              <img src={assets.raize} alt="Toyota Raize blanca en carretera de montaña" />
              <div><small>MODELO PUBLICADO</small><h3>Toyota Raize</h3><p>SUV · espacio y versatilidad</p></div>
            </article>
            <article className="mitos-car-card">
              <img src={assets.corolla} alt="Sedán blanco en carretera costera" />
              <div><small>REFERENCIA VISUAL</small><h3>Sedán</h3><p>Comodidad para ciudad y viaje</p></div>
            </article>
            <article className="mitos-car-card">
              <img src={assets.airport} alt="Sedán azul frente a terminal de aeropuerto" />
              <div><small>REFERENCIA VISUAL</small><h3>Movilidad ejecutiva</h3><p>Una opción para traslados y agenda</p></div>
            </article>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-how" id="como-funciona">
          <div className="mitos-how-copy">
            <span>FRAME 04 · CÓMO FUNCIONA</span>
            <h2>Así de fácil<br />alquilar tu auto.</h2>
            <p>La landing te guía; Rent A Car mantiene la autoridad de disponibilidad, precio y reserva.</p>
          </div>

          <div className="mitos-steps">
            <article><b>1</b><SearchOutlined /><h3>Elige tu auto</h3><p>Define ubicación y fechas.</p></article>
            <article><b>2</b><CalendarMonthOutlined /><h3>Reserva</h3><p>Revisa las opciones reales disponibles.</p></article>
            <article><b>3</b><KeyOutlined /><h3>Confirma</h3><p>Continúa al checkout existente.</p></article>
            <article><b>4</b><LocationOnOutlined /><h3>Disfruta tu camino</h3><p>Tu experiencia Mitos continúa.</p></article>
          </div>

          <img className="mitos-how-graphic" src={assets.route3d} alt="Ilustración 3D de ruta y alquiler" />
        </section>

        <section className="mitos-frame mitos-frame-promos" id="promociones">
          <div className="mitos-section-heading split-heading">
            <div>
              <span>FRAME 05 · PROMOCIONES</span>
              <h2>Promociones para tu ruta.</h2>
              <p>Referencias de campañas publicadas por Mitos. Confirma siempre vigencia y condiciones.</p>
            </div>
            <a className="mitos-outline-action" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">Consultar ahora</a>
          </div>

          <div className="mitos-promo-grid">
            <article><img src={assets.hero} alt="Ruta costera con Toyota Yaris" /><div><small>CAMPAÑA PUBLICADA</small><h3>Desde US$35 diarios</h3><p>Referencia histórica publicada para Toyota Yaris 2025/26.</p></div></article>
            <article><img src={assets.raize} alt="Toyota Raize en ruta de montaña" /><div><small>CAMPAÑA PUBLICADA</small><h3>Desde US$45 diarios</h3><p>Referencia histórica de campaña. Consulta disponibilidad.</p></div></article>
            <article><img src={assets.city} alt="SUV en ciudad durante la noche" /><div><small>MOVILIDAD</small><h3>Ciudad, trabajo o viaje</h3><p>Encuentra la opción adecuada desde el buscador real.</p></div></article>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-trust" id="experiencia">
          <div className="mitos-trust-copy">
            <span>FRAME 06 · EXPERIENCIA</span>
            <h2>Lo que Mitos comunica.</h2>
            <p>Sin inventar testimonios: usamos solamente señales públicas de la marca mientras recuperamos evidencia real de clientes.</p>
          </div>

          <div className="mitos-trust-cards">
            <article><span>“</span><h3>Atención rápida y confiable</h3><p>Mensaje comercial publicado por Mitos.</p></article>
            <article><span>“</span><h3>Reserva fácil y sin complicaciones</h3><p>Promesa pública de experiencia, no garantía transaccional.</p></article>
            <article><span>“</span><h3>Modelos recientes</h3><p>La disponibilidad concreta se confirma dentro de Rent A Car.</p></article>
          </div>

          <img className="mitos-travel-3d" src={assets.travel3d} alt="Ilustración 3D de viaje y alquiler" />
        </section>

        <section className="mitos-frame mitos-frame-faq" id="preguntas">
          <div className="mitos-faq-copy">
            <span>FRAME 07 · PREGUNTAS FRECUENTES</span>
            <h2>Preguntas frecuentes</h2>
            <p>Todo claro antes de iniciar tu reserva.</p>
          </div>

          <div className="mitos-faq-grid">
            <details><summary>¿Cómo empiezo mi reserva?</summary><p>Usa el buscador del primer frame para ingresar ubicación y fechas.</p></details>
            <details><summary>¿Qué autos están disponibles?</summary><p>La disponibilidad real se confirma dentro del flujo Rent A Car.</p></details>
            <details><summary>¿Puedo devolver el auto en otro lugar?</summary><p>El buscador permite solicitar una ubicación de devolución diferente cuando exista una opción válida.</p></details>
            <details><summary>¿El seguro está incluido?</summary><p>La cobertura exacta, sus reglas y costos deben confirmarse antes de cerrar la reserva.</p></details>
            <details><summary>¿Cómo funcionan los precios?</summary><p>Las campañas mostradas son referencias publicadas. El precio vigente lo determina el flujo de reserva.</p></details>
            <details><summary>¿Necesito ayuda?</summary><p>Puedes hablar con Mitos por WhatsApp. El agente AI se integrará en una fase posterior.</p></details>
          </div>
        </section>

        <section className="mitos-frame mitos-frame-final" id="contacto">
          <div className="mitos-final-cta">
            <div>
              <span>FRAME 08 · EMPIEZA TU RUTA</span>
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
