import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as BookingService from '@/services/BookingService'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import html2pdf from 'html2pdf.js'

// ─── Print CSS ───────────────────────────────────────────────────────────────
const PRINT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter','Segoe UI',Arial,sans-serif;
    background: #f0f2f5; color: #1a1a2e;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .report-wrapper {
    max-width: 860px; margin: 32px auto; background: #fff;
    border-radius: 12px; box-shadow: 0 4px 32px rgba(0,0,0,.12); overflow: hidden;
  }
  .report-header {
    background: linear-gradient(135deg,#1565c0,#0d47a1); color:#fff;
    padding:32px 40px 28px; display:flex; justify-content:space-between; align-items:flex-start;
  }
  .report-header .brand { font-size:11px; letter-spacing:3px; text-transform:uppercase; opacity:.7; margin-bottom:6px; }
  .report-header .doc-title { font-size:26px; font-weight:700; letter-spacing:-0.5px; }
  .report-header .doc-subtitle { font-size:13px; opacity:.8; margin-top:4px; }
  .report-header .doc-meta { text-align:right; font-size:13px; }
  .report-header .doc-meta strong { display:block; font-size:11px; opacity:.7; letter-spacing:1px; text-transform:uppercase; margin-bottom:2px; }
  .report-header .doc-meta .doc-id { font-size:15px; font-weight:600; font-family:monospace; letter-spacing:1px; }
  .status-banner {
    background:#e8f5e9; border-bottom:1px solid #c8e6c9; padding:10px 40px;
    display:flex; align-items:center; gap:10px; font-size:13px; color:#2e7d32; font-weight:600;
  }
  .status-dot { width:10px; height:10px; border-radius:50%; background:#43a047; flex-shrink:0; }
  .report-body { padding:36px 40px; }
  .section { margin-bottom:30px; }
  .section-title {
    font-size:11px; text-transform:uppercase; letter-spacing:2px;
    color:#1565c0; font-weight:700; margin-bottom:14px;
    display:flex; align-items:center; gap:8px;
  }
  .section-title::after { content:''; flex:1; height:1px; background:#e3eaf5; }
  .info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .info-grid.two-col { grid-template-columns:repeat(2,1fr); }
  .info-card { background:#f8fafd; border:1px solid #e3eaf5; border-radius:10px; padding:14px 18px; }
  .info-card .label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#90a4ae; font-weight:600; margin-bottom:5px; }
  .info-card .value { font-size:16px; font-weight:700; color:#1a1a2e; }
  .info-card .value.highlight { font-size:22px; color:#1565c0; }
  .info-card .value.small { font-size:13px; font-weight:500; color:#455a64; }
  .fuel-bar-wrap { margin-top:8px; }
  .fuel-bar-track { height:8px; background:#e3eaf5; border-radius:4px; overflow:hidden; }
  .fuel-bar-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,#ef5350,#ffa726,#66bb6a); }
  .fuel-bar-label { font-size:10px; color:#90a4ae; margin-top:4px; }
  .photo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
  .photo-item { border-radius:10px; overflow:hidden; border:1px solid #e3eaf5; position:relative; break-inside:avoid; }
  .photo-item img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .photo-item .photo-label {
    position:absolute; bottom:0; left:0; right:0;
    background:rgba(21,101,192,.85); color:#fff;
    font-size:10px; letter-spacing:1px; text-transform:uppercase; padding:5px 8px; font-weight:600;
  }
  .signature-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:8px; }
  .sig-wrap { border:1px dashed #b0bec5; border-radius:10px; padding:14px 16px 12px; }
  .sig-label-title { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#90a4ae; font-weight:600; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; }
  .sig-canvas-container { position:relative; background:#fafcff; border-radius:6px; border:1px solid #e3eaf5; cursor:crosshair; overflow:hidden; }
  .sig-canvas { display:block; width:100%; touch-action:none; }
  .sig-actions { display:flex; gap:6px; margin-top:8px; align-items:center; }
  .sig-btn { border:none; border-radius:5px; font-size:11px; font-weight:600; padding:5px 12px; cursor:pointer; font-family:inherit; }
  .sig-name-label { font-size:11px; color:#607d8b; margin-top:6px; border-top:1px solid #e3eaf5; padding-top:6px; }
  .saving-indicator { font-size:11px; color:#90a4ae; }
  .saved-indicator { font-size:11px; color:#43a047; }
    @page {
      size: A4;
      margin: 0mm; /* Disables default browser headers/footers */
    }
    body {
      margin: 0;
      padding: 0;
      background: #f0f2f5;
    }
    @media print {
      body {
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print { display:none !important; }
      .report-wrapper {
        border-radius: 0;
        box-shadow: none;
        margin: 0 !important;
        padding: 15mm !important; /* Internal padding for the paper */
        max-width: 100% !important;
        width: 100% !important;
      }
      .photo-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .info-grid { grid-template-columns: repeat(3, 1fr); }
      .sig-canvas-container { border: 1px solid #cfd8dc; background: #fff; }
      .sig-wrap { border: 1px solid #b0bec5; }
    }
  .print-btn-wrap { max-width:860px; margin:0 auto 16px; display:flex; justify-content:flex-end; gap:10px; padding:0 4px; }
  .print-btn { padding:10px 24px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; font-family:inherit; }
  .print-btn.primary { background:#1565c0; color:#fff; }
  .print-btn.secondary { background:#fff; color:#455a64; border:1px solid #cdd5e0; }
`


const fmt = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

// ─── Signature Pad ───────────────────────────────────────────────────────────
type SigStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SignaturePadProps {
  label: string
  signerName?: string
  initialDataUrl?: string
  onSave: (dataUrl: string) => Promise<void>
}

const SignaturePad = ({ label, signerName, initialDataUrl, onSave }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isEmpty, setIsEmpty] = useState(!initialDataUrl)
  const [status, setStatus] = useState<SigStatus>('idle')

  const getDPR = () => window.devicePixelRatio || 1

  // Draw initial signature from DB
  useEffect(() => {
    if (!initialDataUrl) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const dpr = getDPR()
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
    img.src = initialDataUrl
    setIsEmpty(false)
  }, [initialDataUrl])

  const ensureCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const dpr = getDPR()
    const rect = canvas.getBoundingClientRect()
    const targetW = Math.round(rect.width * dpr)
    const targetH = Math.round(rect.height * dpr)
    if (canvas.width !== targetW || canvas.height !== targetH) {
      const snapshot = canvas.toDataURL()
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = snapshot
    }
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    ensureCanvasSize()
    drawing.current = true
    lastPos.current = getPos(e)
    setIsEmpty(false)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!drawing.current || !lastPos.current) {
      return
    }
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const cur = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(cur.x, cur.y)
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = cur
  }

  const stopDraw = () => {
    drawing.current = false
    lastPos.current = null
    // Debounced auto-save 800ms after pen lifts
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }
    saveTimer.current = setTimeout(async () => {
      const canvas = canvasRef.current
      if (!canvas || isEmpty) {
        return
      }
      const dataUrl = canvas.toDataURL('image/png')
      setStatus('saving')
      try {
        await onSave(dataUrl)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, 800)
  }

  const clearPad = () => {
    const canvas = canvasRef.current!
    const dpr = getDPR()
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setIsEmpty(true)
    setStatus('idle')
  }

  return (
    <div className="sig-wrap">
      <div className="sig-label-title">
        <span>{label}</span>
        {status === 'saving' && <span className="saving-indicator no-print">Guardando…</span>}
        {status === 'saved' && <span className="saved-indicator no-print">✓ Guardado</span>}
        {status === 'error' && <span style={{ fontSize: 11, color: '#e53935' }} className="no-print">Error al guardar</span>}
      </div>
      <div className="sig-canvas-container" style={{ height: 130 }}>
        <canvas
          ref={canvasRef}
          className="sig-canvas"
          style={{ height: 130 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#b0bec5', fontSize: 12 }}>✍ Firme aquí con el ratón, dedo o lápiz digital</span>
          </div>
        )}
      </div>
      <div className="sig-actions no-print">
        <button
          className="sig-btn"
          style={{ background: '#ffebee', color: '#c62828' }}
          onClick={clearPad}
          type="button"
        >
          ✕ Borrar
        </button>
        {!isEmpty && status === 'idle' && (
          <span style={{ fontSize: 11, color: '#78909c' }}>Levante el lápiz para guardar</span>
        )}
      </div>
      {signerName && <div className="sig-name-label">{signerName}</div>}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const CheckoutReport = () => {
  const [booking, setBooking] = useState<bookcarsTypes.Booking | null>(null)
  const [bookingId, setBookingId] = useState('')
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
    setBookingId(id)
    BookingService.getBooking(id)
      .then((b) => {
        setBooking(b)
        setLoading(false)
        if (params.get('print') === '1') {
          setTimeout(() => window.print(), 800)
        }
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const handleSaveDriver = useCallback(async (dataUrl: string) => {
    await BookingService.saveSignatures(bookingId, { signatureDriver: dataUrl })
  }, [bookingId])

  const handleSaveRep = useCallback(async (dataUrl: string) => {
    await BookingService.saveSignatures(bookingId, { signatureRep: dataUrl })
  }, [bookingId])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#607d8b' }}>
        Cargando reporte…
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#e53935' }}>
        No se pudo cargar la reserva.
      </div>
    )
  }

  const car = booking.car as bookcarsTypes.Car
  const driver = booking.driver as bookcarsTypes.User
  const pickupLoc = booking.pickupLocation as bookcarsTypes.Location
  const dropoffLoc = booking.dropOffLocation as bookcarsTypes.Location
  const docNumber = `CHK-${bookingId.slice(-8).toUpperCase()}`
  const fuelPct = Number(booking.fuelOut || 0)
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />

      <div className="print-btn-wrap no-print" style={{ marginTop: 24 }}>
        <button className="print-btn secondary" type="button" onClick={() => window.close()}>← Volver</button>
        <button className="print-btn primary" type="button" onClick={() => window.print()}>🖨 Imprimir</button>
        <button
          className="print-btn primary"
          type="button"
          style={{ background: '#2e7d32' }}
          onClick={() => {
            const element = document.querySelector('.report-wrapper') as HTMLElement
            if (!element) {
              return
            }
            const opt = {
              margin: 10,
              filename: `inspeccion_salida_${bookingId.slice(-6)}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, logging: false },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }
            html2pdf().set(opt as any).from(element).save()
          }}
        >
          📄 Descargar PDF
        </button>
      </div>

      <div className="report-wrapper">

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

        <div className="status-banner">
          <div className="status-dot" />
          Vehículo entregado y registrado — Inspección de salida completada
        </div>

        <div className="report-body">

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

          {booking.picturesOut && booking.picturesOut.length > 0 && (
            <div className="section">
              <div className="section-title">Registro Fotográfico</div>
              <div className="photo-grid">
                {(() => {
                  const slots = [
                    { key: 'photo_0', label: 'Frontal' },
                    { key: 'photo_1', label: 'Trasera' },
                    { key: 'photo_2', label: 'Lateral Izqu.' },
                    { key: 'photo_3', label: 'Lateral Der.' },
                    { key: 'photo_4', label: 'Interior' },
                    { key: 'photo_5', label: 'Tablero' },
                    { key: 'photo_km', label: 'Tablero (Km)' },
                  ]

                  const slotMap: Record<string, string> = {}
                  booking.picturesOut.forEach((p) => {
                    if (p.includes('|')) {
                      const [field, file] = p.split('|')
                      slotMap[field] = file
                    } else {
                      // Legacy support: just use as the next available slot
                    }
                  })

                  // If it's legacy (no pipes), we just show them in order
                  const isLegacy = !booking.picturesOut.some(p => p.includes('|'))
                  if (isLegacy) {
                    return booking.picturesOut.map((pic, idx) => (
                      <div key={pic} className="photo-item">
                        <img src={`${env.CDN_CARS}/${pic}`} alt="Foto" />
                        <div className="photo-label">{idx === 0 ? 'Tablero (Km)' : ['Frontal', 'Trasera', 'Lateral Izqu.', 'Lateral Der.', 'Interior', 'Tablero'][idx - 1] || 'Vista'}</div>
                      </div>
                    ))
                  }

                  return slots.map((s) => {
                    const filename = slotMap[s.key]
                    if (!filename) {
                      return null
                    }
                    return (
                      <div key={s.key} className="photo-item">
                        <img
                          src={`${env.CDN_CARS}/${filename}`}
                          alt={s.label}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="photo-label">{s.label}</div>
                      </div>
                    )
                  }).filter(Boolean)
                })()}
              </div>
            </div>
          )}

          {/* ── Firmas digitales ── */}
          <div className="section">
            <div className="section-title">Firmas Digitales y Conformidad</div>
            <div className="signature-grid">
              <SignaturePad
                label="Firma del Conductor"
                signerName={driver?.fullName}
                initialDataUrl={booking.signatureDriver}
                onSave={handleSaveDriver}
              />
              <SignaturePad
                label="Firma del Representante"
                signerName="Autorizado por la empresa"
                initialDataUrl={booking.signatureRep}
                onSave={handleSaveRep}
              />
            </div>
            <p
              className="no-print"
              style={{ fontSize: 11, color: '#90a4ae', marginTop: 10, textAlign: 'center' }}
            >
              ✍ La firma se guarda automáticamente al levantar el lápiz o soltar el botón del ratón
            </p>
          </div>

          <div className="section">
            <div className="section-title">Observaciones</div>
            <div
              contentEditable
              suppressContentEditableWarning
              style={{
                border: '1px dashed #b0bec5', borderRadius: 10,
                padding: '16px 20px', minHeight: 60, color: '#455a64',
                fontSize: 12, outline: 'none', lineHeight: 1.6,
                background: booking.remarksOut ? '#fff3e0' : 'transparent',
              }}
            >
              {booking.remarksOut || 'Sin observaciones adicionales.'}
            </div>
          </div>

        </div>

        <div className="report-footer">
          <div>Documento generado el <strong>{today}</strong> · Ref: <strong>{docNumber}</strong></div>
          <div>Reserva #<strong>{bookingId.slice(-8).toUpperCase()}</strong> · Sistema de Gestión de Vehículos</div>
        </div>

      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

export default CheckoutReport
