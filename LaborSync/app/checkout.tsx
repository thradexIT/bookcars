import React, { useState, useEffect } from 'react'
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  TextInput, Image, Alert, Dimensions, ActivityIndicator,
} from 'react-native'
import { useRouter, Stack, useLocalSearchParams } from 'expo-router'
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  Camera as CameraIcon, Check, Trash2, CheckCircle,
} from 'lucide-react-native'
import ValidatedCamera from '@/components/ValidatedCamera'
import * as BookingService from '@/services/BookingService'

const { width } = Dimensions.get('window')

const STEPS = ['Niveles y Km', 'Fotos', 'Confirmación']

// ── CAROUSEL CONFIG ─────────────────────────────────────────────
const CAROUSEL_SLOTS = [
  { label: 'Frontal',       refImg: require('../assets/images/front.png'),    hint: 'Frente del vehículo completo' },
  { label: 'Trasera',       refImg: require('../assets/images/rear.png'),     hint: 'Parte trasera completa' },
  { label: 'Lateral Izqu.', refImg: require('../assets/images/left.png'),     hint: 'Lado izquierdo completo' },
  { label: 'Lateral Der.',  refImg: require('../assets/images/right.png'),    hint: 'Lado derecho completo' },
  { label: 'Interior',      refImg: require('../assets/images/interior1.png'),hint: 'Asientos y habitáculo' },
  { label: 'Tablero',       refImg: require('../assets/images/interior2.webp'),hint: 'Tablero del vehículo' },
]

// ── CAROUSEL SLOT COMPONENT ──────────────────────────────────────
const CarouselSlot = ({
  slot,
  index,
  photoUri,
  onCapture,
  onRemove,
}: {
  slot: typeof CAROUSEL_SLOTS[0]
  index: number
  photoUri: string | null
  onCapture: (index: number, slot: typeof CAROUSEL_SLOTS[0]) => void
  onRemove: (index: number) => void
}) => (
  <View style={sl.slotWrapper}>
    {/* Header */}
    <View style={sl.slotHead}>
      <Text style={sl.slotLabel}>{slot.label}</Text>
      <Text style={sl.slotHint}>{slot.hint}</Text>
    </View>

    {/* Reference + Capture side by side */}
    <View style={sl.pair}>
      {/* Reference */}
      <View style={[sl.box, sl.refBox]}>
        <Text style={sl.boxTag}>Referencia</Text>
        <Image source={slot.refImg} style={sl.refImg} />
      </View>

      {/* Capture */}
      <TouchableOpacity
        style={[sl.box, sl.captureBox, photoUri && sl.capturedBox]}
        onPress={() => onCapture(index, slot)}
        activeOpacity={0.7}
      >
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={sl.capturedImg} />
            <Text style={sl.capturedBadge}>✓ CAPTURADA</Text>
            <TouchableOpacity style={sl.removeBtn} onPress={() => onRemove(index)}>
              <Trash2 color="#fff" size={13} />
              <Text style={sl.removeBtnText}>Quitar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={sl.placeholder}>
            <CameraIcon color="#bdbdbd" size={28} />
            <Text style={sl.placeholderText}>Capturar con IA</Text>
            <Text style={sl.placeholderHint}>Toca para abrir cámara</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
)

