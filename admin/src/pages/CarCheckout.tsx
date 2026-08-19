import React, { useState } from 'react'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import * as BookingService from '@/services/BookingService'
import * as helper from '@/utils/helper'
import * as bookcarsTypes from ':bookcars-types'
import ValidatedCamera from '@/components/ValidatedCamera'

import frontImg from '@/assets/img/front.png'
import rearImg from '@/assets/img/rear.png'
import leftImg from '@/assets/img/left.png'
import rightImg from '@/assets/img/right.png'
import interiorImg from '@/assets/img/interior1.png'
import dashboardImg from '@/assets/img/interior2.webp'

// ─── CONFIGURABLE ────────────────────────────────────────────────────
const CAROUSEL_SLOTS: { label: string; refImg: string; hint: string }[] = [
    { label: 'Frontal', refImg: frontImg, hint: 'Frente del vehículo completo' },
    { label: 'Trasera', refImg: rearImg, hint: 'Parte trasera completa' },
    { label: 'Lateral Izqu.', refImg: leftImg, hint: 'Lado izquierdo completo' },
    { label: 'Lateral Der.', refImg: rightImg, hint: 'Lado derecho completo' },
    { label: 'Interior', refImg: interiorImg, hint: 'Asientos y habitáculo' },
    { label: 'Tablero', refImg: dashboardImg, hint: 'Tablero del vehículo' },
]

const STEPS = ['Niveles y Km', 'Fotos', 'Confirmación']

// ── Slot individual del carrusel ──────────────────────────────────────
const CarouselSlot = ({
    slot,
    index,
    file,
    onChange,
}: {
    slot: typeof CAROUSEL_SLOTS[0]
    index: number
    file: File | null
    onChange: (i: number, f: File | null) => void
}) => {
    const [cameraOpen, setCameraOpen] = useState(false)
    const [viewerOpen, setViewerOpen] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const preview = file ? URL.createObjectURL(file) : null
    const hasCameraSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 4px' }}>
            <ValidatedCamera
                open={cameraOpen}
                onClose={() => setCameraOpen(false)}
                onCapture={(f) => onChange(index, f)}
                label={`Capturar ${slot.label}`}
                silhouetteImg={slot.refImg}
                expectedType={slot.label.toLowerCase().includes('tablero') ? 'dashboard' : 'car'}
            />
            
            {viewerOpen && (
                <div
                    onClick={() => setViewerOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
                        padding: 20, boxSizing: 'border-box'
                    }}
                >
                    <img src={slot.refImg} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Referencia Completa" />
                    <div style={{ position: 'absolute', top: 20, right: 30, color: '#fff', fontSize: 24, fontWeight: 'bold' }}>✕</div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#424242', letterSpacing: .3 }}>{slot.label}</span>
                <span style={{ fontSize: 11, color: '#9e9e9e' }}>{slot.hint}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div
                    onClick={() => setViewerOpen(true)}
                    style={{
                        borderRadius: 10, overflow: 'hidden', background: '#f0f4fa',
                        border: '1.5px solid #e3eaf5', position: 'relative',
                        aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-in', transition: 'all 0.2s', width: '100%', height: 'auto'
                    }}
                >
                    <img
                        src={slot.refImg}
                        alt={`ref-${slot.label}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                        color: '#fff', fontSize: 11, borderRadius: 12, padding: '4px 8px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        <span>🔍</span> Ampliar
                    </div>
                </div>

                <div 
                    onClick={() => hasCameraSupport ? setCameraOpen(true) : fileInputRef.current?.click()}
                    style={{
                        borderRadius: 10, overflow: 'hidden', border: `2px dashed ${preview ? '#1976d2' : '#bdbdbd'}`,
                        aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: preview ? '#e3f2fd' : '#fafafa', cursor: 'pointer', position: 'relative',
                        transition: 'all .2s', width: '100%', height: 'auto'
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                                onChange(index, f)
                            }
                        }}
                    />
                    {preview ? (
                        <>
                            <img src={preview} alt={`taken-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span style={{
                                position: 'absolute', top: 8, right: 8, background: '#388e3c',
                                color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
                            }}>✓ CAPTURADA</span>
                            <button
                                onClick={e => {
                                    e.stopPropagation(); onChange(index, null)
                                }}
                                style={{
                                    position: 'absolute', bottom: 8, right: 8, background: '#d32f2f',
                                    color: '#fff', border: 'none', borderRadius: 20, fontSize: 10,
                                    padding: '4px 10px', cursor: 'pointer', fontWeight: 600,
                                }}
                            >✕ Quitar</button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 30 }}>{hasCameraSupport ? '📷' : '📁'}</span>
                            <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>
                                {hasCameraSupport ? 'Capturar con IA' : 'Subir fotografía'}
                            </span>
                            <span style={{ fontSize: 11, color: '#bdbdbd' }}>
                                {hasCameraSupport ? 'Toca para abrir cámara' : 'Toca para seleccionar archivo'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const PhotoCarousel = ({
    files,
    onChange,
}: {
    files: (File | null)[]
    onChange: (i: number, f: File | null) => void
}) => {
    const [active, setActive] = useState(0)
    const total = CAROUSEL_SLOTS.length
    const filled = files.filter(Boolean).length

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Fotos del vehículo
                </span>
                <span style={{ fontSize: 12, color: filled === total ? '#388e3c' : '#f57c00', fontWeight: 600 }}>
                    {filled}/{total} {filled === total ? '✓' : 'pendientes'}
                </span>
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                {CAROUSEL_SLOTS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        style={{
                            width: i === active ? 24 : 8, height: 8, borderRadius: 4,
                            background: files[i] ? '#388e3c' : i === active ? '#1976d2' : '#e0e0e0',
                            border: 'none', cursor: 'pointer', transition: 'all .25s', padding: 0,
                        }}
                    />
                ))}
            </div>

            <CarouselSlot
                slot={CAROUSEL_SLOTS[active]}
                index={active}
                file={files[active]}
                onChange={onChange}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                    onClick={() => setActive(a => Math.max(0, a - 1))}
                    disabled={active === 0}
                    style={{
                        flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #e0e0e0',
                        background: active === 0 ? '#f5f5f5' : '#fff', color: active === 0 ? '#bdbdbd' : '#424242',
                        fontSize: 14, fontWeight: 600, cursor: active === 0 ? 'default' : 'pointer',
                    }}
                >← Anterior</button>
                <button
                    onClick={() => setActive(a => Math.min(total - 1, a + 1))}
                    disabled={active === total - 1}
                    style={{
                        flex: 1, padding: '11px 0', borderRadius: 8, border: 'none',
                        background: active === total - 1 ? '#e3f2fd' : '#1976d2',
                        color: active === total - 1 ? '#90caf9' : '#fff',
                        fontSize: 14, fontWeight: 600, cursor: active === total - 1 ? 'default' : 'pointer',
                    }}
                >Siguiente →</button>
            </div>
        </div>
    )
}

