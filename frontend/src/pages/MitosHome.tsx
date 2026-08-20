import React from 'react'
import {
  ArrowForward,
  CalendarMonth,
  CheckCircleOutline,
  DirectionsCar,
  LocationOn,
  Route,
  SmartToyOutlined,
  SupportAgent,
  WhatsApp,
} from '@mui/icons-material'
import Layout from '@/components/Layout'
import SearchForm from '@/components/SearchForm'
import MitosFooter from '@/components/MitosFooter'
import { mitosBrand } from '@/config/mitosBrand'
import '@/assets/css/mitos-home.css'

const MitosHome = () => {
  const goToSearch = () => {
    document.getElementById('mitos-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <Layout strict={false}>
      <main className="mitos-home">
        <section className="mitos-hero" id="inicio">
          <div className="mitos-hero-copy">
            <div className="mitos-eyebrow">MITOS RENT A CAR · LIMA, PERÚ</div>
            <h1>Tu ruta empieza cuando tú decides.</h1>
            <p className="mitos-hero-tagline">{mitosBrand.tagline}</p>
            <p className="mitos-hero-support">
              Explora opciones para ciudad, trabajo o una escapada y continúa tu reserva en el mismo flujo de Mitos.
            </p>

            <div className="mitos-hero-actions">
              <button type="button" className="mitos-btn mitos-btn-primary" onClick={goToSearch}>
                Buscar auto <ArrowForward fontSize="small" />
              </button>
              <a className="mitos-btn mitos-btn-secondary" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
                <WhatsApp fontSize="small" /> WhatsApp
              </a>
            </div>

            <div className="mitos-agent-seam">
              <SmartToyOutlined fontSize="small" />
              <span>Agente Mitos</span>
              <small>Integración preparada · runtime después</small>
            </div>
          </div>

          <div className="mitos-hero-visual" aria-hidden="true">
            <div className="mitos-road-card">
              <div className="mitos-road-orbit mitos-road-orbit-one" />
              <div className="mitos-road-orbit mitos-road-orbit-two" />
              <div className="mitos-car-mark"><DirectionsCar /></div>
              <div className="mitos-route-label mitos-route-label-one"><LocationOn /> Ciudad</div>
              <div className="mitos-route-label mitos-route-label-two"><Route /> Ruta</div>
              <div className="mitos-route-label mitos-route-label-three"><CalendarMonth /> Escapada</div>
            </div>
          </div>
        </section>

        <section className="mitos-search-zone" id="mitos-search">
          <div className="mitos-section-intro mitos-section-intro-compact">
            <span>Empieza aquí</span>
            <h2>Busca tu próximo auto</h2>
            <p>La disponibilidad real pertenece al flujo Rent A Car. Mitos solo te abre la puerta.</p>
          </div>
          <div className="mitos-search-card">
            <SearchForm />
          </div>
        </section>

        <section className="mitos-section" id="por-que-mitos">
          <div className="mitos-section-intro">
            <span>Por qué Mitos</span>
            <h2>Movilidad simple, clara y lista para tu plan.</h2>
            <p>Una experiencia pensada para ayudarte a pasar de “necesito un auto” a “ya tengo mi ruta”.</p>
          </div>

          <div className="mitos-value-grid">
            <article className="mitos-value-card">
              <CheckCircleOutline />
              <h3>Reserva simple</h3>
              <p>Empieza con una búsqueda directa y continúa en el funnel de reserva sin cambiar de experiencia.</p>
            </article>
            <article className="mitos-value-card">
              <DirectionsCar />
              <h3>Modelos para distintos planes</h3>
              <p>Mitos ha comunicado modelos recientes para ciudad y ruta. La disponibilidad se confirma en el buscador.</p>
            </article>
            <article className="mitos-value-card">
              <SupportAgent />
              <h3>Atención directa</h3>
              <p>Si todavía no sabes qué necesitas, WhatsApp sigue disponible como canal humano de apoyo.</p>
            </article>
            <article className="mitos-value-card">
              <Route />
              <h3>Tu ruta, tu ritmo</h3>
              <p>Ciudad, trabajo o una escapada: la experiencia empieza por el plan que tienes en mente.</p>
            </article>
          </div>
        </section>

        <section className="mitos-section mitos-fleet" id="vehiculos">
          <div className="mitos-section-intro">
            <span>Vehículos publicados</span>
            <h2>Dos modelos que ya forman parte de la comunicación pública de Mitos.</h2>
            <p>Estos modelos se muestran como referencia editorial; no representan disponibilidad en tiempo real.</p>
          </div>

          <div className="mitos-fleet-grid">
            <article className="mitos-fleet-card">
              <div className="mitos-fleet-visual"><DirectionsCar /></div>
              <div className="mitos-fleet-copy">
                <small>MODELO PUBLICADO POR MITOS</small>
                <h3>Toyota Yaris 2025/26</h3>
                <p>Una referencia publicada para movilidad práctica en ciudad y recorridos cotidianos.</p>
                <button type="button" onClick={goToSearch}>Consultar disponibilidad <ArrowForward fontSize="small" /></button>
              </div>
            </article>

            <article className="mitos-fleet-card mitos-fleet-card-alt">
              <div className="mitos-fleet-visual"><DirectionsCar /></div>
              <div className="mitos-fleet-copy">
                <small>MODELO PUBLICADO POR MITOS</small>
                <h3>Toyota Raize</h3>
                <p>Una referencia publicada para quienes buscan una experiencia con presencia SUV y flexibilidad de ruta.</p>
                <button type="button" onClick={goToSearch}>Consultar disponibilidad <ArrowForward fontSize="small" /></button>
              </div>
            </article>
          </div>
        </section>

        <section className="mitos-section mitos-how" id="como-funciona">
          <div className="mitos-section-intro">
            <span>Cómo alquilar</span>
            <h2>Una entrada simple al funnel real.</h2>
          </div>
          <div className="mitos-steps">
            <div className="mitos-step"><b>01</b><h3>Busca</h3><p>Elige ubicación y fechas para iniciar una búsqueda real.</p></div>
            <div className="mitos-step"><b>02</b><h3>Elige</h3><p>Compara las opciones que el Rent A Car Core devuelva para tu solicitud.</p></div>
            <div className="mitos-step"><b>03</b><h3>Continúa</h3><p>Avanza a checkout y reserva dentro del mismo recorrido de Mitos.</p></div>
          </div>
        </section>

        <section className="mitos-travel-band">
          <div>
            <span>LIBERTAD · MOVIMIENTO · RUTA</span>
            <h2>La experiencia Mitos no empieza en el checkout. Empieza cuando imaginas a dónde quieres ir.</h2>
          </div>
          <Route className="mitos-travel-icon" />
        </section>

        <section className="mitos-section mitos-promo" id="promociones">
          <div className="mitos-promo-card">
            <div>
              <span>Promociones</span>
              <h2>Consulta la campaña vigente antes de reservar.</h2>
              <p>{mitosBrand.publishedPromotionReference}. Vigencia, disponibilidad y condiciones deben confirmarse antes de la reserva.</p>
            </div>
            <a className="mitos-btn mitos-btn-primary" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
              Consultar promoción <WhatsApp fontSize="small" />
            </a>
          </div>
        </section>

        <section className="mitos-section" id="preguntas">
          <div className="mitos-section-intro">
            <span>Antes de salir</span>
            <h2>Lo importante, sin prometer lo que todavía debe confirmarse.</h2>
          </div>
          <div className="mitos-faq-grid">
            <article><h3>¿Cómo empiezo?</h3><p>Usa el buscador para iniciar el funnel o escríbenos por WhatsApp si primero necesitas orientación.</p></article>
            <article><h3>¿Qué autos están disponibles?</h3><p>La disponibilidad no vive en la landing. Se confirma en el flujo real de búsqueda.</p></article>
            <article><h3>¿Qué condiciones aplican?</h3><p>Precios, seguros, depósitos y condiciones deben confirmarse con la información vigente antes de cerrar la reserva.</p></article>
          </div>
        </section>

        <section className="mitos-final-cta">
          <div>
            <span>¿Listo para tu próxima ruta?</span>
            <h2>Busca un auto ahora o habla con Mitos.</h2>
          </div>
          <div className="mitos-final-actions">
            <button type="button" className="mitos-btn mitos-btn-white" onClick={goToSearch}>Buscar auto</button>
            <a className="mitos-btn mitos-btn-outline-white" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer"><WhatsApp fontSize="small" /> WhatsApp</a>
            <button type="button" className="mitos-btn mitos-btn-ghost" disabled title="Agente Mitos se conectará en un slice posterior"><SmartToyOutlined fontSize="small" /> Agente Mitos · próximamente</button>
          </div>
        </section>

        <MitosFooter />
      </main>
    </Layout>
  )
}

export default MitosHome
