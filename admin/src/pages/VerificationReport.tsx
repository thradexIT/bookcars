import React, { useEffect, useState } from 'react'
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
    background: linear-gradient(135deg,#1565c0,#0d47a1); color:#fff;
    padding:32px 40px 28px; display:flex; justify-content:space-between; align-items:flex-start;
  }
  .report-header .brand { font-size:11px; letter-spacing:3px; text-transform:uppercase; opacity:.7; margin-bottom:6px; }
  .report-header .doc-title { font-size:26px; font-weight:700; letter-spacing:-0.5px; }
  .report-header .doc-subtitle { font-size:13px; opacity:.8; margin-top:4px; }
  
  .status-banner {
    background: #e3f2fd; border-bottom: 1px solid #bbdefb; padding: 10px 40px;
    display: flex; align-items: center; gap: 10px; font-size: 13px; color: #1565C0; font-weight: 600;
  }
  .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #1565C0; flex-shrink: 0; }

  .report-body { padding: 36px 40px; }
  .section { margin-bottom: 30px; }
  .section-title {
    font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
    color: #1565C0; font-weight: 700; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #e3eaf5; }

  .comparison-row {
    border: 1px solid #e3eaf5; border-radius: 12px; margin-bottom: 24px; overflow: hidden;
    break-inside: avoid;
  }
  .comparison-header {
    background: #f8fafd; padding: 12px 20px; border-bottom: 1px solid #e3eaf5;
    display: flex; justify-content: space-between; align-items: center;
  }
  .step-label { font-weight: 700; color: #1a1a2e; }
  .step-status { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; }
  .step-status.ok { background: #e8f5e9; color: #2e7d32; }
  .step-status.fail { background: #ffebee; color: #c62828; }

  .comparison-images { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e3eaf5; }
  .image-box { background: #fff; padding: 10px; text-align: center; }
  .image-box img { width: 100%; aspect-ratio: 4/3; object-fit: contain; background: #f0f2f5; border-radius: 4px; }
  .image-label { font-size: 10px; color: #90a4ae; text-transform: uppercase; margin-top: 6px; font-weight: 600; }

  .step-remarks { padding: 14px 20px; background: #fff; font-size: 13px; line-height: 1.5; color: #455a64; border-top: 1px solid #f0f2f5; }
  .step-remarks strong { color: #1a1a2e; }

  .audit-summary {
    background: #f8fafd; border: 1px solid #e3eaf5; border-radius: 10px; padding: 20px;
  }
  .summary-item { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 14px; font-weight: 600; }
  .summary-item i { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-style: normal; }
  .summary-item.checked i { background: #2e7d32; color: #fff; }
  .summary-item.unchecked i { background: #cfd8dc; color: #fff; }

  @page { size: A4; margin: 0mm; }
  @media print {
    body { background: #fff !important; margin: 0 !important; }
    .no-print { display:none !important; }
    .report-wrapper { border-radius: 0; box-shadow: none; margin: 0 !important; padding: 15mm !important; width: 100% !important; }
  }
  .print-btn-wrap { max-width: 860px; margin: 24px auto 16px; display: flex; justify-content: flex-end; gap: 10px; }
  .print-btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
  .print-btn.primary { background: #1565C0; color: #fff; }
  .print-btn.secondary { background: #fff; color: #455a64; border: 1px solid #cdd5e0; }

  .info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom: 20px;}
  .info-card { background:#f8fafd; border:1px solid #e3eaf5; border-radius:10px; padding:14px 18px; }
  .info-card .label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#90a4ae; font-weight:600; margin-bottom:5px; }
  .info-card .value { font-size:16px; font-weight:700; color:#1a1a2e; }
`

const VerificationReport = () => {
    const [booking, setBooking] = useState<bookcarsTypes.Booking | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const id = params.get('b')
        if (id) {
            BookingService.getBooking(id).then((b) => {
                setBooking(b)
                setLoading(false)
            })
        }
    }, [])

    if (loading || !booking) {
        return <div style={{ textAlign: 'center', marginTop: 100 }}>Cargando reporte de auditoría...</div>
    }

    const slots = [
        { key: 'photo_0', label: 'Frontal' },
        { key: 'photo_1', label: 'Trasera' },
        { key: 'photo_2', label: 'Lateral Izquierda' },
        { key: 'photo_3', label: 'Lateral Derecha' },
        { key: 'photo_4', label: 'Interior' },
        { key: 'photo_5', label: 'Tablero' },
        { key: 'photo_km', label: 'Odómetro' },
    ]

    const outMap: Record<string, string> = {}
    booking.picturesOut?.forEach((p) => {
        if (p.includes('|')) {
            const [f, file] = p.split('|')
            outMap[f] = file
        }
    })
    const inMap: Record<string, string> = {}
    booking.picturesIn?.forEach((p) => {
        if (p.includes('|')) {
            const [f, file] = p.split('|')
            inMap[f] = file
        }
    })

    // Extract per-step remarks from verificationRemarks if possible, 
    // but we saved them in a consolidated string like "LABEL: [STATUS] REMARK\n"
    const remarksLines = (booking.verificationRemarks || '').split('\n')
    const stepData: Record<string, { status: string, obs: string }> = {}

    remarksLines.forEach(line => {
        const match = line.match(/^([^:]+):\s*\[([^\]]+)\]\s*(.*)$/)
        if (match) {
            const label = match[1].toLowerCase()
            stepData[label] = {
                status: match[2],
                obs: match[3]
            }
        }
    })

    const car = booking.car as bookcarsTypes.Car
    const driver = booking.driver as bookcarsTypes.User

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />
            <div className="print-btn-wrap no-print">
                <button className="print-btn secondary" onClick={() => window.close()}>← Volver</button>
                <button className="print-btn primary" onClick={() => window.print()}>🖨 Imprimir / PDF</button>
            </div>

            <div className="report-wrapper">
                <div className="report-header">
                    <div>
                        <div className="brand">Control de Calidad</div>
                        <div className="doc-title">Informe de Auditoría de Inspección</div>
                        <div className="doc-subtitle">Verificación comparativa de salida/entrada</div>
                    </div>
                </div>

                <div className="status-banner">
                    <div className="status-dot" /> Auditoría completada — Estado de validación final registrado
                </div>

                <div className="report-body">
                    <div className="section">
                        <div className="section-title">Información General</div>
                        <div className="info-grid">
                            <div className="info-card"><div className="label">Vehículo</div><div className="value">{car?.name} ({car?.licensePlate})</div></div>
                            <div className="info-card"><div className="label">Conductor</div><div className="value">{driver?.fullName}</div></div>
                        </div>
                        
                        <div className="audit-summary">
                            <div className={`summary-item ${booking.picturesOutVerified ? 'checked' : 'unchecked'}`}>
                                <i>{booking.picturesOutVerified ? '✓' : ''}</i>
                                Fotos de Salida validadas por Auditoría
                            </div>
                            <div className={`summary-item ${booking.picturesInVerified ? 'checked' : 'unchecked'}`}>
                                <i>{booking.picturesInVerified ? '✓' : ''}</i>
                                Fotos de Ingreso validadas por Auditoría
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">Detalle de Auditoría Foto a Foto</div>
                        {slots.map((slot) => {
                            const outImg = outMap[slot.key]
                            const inImg = inMap[slot.key]
                            if (!outImg && !inImg) {
                                return null
                            }

                            const labelKey = slot.label.toLowerCase()
                            const audit = stepData[labelKey] || { status: 'OK', obs: '' }
                            const isFail = audit.status === 'INCORRECTO'

                            return (
                                <div key={slot.key} className="comparison-row">
                                    <div className="comparison-header">
                                        <div className="step-label">{slot.label}</div>
                                        <div className={`step-status ${isFail ? 'fail' : 'ok'}`}>
                                            {isFail ? '⚠️ Incorrecto' : '✓ Validado'}
                                        </div>
                                    </div>
                                    <div className="comparison-images">
                                        <div className="image-box">
                                            {outImg ? <img src={`${env.CDN_CARS}/${outImg}`} alt="Salida" /> : <div style={{ height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>Sin foto de salida</div>}
                                            <div className="image-label">Salida</div>
                                        </div>
                                        <div className="image-box">
                                            {inImg ? <img src={`${env.CDN_CARS}/${inImg}`} alt="Entrada" /> : <div style={{ height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>Sin foto de entrada</div>}
                                            <div className="image-label">Entrada</div>
                                        </div>
                                    </div>
                                    <div className="step-remarks">
                                        <strong>Observación auditoría:</strong> {audit.obs || 'Sin observaciones específicas para este punto.'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="section">
                        <div className="section-title">Resumen Global del Auditor</div>
                        <div style={{ padding: 20, border: '1px dashed #bbdefb', borderRadius: 8, background: '#f8fafd' }}>
                            {(() => {
                                const parts = (booking.verificationRemarks || '').split('\nRESUMEN GLOBAL: ')
                                return parts.length > 1 ? parts[1] : 'No se incluyó un resumen global adicional.'
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VerificationReport
