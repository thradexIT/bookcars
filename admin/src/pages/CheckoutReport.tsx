import React, { useEffect, useState } from 'react'
import * as BookingService from '@/services/BookingService'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'

// ─── Print CSS injected into the document ────────────────────────────────────
const PRINT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    background: #f0f2f5;
    color: #1a1a2e;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .report-wrapper {
    max-width: 860px;
    margin: 32px auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 32px rgba(0,0,0,.12);
    overflow: hidden;
  }

  /* ── Header ── */
  .report-header {
    background: linear-gradient(135deg, #1565c0, #0d47a1);
    color: #fff;
    padding: 32px 40px 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .report-header .brand { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; opacity: .7; margin-bottom: 6px; }
  .report-header .doc-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
  .report-header .doc-subtitle { font-size: 13px; opacity: .8; margin-top: 4px; }
  .report-header .doc-meta { text-align: right; font-size: 13px; }
  .report-header .doc-meta strong { display: block; font-size: 11px; opacity: .7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
  .report-header .doc-meta .doc-id { font-size: 15px; font-weight: 600; font-family: monospace; letter-spacing: 1px; }

  /* ── Status banner ── */
  .status-banner {
    background: #e8f5e9;
    border-bottom: 1px solid #c8e6c9;
    padding: 10px 40px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #2e7d32;
    font-weight: 600;
  }
  .status-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #43a047; flex-shrink: 0;
  }

  /* ── Body ── */
  .report-body { padding: 36px 40px; }

  /* ── Sections ── */
  .section { margin-bottom: 30px; }
  .section-title {
    font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
    color: #1565c0; font-weight: 700; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::after {
    content: ''; flex: 1; height: 1px; background: #e3eaf5;
  }

  /* ── Info Grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .info-grid.two-col { grid-template-columns: repeat(2, 1fr); }
  .info-card {
    background: #f8fafd;
    border: 1px solid #e3eaf5;
    border-radius: 10px;
    padding: 14px 18px;
  }
  .info-card .label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
    color: #90a4ae; font-weight: 600; margin-bottom: 5px;
  }
  .info-card .value {
    font-size: 16px; font-weight: 700; color: #1a1a2e;
  }
  .info-card .value.highlight {
    font-size: 22px; color: #1565c0;
  }
  .info-card .value.small {
    font-size: 13px; font-weight: 500; color: #455a64;
  }

  /* ── Fuel bar ── */
  .fuel-bar-wrap { margin-top: 8px; }
  .fuel-bar-track {
    height: 8px; background: #e3eaf5; border-radius: 4px; overflow: hidden;
  }
  .fuel-bar-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, #ef5350, #ffa726, #66bb6a);
    transition: width .3s;
  }
  .fuel-bar-label { font-size: 10px; color: #90a4ae; margin-top: 4px; }

  /* ── Photos ── */
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  .photo-item {
    border-radius: 10px; overflow: hidden;
    border: 1px solid #e3eaf5;
    position: relative;
    break-inside: avoid;
  }
  .photo-item img {
    width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block;
  }
  .photo-item .photo-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(21,101,192,.85); color: #fff;
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    padding: 5px 8px; font-weight: 600;
  }

  /* ── Signature area ── */
  .signature-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    margin-top: 8px;
  }
  .signature-box {
    border: 1px dashed #b0bec5; border-radius: 10px; padding: 20px 20px 14px;
    min-height: 100px;
  }
  .signature-box .sig-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
    color: #90a4ae; font-weight: 600; margin-bottom: 10px;
  }
  .signature-box .sig-line {
    border-bottom: 1px solid #cfd8dc; margin-top: 32px; margin-bottom: 6px;
  }
  .signature-box .sig-name {
    font-size: 11px; color: #607d8b;
  }

  /* ── Footer ── */
  .report-footer {
    background: #f8fafd; border-top: 1px solid #e3eaf5;
    padding: 14px 40px; display: flex; justify-content: space-between;
    align-items: center; font-size: 11px; color: #90a4ae;
  }
  .report-footer strong { color: #607d8b; }

  /* ── Print button (hidden in print) ── */
  .print-btn-wrap {
    max-width: 860px; margin: 0 auto 16px;
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 0 4px;
  }
  .print-btn {
    padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: none; font-family: inherit;
  }
  .print-btn.primary { background: #1565c0; color: #fff; }
  .print-btn.secondary { background: #fff; color: #455a64; border: 1px solid #cdd5e0; }

  /* ── Print media ── */
  @media print {
    body { background: #fff !important; }
    .print-btn-wrap { display: none !important; }
    .report-wrapper { border-radius: 0; box-shadow: none; margin: 0; max-width: 100%; }
    .photo-grid { grid-template-columns: repeat(3, 1fr); }
    .info-grid { grid-template-columns: repeat(3, 1fr); }
    @page {
      size: A4;
      margin: 12mm 12mm 10mm;
    }
  }
`

const SLOT_LABELS = ['Frontal', 'Trasera', 'Lateral Izqu.', 'Lateral Der.', 'Interior', 'Tablero']

const fmt = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

const CheckoutReport = () => {
  const [booking, setBooking] = useState<bookcarsTypes.Booking | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('b')
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    BookingService.getBooking(id)
      .then((b) => {
        setBooking(b)
        setLoading(false)
        // auto-trigger print if ?print=1
        if (params.get('print') === '1') {
          setTimeout(() => window.print(), 800)
        }
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#607d8b' }}>
        <div>Cargando reporte…</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#e53935' }}>
        <div>No se pudo cargar la reserva.</div>
      </div>
    )
  }

  const car = booking.car as bookcarsTypes.Car
  const driver = booking.driver as bookcarsTypes.User
  const pickupLoc = booking.pickupLocation as bookcarsTypes.Location
  const dropoffLoc = booking.dropOffLocation as bookcarsTypes.Location
  const bookingId = booking._id || ''
  const docNumber = `CHK-${bookingId.slice(-8).toUpperCase()}`
  const fuelPct = Number(booking.fuelOut || 0)
  const pictures = booking.picturesOut || []
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />

      {/* Action buttons */}
      <div className="print-btn-wrap" style={{ marginTop: 24 }}>
        <button className="print-btn secondary" onClick={() => window.close()}>← Volver</button>
        <button className="print-btn primary" onClick={() => window.print()}>🖨 Imprimir / Descargar PDF</button>
      </div>

      <div className="report-wrapper">

        {/* ── Header ── */}
        <div className="report-header">
          <div>
            <div className="brand">Inspección vehicular</div>
            <div className="doc-title">Informe de Salida</div>
            <div className="doc-subtitle">Acta de entrega del vehículo al conductor</div>
          </div>
          <div className="doc-meta">
            <strong>N° de Documento</strong>
            <div className="doc-id">{docNumber}</div>
            <div style={{ marginTop: 10 }}>
              <strong>Fecha de emisión</strong>
              <div>{today}</div>
            </div>
          </div>
        </div>

        {/* ── Status ── */}
        <div className="status-banner">
          <div className="status-dot" />
          Vehículo entregado y registrado — Inspección de salida completada
        </div>

        {/* ── Body ── */}
        <div className="report-body">

          {/* Vehículo */}
          <div className="section">
            <div className="section-title">Vehículo</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="label">Nombre / Modelo</div>
                <div className="value">{car?.name || '—'}</div>
              </div>
              <div className="info-card">
                <div className="label">Placa</div>
                <div className="value">{car?.licensePlate || '—'}</div>
              </div>
              <div className="info-card">
                <div className="label">Categoría</div>
                <div className="value small">{car?.type || '—'}</div>
              </div>
            </div>
          </div>

          {/* Reserva */}
          <div className="section">
            <div className="section-title">Datos de la Reserva</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="label">Conductor</div>
                <div className="value small">{driver?.fullName || '—'}</div>
              </div>
              <div className="info-card">
                <div className="label">Recogida</div>
                <div className="value small">{fmt(booking.from)}</div>
              </div>
              <div className="info-card">
                <div className="label">Devolución</div>
                <div className="value small">{fmt(booking.to)}</div>
              </div>
              <div className="info-card">
                <div className="label">Lugar de recogida</div>
                <div className="value small">{pickupLoc?.name || '—'}</div>
              </div>
              <div className="info-card">
                <div className="label">Lugar de devolución</div>
                <div className="value small">{dropoffLoc?.name || '—'}</div>
              </div>
              <div className="info-card">
                <div className="label">ID Reserva</div>
                <div className="value small" style={{ fontFamily: 'monospace', fontSize: 11 }}>{bookingId}</div>
              </div>
            </div>
          </div>

          {/* Métricas salida */}
          <div className="section">
            <div className="section-title">Métricas de Salida</div>
            <div className="info-grid two-col">
              <div className="info-card">
                <div className="label">Kilometraje al momento de salida</div>
                <div className="value highlight">
                  {booking.kmOut !== undefined ? booking.kmOut.toLocaleString('es-PE') : '—'} km
                </div>
              </div>
              <div className="info-card">
                <div className="label">Nivel de combustible</div>
                <div className="value highlight">{fuelPct}%</div>
                <div className="fuel-bar-wrap">
                  <div className="fuel-bar-track">
                    <div className="fuel-bar-fill" style={{ width: `${fuelPct}%` }} />
                  </div>
                  <div className="fuel-bar-label">
                    {fuelPct >= 75 ? 'Tanque lleno o casi lleno' : fuelPct >= 50 ? 'A media capacidad' : fuelPct >= 25 ? 'Bajo — Recargar pronto' : 'Muy bajo'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fotografías */}
          {pictures.length > 0 && (
            <div className="section">
              <div className="section-title">Registro Fotográfico ({pictures.length} imágenes)</div>
              <div className="photo-grid">
                {pictures.map((pic, idx) => (
                  <div key={pic} className="photo-item">
                    <img
                      src={`${env.CDN_CARS}/${pic}`}
                      alt={`Foto ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div className="photo-label">{SLOT_LABELS[idx] || `Vista ${idx + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Firmas */}
          <div className="section">
            <div className="section-title">Firmas y Conformidad</div>
            <div className="signature-grid">
              <div className="signature-box">
                <div className="sig-label">Firma del Conductor</div>
                <div className="sig-line" />
                <div className="sig-name">{driver?.fullName || '...........................'}</div>
              </div>
              <div className="signature-box">
                <div className="sig-label">Firma del Representante</div>
                <div className="sig-line" />
                <div className="sig-name">Autorizado por la empresa</div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="section">
            <div className="section-title">Observaciones</div>
            <div style={{
              border: '1px dashed #b0bec5', borderRadius: 10,
              padding: '16px 20px', minHeight: 60, color: '#90a4ae',
              fontSize: 12, fontStyle: 'italic',
            }}>
              Sin observaciones adicionales registradas en este documento.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="report-footer">
          <div>
            Documento generado el <strong>{today}</strong> · Ref: <strong>{docNumber}</strong>
          </div>
          <div>
            Reserva #<strong>{bookingId.slice(-8).toUpperCase()}</strong> · Sistema de Gestión de Vehículos
          </div>
        </div>

      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

export default CheckoutReport
