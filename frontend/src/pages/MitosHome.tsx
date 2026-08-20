import React from 'react'
import {
  ArrowForward,
  CalendarMonthOutlined,
  DirectionsCar,
  HeadsetMicOutlined,
  LocalOfferOutlined,
  LocationOnOutlined,
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
                  <p>Elige dónde y cuándo, y nosotros nos encargamos del resto.</p>
                </div>
              </div>

              <div className="mitos-search-runtime">
                <SearchForm />
                <div className="mitos-search-fallback" aria-hidden="true">
                  <div className="mitos-search-field">
                    <small>Retiro</small>
                    <span><LocationOnOutlined /> Ciudad o aeropuerto</span>
                  </div>
                  <div className="mitos-search-field">
                    <small>Devolución</small>
                    <span><LocationOnOutlined /> Ciudad o aeropuerto</span>
                  </div>
                  <div className="mitos-search-field">
                    <small>Fecha de retiro</small>
                    <span><CalendarMonthOutlined /> Selecciona fecha</span>
                  </div>
                  <div className="mitos-search-field">
                    <small>Fecha de devolución</small>
                    <span><CalendarMonthOutlined /> Selecciona fecha</span>
                  </div>
                  <label className="mitos-search-check"><input type="checkbox" /> Devolver en otra ubicación</label>
                  <button type="button" className="mitos-search-fallback-button" disabled><SearchOutlined /> Buscar auto</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mitos-trust-strip" aria-label="Beneficios Mitos">
            <div><SecurityOutlined /><span><b>Reserva segura</b><small>Tus datos siempre protegidos.</small></span></div>
            <div><DirectionsCar /><span><b>Autos modernos</b><small>Flota renovada y en excelente estado.</small></span></div>
            <div><HeadsetMicOutlined /><span><b>Atención rápida</b><small>Te ayudamos en cada paso de tu viaje.</small></span></div>
            <div><LocalOfferOutlined /><span><b>Precios claros</b><small>Sin sorpresas, todo transparente.</small></span></div>
          </div>

          <div className="mitos-story-block">
            <h2>Movilidad que te da libertad</h2>
            <p>
              En Mitos Rent a Car queremos que disfrutes cada kilómetro. Ya sea por trabajo,
              vacaciones o para moverte por la ciudad, estamos aquí para acompañarte
              con confianza y la mejor experiencia.
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
            <h2>Una experiencia de alquiler pensada para avanzar.</h2>
            <p>Menos fricción, más claridad: descubre, busca y continúa tu reserva sin cambiar de experiencia.</p>
          </div>
          <div className="mitos-four-cards">
            <article><b>01</b><h3>Reserva simple</h3><p>La búsqueda real de Rent A Car vive desde el primer frame.</p></article>
            <article><b>02</b><h3>Vehículos para tu plan</h3><p>Ciudad, trabajo o ruta: encuentra una opción adecuada para tu intención.</p></article>
            <article><b>03</b><h3>Atención directa</h3><p>WhatsApp funciona como canal humano mientras el agente Mitos se integra después.</p></article>
            <article><b>04</b><h3>Mismo recorrido</h3><p>De la landing al buscador, checkout y reserva bajo una sola experiencia pública.</p></article>
          </div>
        </section>

        <section className="mitos-frame mitos-fleet-frame" id="vehiculos">
          <div className="mitos-frame-copy">
            <span>VEHÍCULOS</span>
            <h2>Referencias que ya forman parte de Mitos.</h2>
            <p>Los modelos se muestran como comunicación pública; la disponibilidad real se confirma en el buscador.</p>
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
            <div><b>03</b><h3>Reserva</h3><p>Continúa a checkout.</p></div>
            <div><b>04</b><h3>Viaja</h3><p>Tu experiencia Mitos continúa.</p></div>
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
            <article><h3>¿Cómo empiezo?</h3><p>Usa el buscador del hero para iniciar una búsqueda real.</p></article>
            <article><h3>¿Qué autos están disponibles?</h3><p>La disponibilidad se confirma en el flujo Rent A Car, no en la landing.</p></article>
            <article><h3>¿Necesito ayuda?</h3><p>Puedes escribir a Mitos por WhatsApp. El agente AI se integrará en un slice posterior.</p></article>
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

        <MitosFooter />
      </main>
    </Layout>
  )
}

export default MitosHome
