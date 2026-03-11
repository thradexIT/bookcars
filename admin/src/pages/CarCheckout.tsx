import React, { useState, useRef } from 'react'
import Layout from '@/components/Layout'
import Backdrop from '@/components/SimpleBackdrop'
import * as BookingService from '@/services/BookingService'
import * as helper from '@/utils/helper'
import * as bookcarsTypes from ':bookcars-types'

import frontImg from '@/assets/img/front.png'
import rearImg from '@/assets/img/rear.png'
import leftImg from '@/assets/img/left.png'
import rightImg from '@/assets/img/right.png'
import interiorImg from '@/assets/img/interior1.png'
import dashboardImg from '@/assets/img/interior2.webp'

// ─── CONFIGURABLE ────────────────────────────────────────────────────
// Imágenes del carrusel (excluye el tablero/km que va aparte)
const CAROUSEL_SLOTS: { label: string; refImg: string; hint: string }[] = [
    { label: 'Frontal', refImg: frontImg, hint: 'Frente del vehículo completo' },
    { label: 'Trasera', refImg: rearImg, hint: 'Parte trasera completa' },
    { label: 'Lateral Izqu.', refImg: leftImg, hint: 'Lado izquierdo completo' },
    { label: 'Lateral Der.', refImg: rightImg, hint: 'Lado derecho completo' },
    { label: 'Interior', refImg: interiorImg, hint: 'Asientos y habitáculo' },
    { label: 'Tablero', refImg: dashboardImg, hint: 'Tablero del vehículo' },
]
// ─────────────────────────────────────────────────────────────────────

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
    const inputRef = useRef<HTMLInputElement>(null)
    const [viewerOpen, setViewerOpen] = useState(false)
    const preview = file ? URL.createObjectURL(file) : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 4px' }}>
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

            {/* Etiqueta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#424242', letterSpacing: .3 }}>{slot.label}</span>
                <span style={{ fontSize: 11, color: '#9e9e9e' }}>{slot.hint}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Imagen referencial */}
                <div
                    onClick={() => setViewerOpen(true)}
                    style={{
                        borderRadius: 10, overflow: 'hidden', background: '#f0f4fa',
                        border: '1.5px solid #e3eaf5', position: 'relative',
                        aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-in', transition: 'box-shadow 0.2s', width: '100%', height: 'auto'
                    }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <img
                        src={slot.refImg}
                        alt={`ref-${slot.label}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                        color: '#fff', fontSize: 11, borderRadius: 12, padding: '4px 8px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        <span>🔍</span> Ampliar
                    </div>
                    <span style={{
                        position: 'absolute', top: 8, left: 8, background: '#1976d2',
                        color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>REFERENCIA</span>
                </div>

                {/* Imagen adjunta */}
                <label htmlFor={`carousel-${index}`} style={{
                    borderRadius: 10, overflow: 'hidden', border: `2px dashed ${preview ? '#1976d2' : '#bdbdbd'}`,
                    aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: preview ? '#e3f2fd' : '#fafafa', cursor: 'pointer', position: 'relative',
                    transition: 'all .2s', width: '100%', height: 'auto'
                }}>
                    {preview ? (
                        <>
                            <img src={preview} alt={`taken-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span style={{
                                position: 'absolute', top: 8, right: 8, background: '#388e3c',
                                color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
                            }}>✓ CAPTURADA</span>
                            <button
                                onClick={e => {
                                    e.preventDefault(); onChange(index, null)
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
                            <span style={{ fontSize: 30 }}>📷</span>
                            <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>Adjuntar foto</span>
                            <span style={{ fontSize: 11, color: '#bdbdbd' }}>Toca para seleccionar</span>
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        id={`carousel-${index}`}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={e => onChange(index, e.target.files?.[0] ?? null)}
                    />
                </label>
            </div>
        </div>
    )
}

// ── Carrusel ──────────────────────────────────────────────────────────
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
            {/* Indicador de progreso */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Fotos del vehículo
                </span>
                <span style={{ fontSize: 12, color: filled === total ? '#388e3c' : '#f57c00', fontWeight: 600 }}>
                    {filled}/{total} {filled === total ? '✓' : 'pendientes'}
                </span>
            </div>

            {/* Dots navegación */}
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

            {/* Slot activo */}
            <CarouselSlot
                slot={CAROUSEL_SLOTS[active]}
                index={active}
                file={files[active]}
                onChange={(i, f) => {
                    onChange(i, f)
                }}
            />

            {/* Flechas de navegación */}
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

            {/* Miniaturas */}
            <div style={{ display: 'flex', gap: 6, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
                {CAROUSEL_SLOTS.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        style={{
                            flexShrink: 0, width: 56, height: 56, borderRadius: 8, overflow: 'hidden',
                            border: i === active ? '2.5px solid #1976d2' : '2px solid #e0e0e0',
                            background: '#f5f5f5', cursor: 'pointer', padding: 0, position: 'relative',
                        }}
                    >
                        {files[i] ? (
                            <img
                                src={URL.createObjectURL(files[i]!)}
                                alt={s.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                                <span style={{ fontSize: 16 }}>📷</span>
                                <span style={{ fontSize: 8, color: '#9e9e9e', lineHeight: 1, textAlign: 'center', padding: '0 2px' }}>{s.label}</span>
                            </div>
                        )}
                        {files[i] && (
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                height: 4, background: '#388e3c',
                            }} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Slot especial: Tablero / Km ───────────────────────────────────────
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
    const preview = file ? URL.createObjectURL(file) : null

    return (
        <div style={{
            border: '1.5px solid #e3eaf5', borderRadius: 12, padding: 20,
            background: '#f8faff', marginBottom: 20,
        }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1976d2', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                Tablero — Kilometraje de Salida
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Texto: km */}
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
                            fontFamily: 'Roboto, Arial, sans-serif', boxSizing: 'border-box',
                            background: '#fff', outline: 'none',
                        }}
                    />
                </div>

                {/* Foto del tablero */}
                <label htmlFor="km-photo" style={{
                    display: 'flex', borderRadius: 10, overflow: 'hidden',
                    border: `2px dashed ${preview ? '#1976d2' : '#bdbdbd'}`,
                    aspectRatio: '16/9', cursor: 'pointer', position: 'relative',
                    background: preview ? '#e3f2fd' : '#fafafa', transition: 'all .2s',
                    alignItems: 'center', justifyContent: 'center', width: '100%', height: 'auto'
                }}>
                    {preview ? (
                        <>
                            <img src={preview} alt="km-photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span style={{
                                position: 'absolute', top: 8, right: 8, background: '#388e3c',
                                color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 600,
                            }}>✓ FOTO TABLERO</span>
                            <button
                                onClick={e => {
                                    e.preventDefault(); onFileChange(null)
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
                            <span style={{ fontSize: 30 }}>📷</span>
                            <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>Foto del tablero</span>
                            <span style={{ fontSize: 11, color: '#bdbdbd' }}>Debe mostrar el odómetro</span>
                        </div>
                    )}
                    <input
                        id="km-photo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={e => onFileChange(e.target.files?.[0] ?? null)}
                    />
                </label>
            </div>
        </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────
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
                if (id && id !== '') {
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
            const hasMissingPhotos = carouselFiles.some(f => f === null)
            if (hasMissingPhotos) {
                return acceptedResponsibility
            }
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
                    const observation = `Bajo la responsabilidad de la persona que está llenando la data, se omitieron las imágenes ${missingPhotos.join(', ')} cuando se realizó la salida de taller.`
                    formData.append('remarksOut', observation)
                }

                if (kmPhoto) {
                    formData.append('photo_km', kmPhoto)
                }
                for (let i = 0; i < carouselFiles.length; i++) {
                    const file = carouselFiles[i]
                    if (file) {
                        formData.append(`photo_${i}`, file)
                    }
                }
                await BookingService.checkoutDeparture(bookingId, formData)
                // Notify UpdateBooking tab to refresh
                try {
                    const bc = new BroadcastChannel('bookcars-checkout')
                    bc.postMessage({ type: 'checkout-completed', bookingId })
                    bc.close()
                } catch {
                    // BroadcastChannel not supported — no-op
                }
                setDone(true)
            } catch (err) {
                helper.error(err)
            } finally {
                setLoading(false)
            }
        }
    }
    const back = () => setStep(s => s - 1)

    const S: any = {
        wrap: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Roboto, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 40px' },
        header: { width: '100%', maxWidth: 720, padding: '28px 20px 0', color: '#424242', boxSizing: 'border-box' },
        brand: { fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', opacity: .6, marginBottom: 4 },
        title: { fontSize: 26, fontWeight: 700, color: '#1976d2', margin: 0 },
        stepper: { display: 'flex', gap: 0, width: '100%', maxWidth: 720, padding: '20px 20px 0', overflowX: 'auto', boxSizing: 'border-box' },
        card: { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 720, margin: '16px 16px', padding: '32px 28px', boxShadow: '0 2px 10px rgba(0,0,0,.1)', boxSizing: 'border-box' },
        sectionTitle: { fontSize: 20, fontWeight: 700, color: '#212121', margin: '0 0 20px' },
        btnPrimary: { width: '100%', padding: '16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: 'Roboto, Arial, sans-serif', cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 6px rgba(25,118,210,.3)' },
        btnSecondary: { background: 'none', border: '1px solid #bdbdbd', borderRadius: 8, padding: '12px 20px', fontSize: 14, color: '#757575', cursor: 'pointer', fontFamily: 'Roboto, Arial, sans-serif' },
    }

    if (done) {
        return (
            <Layout onLoad={onLoad} strict>
                {!loading && (
                    <div style={S.wrap}>
                        <div style={{ ...S.card, margin: '60px 20px', textAlign: 'center', maxWidth: 440 }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
                            <h2 style={{ fontSize: 24, color: '#212121', margin: '0 0 8px' }}>¡Salida registrada!</h2>
                            <p style={{ color: '#757575', fontSize: 16 }}>El checkout del vehículo se completó con éxito.</p>
                            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, margin: '20px 0', textAlign: 'left' }}>
                                <div style={{ fontSize: 13, color: '#9e9e9e', marginBottom: 4, fontWeight: 600 }}>RESUMEN</div>
                                <div style={{ fontSize: 16, color: '#212121', fontWeight: 500 }}>{selectedCar?.name} · {days()} día{days() > 1 ? 's' : ''}</div>
                                <div style={{ fontSize: 14, color: '#616161', marginTop: 4 }}>Conductor: {driver.name}</div>
                                <div style={{ fontSize: 14, color: '#616161', marginTop: 2 }}>Km salida: {mileage} km · Combustible: {fuel}%</div>
                                <div style={{ fontSize: 14, color: '#616161', marginTop: 2 }}>
                                    Fotos: {carouselFiles.filter(Boolean).length + (kmPhoto ? 1 : 0)}/{CAROUSEL_SLOTS.length + 1}
                                </div>
                                {carouselFiles.some(f => !f) && (
                                    <div style={{ fontSize: 13, color: '#e65100', marginTop: 8, fontStyle: 'italic', lineHeight: 1.4 }}>
                                        <strong>Obs:</strong> Bajo la responsabilidad de la persona que está llenando la data, se omitieron las imágenes {CAROUSEL_SLOTS.filter((_, i) => !carouselFiles[i]).map(s => s.label).join(', ')} cuando se realizó la salida de taller.
                                    </div>
                                )}
                            </div>
                            <button style={S.btnPrimary} onClick={() => window.close()}>Cerrar</button>
                        </div>
                    </div>
                )}
                {loading && <Backdrop text="Cargando..." />}
            </Layout>
        )
    }

    return (
        <Layout onLoad={onLoad} strict>
            {!loading && (
                <div style={{ ...S.wrap, minHeight: 'calc(100vh - 64px)' }}>
                    {/* Header */}
                    <div style={S.header}>
                        <div style={S.brand}>Panel de Administración</div>
                        <h1 style={S.title}>Despacho de Vehículo</h1>
                    </div>

                    {/* Stepper */}
                    <div style={S.stepper}>
                        {STEPS.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: i < step ? '#1976d2' : i === step ? '#e3f2fd' : '#e0e0e0',
                                        color: i < step ? '#fff' : i === step ? '#1976d2' : '#9e9e9e',
                                        fontSize: 12, fontWeight: 700, border: i === step ? '2px solid #1976d2' : 'none',
                                    }}>{i < step ? '✓' : i + 1}</div>
                                    <span style={{ fontSize: 10, fontWeight: i === step ? 600 : 400, color: i === step ? '#1976d2' : '#9e9e9e', whiteSpace: 'nowrap' }}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? '#1976d2' : '#e0e0e0', marginBottom: 16 }} />}
                            </div>
                        ))}
                    </div>

                    {/* Card */}
                    <div style={S.card}>

                        {/* STEP 0: Niveles y Km */}
                        {step === 0 && (
                            <>
                                <h2 style={S.sectionTitle}>Niveles y Kilometraje</h2>

                                {/* Nivel combustible */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#757575', display: 'block', marginBottom: 6 }}>
                                        Nivel de Combustible
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '13px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 15, fontFamily: 'Roboto, Arial, sans-serif', boxSizing: 'border-box', background: '#fafafa', color: '#212121', outline: 'none' }}
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

                                {/* Slot especial: Km + foto tablero */}
                                <KmSlot
                                    mileage={mileage}
                                    onMileageChange={setMileage}
                                    file={kmPhoto}
                                    onFileChange={setKmPhoto}
                                />
                            </>
                        )}

                        {/* STEP 1: Fotos del vehículo */}
                        {step === 1 && (
                            <>
                                <h2 style={S.sectionTitle}>Estado Exterior e Interior</h2>

                                {/* Carrusel de fotos del vehículo */}
                                <PhotoCarousel
                                    files={carouselFiles}
                                    onChange={handleCarouselChange}
                                />
                            </>
                        )}

                        {/* STEP 2: Confirmación */}
                        {step === 2 && (
                            <>
                                <h2 style={S.sectionTitle}>Confirmar Entrega</h2>
                                <p style={{ color: '#616161', fontSize: 14, marginBottom: 20 }}>
                                    Verifica que el kilometraje y las fotografías estén correctas. Una vez aprobado no podrán editarse fácilmente.
                                </p>
                                {[
                                    { label: 'Vehículo', value: selectedCar?.name || '-' },
                                    { label: 'Conductor', value: driver.name || '-' },
                                    { label: 'Km de salida', value: mileage ? `${mileage} km` : '-' },
                                    { label: 'Combustible', value: `${fuel}%` },
                                    { label: 'Foto tablero', value: kmPhoto ? '✓ Adjunta' : '✗ Faltante' },
                                    { label: 'Fotos vehículo', value: `${carouselFiles.filter(Boolean).length} de ${CAROUSEL_SLOTS.length}` },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                                        <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>{row.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#212121', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                                    </div>
                                ))}

                                {carouselFiles.some(f => !f) && (
                                    <div style={{
                                        marginTop: 24,
                                        padding: 16,
                                        background: '#fff3e0',
                                        border: '1px solid #ffe0b2',
                                        borderRadius: 8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12
                                    }}>
                                        <div style={{ color: '#e65100', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            ⚠️ ATENCIÓN: FOTOS FALTANTES
                                        </div>
                                        <div style={{ fontSize: 13, color: '#5d4037', lineHeight: 1.5 }}>
                                            No se han subido las siguientes fotografías: <strong>{CAROUSEL_SLOTS.filter((_, i) => !carouselFiles[i]).map(s => s.label).join(', ')}</strong>.
                                            <br /><br />
                                            Al continuar, el usuario declara que <strong>bajo la responsabilidad de la persona que está llenando la data</strong> se está omitiendo la captura de estas imágenes.
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0' }}>
                                            <input
                                                type="checkbox"
                                                checked={acceptedResponsibility}
                                                onChange={e => setAcceptedResponsibility(e.target.checked)}
                                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>Entiendo y acepto la responsabilidad</span>
                                        </label>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ width: '100%', maxWidth: 720, padding: '0 16px', boxSizing: 'border-box', display: 'flex', gap: 10 }}>
                        {step > 0 && <button style={S.btnSecondary} onClick={back}>← Atrás</button>}
                        <button
                            style={{ ...S.btnPrimary, flex: 1, opacity: canNext() ? 1 : 0.5 }}
                            onClick={next}
                            disabled={!canNext()}
                        >
                            {step === STEPS.length - 1 ? '✓ Aprobar Salida' : 'Continuar →'}
                        </button>
                    </div>
                </div>
            )}
            {loading && <Backdrop text="Cargando datos..." />}
        </Layout>
    )
}

export default CarCheckout
