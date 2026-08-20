import React from 'react'
import {
  ArrowForward,
  DirectionsCar,
  HeadsetMicOutlined,
  LocalOfferOutlined,
  Route,
  SearchOutlined,
  SecurityOutlined,
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
        <section className="mitos-frame mitos-hero-frame" id="inicio">
          <div className="mitos-hero-scene">
            <div className="mitos-hero-copy">
              <h1>Tu ruta empieza<br />cuando tú decides.</h1>
              <p>{mitosBrand.tagline}</p>
            </div>

            <div className="mitos-hero-car" aria-hidden="true" />

            <div className="mitos-search-panel" id="mitos-search">
              <div className="mitos-search-heading">
                <SearchOutlined />
                <div>
                  <h2>Encuentra tu auto ideal</h2>
                  <p>Elige dónde y cuándo, y continúa tu reserva en Mitos.</p>
                </div>
              </div>

              <div className="mitos-search-runtime">
                <SearchForm variant="mitos" defaultSameLocation />
              </div>
            </div>
          </div>

          <div className="mitos-trust-strip" aria-label="Beneficios Mitos">
            <div><SecurityOutlined /><span><b>Reserva simple</b><small>Empieza tu búsqueda en pocos pasos.</small></span></div>
            <div><DirectionsCar /><span><b>Autos modernos</b><small>Modelos recientes comunicados por Mitos.</small></span></div>
            <div><HeadsetMicOutlined /><span><b>Atención rápida</b><small>Habla con Mitos cuando necesites ayuda.</small></span></div>
            <div><LocalOfferOutlined /><span><b>Promociones</b><small>Consulta vigencia y condiciones antes de reservar.</small></span></div>
          </div>

          <div className="mitos-story-block">
            <h2>Movilidad que te da libertad</h2>
            <p>
              En Mitos Rent a Car queremos que disfrutes cada kilómetro. Ya sea por trabajo,
              vacaciones o para moverte por la ciudad, tu ruta empieza con una búsqueda simple.
            </p>
            <div className="mitos-story-actions">
              <button type="button" className="mitos-btn mitos-btn-primary" onClick={goToSearch}>Buscar auto</button>
              <a className="mitos-btn mitos-btn-outline" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
                <WhatsApp fontSize="small" /> Hablar con Mitos
              </a>
            </div>
          </div>
        </section>

        <section className="mitos-frame mitos-why-frame" id="por-que-mitos">
          <div className="mitos-frame-copy">
            <span>POR QUÉ MITOS</span>
            <h2>Alquila fácil. Muévete con libertad.</h2>
            <p>Una experiencia pública clara que te lleva desde Mitos hasta el flujo real de búsqueda y reserva.</p>
          </div>
          <div className="mitos-four-cards">
            <article><b>01</b><h3>Reserva simple</h3><p>Empieza por ubicación y fechas desde la portada.</p></article>
            <article><b>02</b><h3>Modelos recientes</h3><p>Mitos comunica opciones para ciudad, trabajo y viaje.</p></article>
            <article><b>03</b><h3>Atención directa</h3><p>WhatsApp funciona como canal humano mientras el agente llega después.</p></article>
            <article><b>04</b><h3>Una sola experiencia</h3><p>Landing, búsqueda y reserva se sienten como un mismo Mitos.</p></article>
          </div>
        </section>

        <section className="mitos-frame mitos-fleet-frame" id="vehiculos">
          <div className="mitos-frame-copy">
            <span>VEHÍCULOS</span>
            <h2>Vehículos para tu próxima ruta.</h2>
            <p>Estas referencias vienen de la comunicación pública de Mitos; la disponibilidad real se confirma en el buscador.</p>
          </div>
          <div className="mitos-fleet-cards">
            <article>
              <div className="mitos-vehicle-visual"><DirectionsCar /></div>
              <small>MODELO PUBLICADO</small>
              <h3>Toyota Yaris 2025/26</h3>
              <button type="button" onClick={goToSearch}>Consultar disponibilidad <ArrowForward fontSize="small" /></button>
            </article>
            <article>
              <div className="mitos-vehicle-visual"><DirectionsCar /></div>
              <small>MODELO PUBLICADO</small>
              <h3>Toyota Raize</h3>
              <button type="button" onClick={goToSearch}>Consultar disponibilidad <ArrowForward fontSize="small" /></button>
            </article>
          </div>
        </section>

        <section className="mitos-frame mitos-how-frame" id="como-funciona">
          <div className="mitos-frame-copy mitos-frame-copy-centered">
            <span>CÓMO FUNCIONA</span>
            <h2>Busca. Elige. Reserva. Sal a tu ruta.</h2>
          </div>
          <div className="mitos-steps-line">
            <div><b>01</b><h3>Busca</h3><p>Ubicación y fechas.</p></div>
            <div><b>02</b><h3>Elige</h3><p>Opciones reales del Rent A Car.</p></div>
            <div><b>03</b><h3>Reserva</h3><p>Continúa al checkout existente.</p></div>
            <div><b>04</b><h3>Viaja</h3><p>La experiencia Mitos continúa.</p></div>
          </div>
        </section>

        <section className="mitos-frame mitos-experience-frame" id="promociones">
          <div className="mitos-experience-copy">
            <span>LIBERTAD · MOVIMIENTO · RUTA</span>
            <h2>Tu próximo plan empieza con una llave.</h2>
            <p>{mitosBrand.publishedPromotionReference}. Consulta vigencia, disponibilidad y condiciones antes de reservar.</p>
            <a className="mitos-btn mitos-btn-white" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer">
              <WhatsApp fontSize="small" /> Consultar promoción
            </a>
          </div>
          <Route className="mitos-experience-route" />
        </section>

        <section className="mitos-frame mitos-faq-frame" id="preguntas">
          <div className="mitos-frame-copy">
            <span>FAQ</span>
            <h2>Todo claro antes de reservar.</h2>
          </div>
          <div className="mitos-faq-list">
            <article><h3>¿Cómo empiezo?</h3><p>Usa el buscador del primer frame para iniciar una búsqueda real.</p></article>
            <article><h3>¿Qué autos están disponibles?</h3><p>La disponibilidad se confirma en el flujo Rent A Car, no en la landing.</p></article>
            <article><h3>¿Necesito ayuda?</h3><p>Puedes escribir a Mitos por WhatsApp. El agente AI llega en un slice posterior.</p></article>
            <article><h3>¿Qué condiciones aplican?</h3><p>Precios, seguros, depósitos y políticas se confirman con información vigente antes de cerrar la reserva.</p></article>
          </div>
        </section>

        <section className="mitos-frame mitos-contact-frame" id="contacto">
          <div>
            <span>MITOS RENT A CAR</span>
            <h2>¿Listo para tu próxima ruta?</h2>
            <p>Busca un auto ahora o habla con Mitos.</p>
          </div>
          <div className="mitos-contact-actions">
            <button type="button" className="mitos-btn mitos-btn-white" onClick={goToSearch}>Buscar auto</button>
            <a className="mitos-btn mitos-btn-outline-white" href={mitosBrand.whatsappUrl} target="_blank" rel="noreferrer"><WhatsApp fontSize="small" /> Hablar con Mitos</a>
          </div>
        </section>

        <section className="mitos-frame mitos-footer-frame" aria-label="Pie de página Mitos">
          <MitosFooter />
        </section>
      </main>
    </Layout>
  )
}

export default MitosHome