// ── PHOTO CAROUSEL COMPONENT ─────────────────────────────────────
const PhotoCarousel = ({
  photos,
  setPhotoAtIndex,
  activeIndex,
  setActiveIndex,
}: {
  photos: (string | null)[]
  setPhotoAtIndex: (i: number, uri: string | null) => void
  activeIndex: number
  setActiveIndex: (i: number) => void
}) => {
  const [cameraVisible, setCameraVisible] = useState(false)
  const [cameraTarget, setCameraTarget] = useState(0)
  const [cameraSlot, setCameraSlot] = useState(CAROUSEL_SLOTS[0])

  const total = CAROUSEL_SLOTS.length
  const filled = photos.filter(Boolean).length

  const openCamera = (index: number, slot: typeof CAROUSEL_SLOTS[0]) => {
    setCameraTarget(index)
    setCameraSlot(slot)
    setCameraVisible(true)
  }

  return (
    <View>
      {/* Counter */}
      <View style={pc.header}>
        <Text style={pc.headerTitle}>Fotos del vehículo</Text>
        <Text style={[pc.counter, { color: filled === total ? '#388e3c' : '#f57c00' }]}>
          {filled}/{total} {filled === total ? '✓' : 'pendientes'}
        </Text>
      </View>

      {/* Dots */}
      <View style={pc.dots}>
        {CAROUSEL_SLOTS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveIndex(i)}
            style={[
              pc.dot,
              { width: i === activeIndex ? 24 : 8 },
              photos[i] ? pc.dotFilled : i === activeIndex ? pc.dotActive : pc.dotDefault,
            ]}
          />
        ))}
      </View>

      {/* Active Slot */}
      <CarouselSlot
        slot={CAROUSEL_SLOTS[activeIndex]}
        index={activeIndex}
        photoUri={photos[activeIndex]}
        onCapture={openCamera}
        onRemove={(i) => setPhotoAtIndex(i, null)}
      />

      {/* Prev / Next */}
      <View style={pc.nav}>
        <TouchableOpacity
          style={[pc.navBtn, activeIndex === 0 && pc.navBtnDisabled]}
          onPress={() => setActiveIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
        >
          <ChevronLeft size={18} color={activeIndex === 0 ? '#bdbdbd' : '#424242'} />
          <Text style={[pc.navBtnText, activeIndex === 0 && { color: '#bdbdbd' }]}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[pc.navBtn, pc.navBtnPrimary, activeIndex === total - 1 && pc.navBtnPrimaryOff]}
          onPress={() => setActiveIndex(Math.min(total - 1, activeIndex + 1))}
          disabled={activeIndex === total - 1}
        >
          <Text style={[pc.navBtnText, { color: activeIndex === total - 1 ? '#90caf9' : '#fff' }]}>Siguiente</Text>
          <ChevronRight size={18} color={activeIndex === total - 1 ? '#90caf9' : '#fff'} />
        </TouchableOpacity>
      </View>

      {/* Camera Modal */}
      <ValidatedCamera
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(uri) => {
          setPhotoAtIndex(cameraTarget, uri)
          setCameraVisible(false)
        }}
        label={`Capturar ${cameraSlot.label}`}
        expectedType={cameraSlot.label.toLowerCase().includes('tablero') ? 'dashboard' : 'car'}
        silhouetteImg={cameraSlot.refImg}
      />
    </View>
  )
}

// ── KM SLOT COMPONENT ────────────────────────────────────────────
const KmSlot = ({
  mileage,
  onMileageChange,
  photoUri,
  onPhotoChange,
  accentColor,
  title,
}: {
  mileage: string
  onMileageChange: (v: string) => void
  photoUri: string | null
  onPhotoChange: (uri: string | null) => void
  accentColor: string
  title: string
}) => {
  const [cameraVisible, setCameraVisible] = useState(false)

  return (
    <View style={km.container}>
      <Text style={[km.title, { color: accentColor }]}>{title}</Text>

      <TextInput
        style={[km.input, { color: accentColor }]}
        placeholder="Ej. 15000"
        keyboardType="numeric"
        value={mileage}
        onChangeText={onMileageChange}
        placeholderTextColor="#bdbdbd"
      />

      {/* Reference side by side with capture */}
      <View style={sl.pair}>
        <View style={[sl.box, sl.refBox]}>
          <Text style={sl.boxTag}>Referencia</Text>
          <Image source={require('../assets/images/interior2.webp')} style={sl.refImg} />
        </View>

        <TouchableOpacity
          style={[sl.box, sl.captureBox, photoUri && sl.capturedBox, { borderColor: photoUri ? accentColor : '#bdbdbd' }]}
          onPress={() => setCameraVisible(true)}
          activeOpacity={0.7}
        >
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={sl.capturedImg} />
              <Text style={[sl.capturedBadge, { backgroundColor: accentColor }]}>✓ FOTO TABLERO</Text>
              <TouchableOpacity style={sl.removeBtn} onPress={() => onPhotoChange(null)}>
                <Trash2 color="#fff" size={13} />
                <Text style={sl.removeBtnText}>Quitar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={sl.placeholder}>
              <CameraIcon color="#bdbdbd" size={28} />
              <Text style={sl.placeholderText}>Foto del tablero</Text>
              <Text style={sl.placeholderHint}>IA validará el odómetro</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ValidatedCamera
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(uri) => { onPhotoChange(uri); setCameraVisible(false) }}
        label="Foto del Tablero"
        expectedType="dashboard"
      />
    </View>
  )
}