const KmSlot = ({
    mileage,
    onMileageChange,
    file,
    onFileChange,
}: {
    mileage: string
    onMileageChange: (v: string) => void
    file: File | null
    onFileChange: (f: File | null) => void
}) => {
    const [cameraOpen, setCameraOpen] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const preview = file ? URL.createObjectURL(file) : null
    const hasCameraSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    return (
        <div style={{
            border: '1.5px solid #e3eaf5', borderRadius: 12, padding: 20,
            background: '#f8faff', marginBottom: 20,
        }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1976d2', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                Tablero — Kilometraje de Salida
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#757575', display: 'block', marginBottom: 8 }}>
                        Kilometraje (numérico) *
                    </label>
                    <input
                        type="number"
                        placeholder="Ej. 15000"
                        value={mileage}
                        onChange={e => onMileageChange(e.target.value)}
                        style={{
                            width: '100%', padding: '16px 14px', border: '1px solid #e0e0e0',
                            borderRadius: 8, fontSize: 20, fontWeight: 700, color: '#1976d2',
                            boxSizing: 'border-box', background: '#fff', outline: 'none',
                        }}
                    />
                </div>

                <div 
                    onClick={() => hasCameraSupport ? setCameraOpen(true) : fileInputRef.current?.click()}
                    style={{
                        display: 'flex', borderRadius: 10, overflow: 'hidden',
                        border: `2px dashed ${preview ? '#1976d2' : '#bdbdbd'}`,
                        aspectRatio: '16/9', cursor: 'pointer', position: 'relative',
                        background: preview ? '#e3f2fd' : '#fafafa', transition: 'all .2s',
                        alignItems: 'center', justifyContent: 'center', width: '100%', height: 'auto'
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                                onFileChange(f)
                            }
                        }}
                    />
                    <ValidatedCamera
                        open={cameraOpen}
                        onClose={() => setCameraOpen(false)}
                        onCapture={(f) => onFileChange(f)}
                        label="Foto del Tablero"
                        expectedType="dashboard"
                    />
                    {preview ? (
                        <>
                            <img src={preview} alt="km-photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                               <span style={{
                                position: 'absolute', top: 8, right: 8, background: '#388e3c',
                                color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
                            }}>✓ FOTO TABLERO</span>
                            <button
                                onClick={e => {
                                    e.stopPropagation(); onFileChange(null)
                                }}
                                style={{
                                    position: 'absolute', bottom: 8, right: 8, background: '#d32f2f',
                                    color: '#fff', border: 'none', borderRadius: 20, fontSize: 10,
                                    padding: '4px 10px', cursor: 'pointer', fontWeight: 600
                                }}
                            >✕ Quitar</button>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', height: '100%', gap: 6,
                        }}>
                            <span style={{ fontSize: 30 }}>{hasCameraSupport ? '📷' : '📁'}</span>
                            <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>
                                {hasCameraSupport ? 'Foto del tablero' : 'Subir foto del tablero'}
                            </span>
                            <span style={{ fontSize: 11, color: '#bdbdbd' }}>
                                {hasCameraSupport ? 'IA validará el odómetro' : 'Selecciona foto del odómetro'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const CarCheckout = () => {
    const [step, setStep] = useState(0)
    const [selectedCar, setSelectedCar] = useState<any>(null)
    const [dates, setDates] = useState({ pickup: '', dropoff: '', location: '' })
    const [driver, setDriver] = useState({ name: '', email: '', phone: '', license: '', age: '' })
    const [mileage, setMileage] = useState('')
    const [fuel, setFuel] = useState('100')
    const [kmPhoto, setKmPhoto] = useState<File | null>(null)
    const [carouselFiles, setCarouselFiles] = useState<(File | null)[]>(Array(CAROUSEL_SLOTS.length).fill(null))
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [bookingId, setBookingId] = useState('')
    const [acceptedResponsibility, setAcceptedResponsibility] = useState(false)

    const onLoad = async (_user?: bookcarsTypes.User) => {
        if (_user) {
            setLoading(true)
            const params = new URLSearchParams(window.location.search)
            if (params.has('b')) {
                const id = params.get('b')
                if (id) {
                    setBookingId(id)
                    try {
                        const _booking = await BookingService.getBooking(id)
                        if (_booking) {
                            const car = _booking.car as bookcarsTypes.Car
                            setSelectedCar({
                                id: car._id,
                                name: car.name,
                                category: car.type || 'Vehículo',
                                price: _booking.price || car.price,
                                seats: car.seats,
                                transmission: car.gearbox === bookcarsTypes.GearboxType.Automatic ? 'Auto' : 'Manual',
                                fuel: car.type === bookcarsTypes.CarType.Diesel ? 'Diésel' : 'Gasolina',
                            })
                            setDates({
                                pickup: new Date(_booking.from).toISOString().split('T')[0],
                                dropoff: new Date(_booking.to).toISOString().split('T')[0],
                                location: (_booking.pickupLocation as bookcarsTypes.Location).name || '',
                            })
                            const driverData = _booking.driver as bookcarsTypes.User
                            if (driverData) {
                                setDriver({
                                    name: driverData.fullName || '',
                                    email: driverData.email || '',
                                    phone: driverData.phone || '',
                                    license: driverData.license || '',
                                    age: driverData.birthDate
                                        ? (new Date().getFullYear() - new Date(driverData.birthDate).getFullYear()).toString()
                                        : '',
                                })
                            }
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
            setLoading(false)
        }
    }

    const handleCarouselChange = (i: number, f: File | null) => {
        const next = [...carouselFiles]
        next[i] = f
        setCarouselFiles(next)
    }

    const days = () => {
        if (!dates.pickup || !dates.dropoff) {
            return 1
        }
        const d = (new Date(dates.dropoff).getTime() - new Date(dates.pickup).getTime()) / 86400000
        return d > 0 ? Math.ceil(d) : 1
    }

    const canNext = () => {
        if (step === 0) {
            return mileage !== '' && kmPhoto !== null
        }
        if (step === 1) {
            return carouselFiles.filter(Boolean).length >= 1
        }
        if (step === 2) {
            return !carouselFiles.some(f => f === null) || acceptedResponsibility
        }
        return true
    }

    const next = async () => {
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1)
        } else {
            try {
                setLoading(true)
                const formData = new FormData()
                formData.append('kmOut', mileage)
                formData.append('fuelOut', fuel)

                const missingPhotos = CAROUSEL_SLOTS.filter((_, i) => !carouselFiles[i]).map(s => s.label)
                if (missingPhotos.length > 0) {
                    formData.append('remarksOut', `Omisión de imágenes bajo responsabilidad: ${missingPhotos.join(', ')}`)
                }

                if (kmPhoto) {
                    formData.append('photo_km', kmPhoto)
                }
                carouselFiles.forEach((file, i) => {
                    if (file) {
                        formData.append(`photo_${i}`, file)
                    }
                })

                await BookingService.checkoutDeparture(bookingId, formData)
                
                try {
                    const bc = new BroadcastChannel('bookcars-checkout')
                    bc.postMessage({ type: 'checkout-completed', bookingId })
                    bc.close()
                } catch {}
                
                setDone(true)
            } catch (err) {
                helper.error(err)
            } finally {
                setLoading(false)
            }
        }
    }

    const S: any = {
        wrap: { minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 40px' },
        header: { width: '100%', maxWidth: 720, padding: '28px 20px 0', boxSizing: 'border-box' },
        title: { fontSize: 26, fontWeight: 700, color: '#1976d2', margin: 0 },
        stepper: { display: 'flex', width: '100%', maxWidth: 720, padding: '20px 20px 0', boxSizing: 'border-box' },
        card: { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 720, margin: '16px', padding: '32px 28px', boxShadow: '0 2px 10px rgba(0,0,0,.1)', boxSizing: 'border-box' },
        btnPrimary: { width: '100%', padding: '16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
        btnSecondary: { background: 'none', border: '1px solid #bdbdbd', borderRadius: 8, padding: '12px 20px', fontSize: 14, color: '#757575', cursor: 'pointer' },
    }

    if (done) {
        return (
            <Layout onLoad={onLoad} strict>
                <div style={S.wrap}>
                    <div style={{ ...S.card, margin: '60px 20px', textAlign: 'center', maxWidth: 440 }}>
                        <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
                        <h2 style={{ fontSize: 24, color: '#212121' }}>¡Salida registrada!</h2>
                        <p style={{ color: '#757575' }}>El checkout del vehículo se completó con éxito.</p>
                        <button style={S.btnPrimary} onClick={() => window.close()}>Cerrar</button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout onLoad={onLoad} strict>
            {!loading && (
                <div style={S.wrap}>
                    <div style={S.header}>
                        <h1 style={S.title}>Despacho de Vehículo</h1>
                    </div>

                    <div style={S.stepper}>
                        {STEPS.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: i < step ? '#1976d2' : i === step ? '#e3f2fd' : '#e0e0e0',
                                        color: i < step ? '#fff' : i === step ? '#1976d2' : '#9e9e9e',
                                        fontSize: 12, fontWeight: 700, border: i === step ? '2px solid #1976d2' : 'none',
                                    }}>{i < step ? '✓' : i + 1}</div>
                                    <span style={{ fontSize: 10, color: i === step ? '#1976d2' : '#9e9e9e' }}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? '#1976d2' : '#e0e0e0', marginBottom: 16 }} />}
                            </div>
                        ))}
                    </div>

                    <div style={S.card}>
                        {step === 0 && (
                            <>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#757575' }}>Nivel de Combustible</label>
                                    <select
                                        style={{ width: '100%', padding: '13px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa' }}
                                        value={fuel}
                                        onChange={e => setFuel(e.target.value)}
                                    >
                                        <option value="100">100% (Lleno)</option>
                                        <option value="75">75% (3/4)</option>
                                        <option value="50">50% (Mitad)</option>
                                        <option value="25">25% (1/4)</option>
                                        <option value="0">0% (Reserva)</option>
                                    </select>
                                </div>
                                <KmSlot mileage={mileage} onMileageChange={setMileage} file={kmPhoto} onFileChange={setKmPhoto} />
                            </>
                        )}

                        {step === 1 && <PhotoCarousel files={carouselFiles} onChange={handleCarouselChange} />}

                        {step === 2 && (
                            <>
                                <h2 style={{ fontSize: 20 }}>Confirmar Entrega</h2>
                                {[
                                    { label: 'Vehículo', value: selectedCar?.name || '-' },
                                    { label: 'Conductor', value: driver.name || '-' },
                                    { label: 'Km de salida', value: mileage ? `${mileage} km` : '-' },
                                    { label: 'Combustible', value: `${fuel}%` },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                                        <span style={{ fontSize: 13, color: '#757575' }}>{row.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                                    </div>
                                ))}
                                {carouselFiles.some(f => !f) && (
                                    <div style={{ marginTop: 24, padding: 16, background: '#fff3e0', borderRadius: 8 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={acceptedResponsibility} onChange={e => setAcceptedResponsibility(e.target.checked)} />
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>Acepto la responsabilidad por fotos faltantes</span>
                                        </label>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ width: '100%', maxWidth: 720, padding: '0 16px', boxSizing: 'border-box', display: 'flex', gap: 10 }}>
                        {step > 0 && <button style={S.btnSecondary} onClick={() => setStep(s => s - 1)}>← Atrás</button>}
                        <button style={{ ...S.btnPrimary, flex: 1, opacity: canNext() ? 1 : 0.5 }} onClick={next} disabled={!canNext()}>
                            {step === STEPS.length - 1 ? '✓ Aprobar Salida' : 'Continuar →'}
                        </button>
                    </div>
                </div>
            )}
            {loading && <Backdrop text="Cargando..." />}
        </Layout>
    )
}

export default CarCheckout
