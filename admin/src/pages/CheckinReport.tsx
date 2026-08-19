import React, { useEffect, useRef, useState } from 'react'
import * as BookingService from '@/services/BookingService'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'

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
    background: linear-gradient(135deg,#2e7d32,#1b5e20); color:#fff;
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
    color:#2e7d32; font-weight:700; margin-bottom:14px;
    display:flex; align-items:center; gap:8px;
  }
  .section-title::after { content:''; flex:1; height:1px; background:#e3eaf5; }
  .info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .info-grid.two-col { grid-template-columns:repeat(2,1fr); }
  .info-card { background:#f8fafd; border:1px solid #e3eaf5; border-radius:10px; padding:14px 18px; }
  .info-card .label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#90a4ae; font-weight:600; margin-bottom:5px; }
  .info-card .value { font-size:16px; font-weight:700; color:#1a1a2e; }
  .info-card .value.highlight { font-size:22px; color:#2e7d32; }
  .photo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
  .photo-item { border-radius:10px; overflow:hidden; border:1px solid #e3eaf5; position:relative; break-inside:avoid; }
  .photo-item img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .photo-item .photo-label {
    position:absolute; bottom:0; left:0; right:0;
    background:rgba(46,125,50,.85); color:#fff;
    font-size:10px; letter-spacing:1px; text-transform:uppercase; padding:5px 8px; font-weight:600;
  }
  .signature-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:8px; }
  .sig-wrap { border:1px dashed #b0bec5; border-radius:10px; padding:14px 16px 12px; }
  .sig-label-title { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#90a4ae; font-weight:600; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; }
  .sig-canvas-container { position:relative; background:#fafcff; border-radius:6px; border:1px solid #e3eaf5; cursor:crosshair; overflow:hidden; }
  .sig-actions { display:flex; gap:6px; margin-top:8px; align-items:center; }
  .sig-btn { border:none; border-radius:5px; font-size:11px; font-weight:600; padding:5px 12px; cursor:pointer; font-family:inherit; }
  @page { size: A4; margin: 0mm; }
  @media print {
    body { background: #fff !important; margin: 0 !important; }
    .no-print { display:none !important; }
    .report-wrapper { border-radius: 0; box-shadow: none; margin: 0 !important; padding: 15mm !important; width: 100% !important; }
  }
  .print-btn-wrap { max-width:860px; margin:24px auto 16px; display:flex; justify-content:flex-end; gap:10px; }
  .print-btn { padding:10px 24px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; }
  .print-btn.primary { background:#2e7d32; color:#fff; }
  .print-btn.secondary { background:#fff; color:#455a64; border:1px solid #cdd5e0; }
`

const SignaturePad = ({ label, signerName, initialDataUrl, onSave }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isEmpty, setIsEmpty] = useState(!initialDataUrl)
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
    const drawing = useRef(false)
    const lastPos = useRef<{ x: number, y: number } | null>(null)

    useEffect(() => {
        if (!initialDataUrl) {
            return
        }
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = initialDataUrl
        setIsEmpty(false)
    }, [initialDataUrl])

    const startDraw = (e: any) => {
        drawing.current = true
        const rect = canvasRef.current!.getBoundingClientRect()
        lastPos.current = { x: (e.clientX || e.touches[0].clientX) - rect.left, y: (e.clientY || e.touches[0].clientY) - rect.top }
        setIsEmpty(false)
    }

    const draw = (e: any) => {
        if (!drawing.current) {
            return
        }
        const ctx = canvasRef.current!.getContext('2d')!
        const rect = canvasRef.current!.getBoundingClientRect()
        const cur = { x: (e.clientX || e.touches[0].clientX) - rect.left, y: (e.clientY || e.touches[0].clientY) - rect.top }
        ctx.beginPath()
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y)
        ctx.lineTo(cur.x, cur.y)
        ctx.strokeStyle = '#1a1a2e'
        ctx.lineWidth = 2
        ctx.stroke()
        lastPos.current = cur
    }

    const stopDraw = async () => {
        if (!drawing.current) {
            return
        }
        drawing.current = false
        setStatus('saving')
        const dataUrl = canvasRef.current!.toDataURL()
        await onSave(dataUrl)
        setStatus('saved')
    }

    return (
        <div className="sig-wrap">
            <div className="sig-label-title">
                <span>{label}</span>
                {status === 'saving' && <span className="no-print">Guardando...</span>}
                {status === 'saved' && <span className="no-print">✓</span>}
            </div>
            <div className="sig-canvas-container" style={{ height: 120 }}>
                <canvas ref={canvasRef} width={360} height={120} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} style={{ width: '100%' }} />
                {isEmpty && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#ccc' }}>Firme aquí</div>}
            </div>
            {signerName && <div style={{ fontSize: 11, marginTop: 8 }}>{signerName}</div>}
        </div>
    )
}

const CheckinReport = () => {
    const [booking, setBooking] = useState<bookcarsTypes.Booking | null>(null)
    const [bookingId, setBookingId] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const id = params.get('b')
        if (id) {
            setBookingId(id)
            BookingService.getBooking(id).then((b) => {
                setBooking(b)
                setLoading(false)
            })
        }
    }, [])

    if (loading || !booking) {
        return <div style={{ textAlign: 'center', marginTop: 100 }}>Cargando reporte...</div>
    }

    const car = booking.car as bookcarsTypes.Car
    const driver = booking.driver as bookcarsTypes.User
    const fuelPct = Number(booking.fuelIn || 0)
    const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />
            <div className="print-btn-wrap no-print" style={{ marginTop: 24 }}>
                <button className="print-btn secondary" onClick={() => window.close()}>← Volver</button>
                <button className="print-btn primary" onClick={() => window.print()}>🖨 Imprimir / PDF</button>
            </div>

            <div className="report-wrapper">
                <div className="report-header">
                    <div>
                        <div className="brand">Inspección vehicular</div>
                        <div className="doc-title">Informe de Entrada</div>
                        <div className="doc-subtitle">Acta de recepción del vehículo</div>
                    </div>
                </div>

                <div className="status-banner">
                    <div className="status-dot" /> Vehículo recibido y registrado — Inspección de entrada completada
                </div>

                <div className="report-body">
                    <div className="section">
                        <div className="section-title">Vehículo</div>
                        <div className="info-grid">
                            <div className="info-card"><div className="label">Modelo</div><div className="value">{car?.name}</div></div>
                            <div className="info-card"><div className="label">Placa</div><div className="value">{car?.licensePlate}</div></div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">Datos de Entrega</div>
                        <div className="info-grid two-col">
                            <div className="info-card">
                                <div className="label">Kilometraje al momento de entrada</div>
                                <div className="value highlight">{booking.kmIn?.toLocaleString()} km</div>
                            </div>
                            <div className="info-card">
                                <div className="label">Nivel de combustible</div>
                                <div className="value highlight">{fuelPct}%</div>
                            </div>
                        </div>
                    </div>

                    {booking.picturesIn && booking.picturesIn.length > 0 && (
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
                                    booking.picturesIn.forEach((p) => {
                                        if (p.includes('|')) {
                                            const [field, file] = p.split('|')
                                            slotMap[field] = file
                                        }
                                    })

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

                    <div className="section">
                        <div className="section-title">Firmas Digitales</div>
                        <div className="signature-grid">
                            <SignaturePad label="Firma del Conductor" signerName={driver?.fullName} initialDataUrl={booking.signatureDriverIn} onSave={(d: string) => BookingService.saveSignatures(bookingId, { signatureDriverIn: d })} />
                            <SignaturePad label="Firma del Representante" signerName="Autorizado" initialDataUrl={booking.signatureRepIn} onSave={(d: string) => BookingService.saveSignatures(bookingId, { signatureRepIn: d })} />
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">Observaciones de Entrada</div>
                        <div style={{ padding: 16, border: '1px dashed #ccc', borderRadius: 8 }}>{booking.remarksIn || 'Sin observaciones.'}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CheckinReport