// ── MAIN CHECKOUT SCREEN ─────────────────────────────────────────
export default function CheckoutScreen() {
  const router = useRouter()
  const { bookingId, plate } = useLocalSearchParams<{ bookingId?: string; plate?: string }>()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Booking info loaded from backend
  const [carName, setCarName] = useState('')
  const [driverName, setDriverName] = useState('')

  // Form state
  const [fuel, setFuel] = useState('100')
  const [mileage, setMileage] = useState('')
  const [kmPhoto, setKmPhoto] = useState<string | null>(null)
  const [carPhotos, setCarPhotos] = useState<(string | null)[]>(Array(CAROUSEL_SLOTS.length).fill(null))
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false)

  // Load booking details
  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    BookingService.getBooking(bookingId)
      .then(b => {
        setCarName((b.car as any)?.name ?? '')
        setDriverName((b.driver as any)?.fullName ?? '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [bookingId])

  const setPhotoAtIndex = (i: number, uri: string | null) => {
    const next = [...carPhotos]; next[i] = uri; setCarPhotos(next)
  }

  const canNext = (): boolean => {
    if (step === 0) return mileage !== '' && kmPhoto !== null
    if (step === 1) return carPhotos.filter(Boolean).length >= 1
    if (step === 2) return !carPhotos.some(f => f === null) || acceptedResponsibility
    return true
  }

  const handleNext = async () => {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return }

    if (!bookingId) { Alert.alert('Error', 'No hay reserva asociada.'); return }

    setSubmitting(true)
    try {
      const formData = new FormData() as any
      formData.append('kmOut', mileage)
      formData.append('fuelOut', fuel)

      const missing = CAROUSEL_SLOTS.filter((_, i) => !carPhotos[i]).map(s => s.label)
      if (missing.length > 0) {
        formData.append('remarksOut', `Omisión de imágenes bajo responsabilidad: ${missing.join(', ')}`)
      }
      if (kmPhoto) {
        formData.append('photo_km', { uri: kmPhoto, name: 'km.jpg', type: 'image/jpeg' })
      }
      carPhotos.forEach((uri, i) => {
        if (uri) formData.append(`photo_${i}`, { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' })
      })

      await BookingService.checkoutDeparture(bookingId, formData)
      setDone(true)
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo registrar el despacho.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── DONE SCREEN ────────────────────────────────────────────────
  if (done) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.doneWrap}>
          <CheckCircle color="#1976d2" size={72} />
          <Text style={styles.doneTitle}>¡Salida registrada!</Text>
          <Text style={styles.doneSubtitle}>El checkout del vehículo se completó con éxito.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/')}>
            <Text style={styles.doneBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── LOADING ───────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Despacho de Vehículo', headerShown: true }} />
        <View style={styles.center}><ActivityIndicator size="large" color="#1976d2" /></View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: plate ? `Despacho: ${plate}` : 'Despacho de Vehículo',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <ArrowLeft color="#212121" size={24} />
          </TouchableOpacity>
        ),
      }} />

      {/* Stepper */}
      <View style={styles.stepperContainer}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItemWrapper}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, i < step ? styles.stepDone : i === step ? styles.stepActive : styles.stepInactive]}>
                {i < step
                  ? <Check color="#fff" size={14} />
                  : <Text style={[styles.stepNumber, i === step && { color: '#1976d2' }]}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── STEP 0: Niveles y Km ─────────────────────────────── */}
        {step === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nivel de Combustible</Text>
            <View style={styles.fuelOptions}>
              {[
                { val: '100', label: '100% (Lleno)' },
                { val: '75',  label: '75% (3/4)' },
                { val: '50',  label: '50% (Mitad)' },
                { val: '25',  label: '25% (1/4)' },
                { val: '0',   label: '0% (Reserva)' },
              ].map(({ val, label }) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.fuelBtn, fuel === val && styles.fuelBtnActive]}
                  onPress={() => setFuel(val)}
                >
                  <Text style={[styles.fuelBtnText, fuel === val && styles.fuelBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <KmSlot
              mileage={mileage}
              onMileageChange={setMileage}
              photoUri={kmPhoto}
              onPhotoChange={setKmPhoto}
              accentColor="#1976d2"
              title="Tablero — Kilometraje de Salida"
            />
          </View>
        )}

        {/* ── STEP 1: Fotos ────────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.card}>
            <PhotoCarousel
              photos={carPhotos}
              setPhotoAtIndex={setPhotoAtIndex}
              activeIndex={activePhotoIndex}
              setActiveIndex={setActivePhotoIndex}
            />
          </View>
        )}

        {/* ── STEP 2: Confirmación ─────────────────────────────── */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.confirmTitle}>Confirmar Entrega</Text>
            {[
              { label: 'Vehículo',      value: carName || plate || '-' },
              { label: 'Conductor',     value: driverName || '-' },
              { label: 'Km de salida',  value: mileage ? `${mileage} km` : '-' },
              { label: 'Combustible',   value: `${fuel}%` },
              { label: 'Fotos tomadas', value: `${carPhotos.filter(Boolean).length} / ${CAROUSEL_SLOTS.length}` },
            ].map(row => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={styles.summaryValue}>{row.value}</Text>
              </View>
            ))}

            {carPhotos.some(f => !f) && (
              <View style={styles.responsibilityBox}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAcceptedResponsibility(a => !a)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, acceptedResponsibility && styles.checkboxChecked]}>
                    {acceptedResponsibility && <Check color="#fff" size={12} />}
                  </View>
                  <Text style={styles.responsibilityText}>
                    Acepto la responsabilidad por fotos faltantes
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)} disabled={submitting}>
            <ChevronLeft color="#757575" size={20} />
            <Text style={styles.backBtnText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, (!canNext() || submitting) && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext() || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.nextBtnText}>
                {step === STEPS.length - 1 ? '✓ Aprobar Salida' : 'Continuar →'}
              </Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────

// Shared slot styles
const sl = StyleSheet.create({
  slotWrapper: { gap: 10 },
  slotHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  slotLabel:   { fontSize: 13, fontWeight: '700', color: '#424242', letterSpacing: 0.3 },
  slotHint:    { fontSize: 11, color: '#9e9e9e' },
  pair:        { flexDirection: 'row', gap: 12, marginTop: 8 },
  box:         { flex: 1, aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  refBox:      { backgroundColor: '#f0f4fa', borderWidth: 1.5, borderColor: '#e3eaf5', alignItems: 'center', justifyContent: 'center' },
  captureBox:  { borderWidth: 2, borderStyle: 'dashed', borderColor: '#bdbdbd', backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
  capturedBox: { borderStyle: 'solid', borderColor: '#1976d2', backgroundColor: '#e3f2fd' },
  boxTag:      { position: 'absolute', top: 5, left: 6, fontSize: 9, fontWeight: '700', color: '#1976d2', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 4, borderRadius: 4, zIndex: 1 },
  refImg:      { width: '100%', height: '100%', resizeMode: 'cover' },
  capturedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  capturedBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#388e3c', color: '#fff', fontSize: 9, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2, fontWeight: '700', overflow: 'hidden' },
  removeBtn:   { position: 'absolute', bottom: 6, right: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#d32f2f', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  removeBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  placeholder: { alignItems: 'center', gap: 4 },
  placeholderText: { fontSize: 12, color: '#757575', fontWeight: '500' },
  placeholderHint: { fontSize: 10, color: '#bdbdbd' },
})

// Photo Carousel styles
const pc = StyleSheet.create({
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle:   { fontSize: 12, fontWeight: '700', color: '#757575', textTransform: 'uppercase', letterSpacing: 1 },
  counter:       { fontSize: 12, fontWeight: '600' },
  dots:          { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 12 },
  dot:           { height: 8, borderRadius: 4 },
  dotDefault:    { backgroundColor: '#e0e0e0' },
  dotActive:     { backgroundColor: '#1976d2' },
  dotFilled:     { backgroundColor: '#388e3c' },
  nav:           { flexDirection: 'row', gap: 8, marginTop: 12 },
  navBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', gap: 4 },
  navBtnDisabled:{ backgroundColor: '#f5f5f5' },
  navBtnPrimary: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  navBtnPrimaryOff: { backgroundColor: '#e3f2fd', borderColor: '#e3f2fd' },
  navBtnText:    { fontSize: 14, fontWeight: '600', color: '#424242' },
})

// KM Slot styles
const km = StyleSheet.create({
  container: { borderWidth: 1.5, borderColor: '#e3eaf5', borderRadius: 12, padding: 16, backgroundColor: '#f8faff', marginTop: 16 },
  title:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  input:     { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 14, fontSize: 22, fontWeight: '700', marginBottom: 12 },
})

// Main screen styles
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent:   { padding: 16, paddingBottom: 40 },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stepperContainer:{ flexDirection: 'row', padding: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stepItemWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepItem:        { alignItems: 'center', width: 78 },
  stepCircle:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepNumber:      { fontSize: 12, fontWeight: '700', color: '#9e9e9e' },
  stepActive:      { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: '#1976d2' },
  stepDone:        { backgroundColor: '#1976d2' },
  stepInactive:    {},
  stepLabel:       { fontSize: 9, color: '#9e9e9e', fontWeight: '600', textAlign: 'center' },
  stepLabelActive: { color: '#1976d2' },
  stepLine:        { width: 36, height: 2, backgroundColor: '#e0e0e0', marginBottom: 16 },
  stepLineDone:    { backgroundColor: '#1976d2' },
  cardTitle:       { fontSize: 12, fontWeight: '700', color: '#757575', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  fuelOptions:     { gap: 8 },
  fuelBtn:         { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  fuelBtnActive:   { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  fuelBtnText:     { fontSize: 14, fontWeight: '600', color: '#757575' },
  fuelBtnTextActive:{ color: '#fff' },
  confirmTitle:    { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 16 },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  summaryLabel:    { fontSize: 13, color: '#757575' },
  summaryValue:    { fontSize: 14, fontWeight: '600', color: '#212121' },
  responsibilityBox: { marginTop: 20, padding: 16, backgroundColor: '#fff3e0', borderRadius: 8 },
  checkboxRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox:        { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#bdbdbd', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  responsibilityText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#424242' },
  footer:          { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', flexDirection: 'row', gap: 10 },
  backBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', gap: 4 },
  backBtnText:     { fontSize: 14, fontWeight: '600', color: '#757575' },
  nextBtn:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 10, backgroundColor: '#1976d2' },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  doneWrap:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  doneTitle:       { fontSize: 24, fontWeight: '700', color: '#212121', textAlign: 'center' },
  doneSubtitle:    { fontSize: 14, color: '#757575', textAlign: 'center' },
  doneBtn:         { marginTop: 8, backgroundColor: '#1976d2', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  doneBtnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
})
