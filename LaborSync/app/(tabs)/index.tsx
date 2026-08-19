import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { LogIn, LogOut, Search, RefreshCw, AlertCircle } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import * as BookingService from '@/services/BookingService'
import type { Booking } from '@/services/BookingService'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TAB_CHECKOUT = 'checkout'
const TAB_CHECKIN = 'checkin'

/**
 * A booking is "ready for checkout" when kmOut is not set yet
 * (the car has NOT been dispatched).
 */
const isReadyForCheckout = (b: Booking) =>
  b.kmOut === undefined || b.kmOut === null

/**
 * A booking is "ready for checkin" when kmOut IS set
 * (the car was dispatched) but kmIn is NOT set yet.
 */
const isReadyForCheckin = (b: Booking) =>
  (b.kmOut !== undefined && b.kmOut !== null) &&
  (b.kmIn === undefined || b.kmIn === null)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

// ── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({
  booking,
  mode,
  onPress,
}: {
  booking: Booking
  mode: typeof TAB_CHECKOUT | typeof TAB_CHECKIN
  onPress: () => void
}) => {
  const isOut = mode === TAB_CHECKOUT
  const color = isOut ? '#1976d2' : '#2e7d32'
  const bgColor = isOut ? '#e3f2fd' : '#e8f5e9'

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        {/* Plate badge + Car name row */}
        <View style={styles.cardHeaderRow}>
          <View style={[styles.plateBadge, { backgroundColor: bgColor }]}>
            <Text style={[styles.plateText, { color }]}>🚗 {booking.car?.licensePlate ?? booking.car?.name ?? '—'}</Text>
          </View>
          <Text style={styles.cardDate}>{formatDate(booking.from)}</Text>
        </View>

        {/* Driver */}
        <Text style={styles.cardDriver} numberOfLines={1}>
          <Text style={styles.cardLabel}>Driver: </Text>
          {booking.driver?.fullName ?? '—'}
        </Text>

        {/* Location */}
        <Text style={styles.cardLocation} numberOfLines={1}>
          {(typeof booking.pickupLocation === 'object' ? booking.pickupLocation?.name : null) ?? '—'}
          {' → '}
          {(typeof booking.dropOffLocation === 'object' ? booking.dropOffLocation?.name : null) ?? '—'}
        </Text>

        {/* Action button */}
        <View style={[styles.actionPill, { backgroundColor: color }]}>
          {isOut
            ? <LogOut size={13} color="#fff" />
            : <LogIn size={13} color="#fff" />}
          <Text style={styles.actionPillText}>
            {isOut ? 'Iniciar Despacho' : 'Iniciar Recepción'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<typeof TAB_CHECKOUT | typeof TAB_CHECKIN>(TAB_CHECKOUT)
  const [search, setSearch] = useState('')
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const loadBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const result = await BookingService.getBookings(
        { statuses: ['paid', 'reserved', 'paidInFull', 'deposit', 'pending'] },
        1,
        100
      )
      setAllBookings(result.resultData ?? [])
    } catch (e: any) {
      console.error(e)
      setError('No se pudo conectar al servidor. Verifica la conexión.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // ── Filter logic ────────────────────────────────────────────────────────────
  // safeStr: always returns a searchable string regardless of API field shape
  const safeStr = (v: any): string => (typeof v === 'string' ? v : '')

  const filtered = allBookings
    .filter(activeTab === TAB_CHECKOUT ? isReadyForCheckout : isReadyForCheckin)
    .filter((b) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        safeStr(b.car?.licensePlate).toLowerCase().includes(q) ||
        safeStr(b.car?.name).toLowerCase().includes(q) ||
        safeStr(b.driver?.fullName).toLowerCase().includes(q)
      )
    })
    .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime()) // Closest first

  const checkoutCount = allBookings.filter(isReadyForCheckout).length
  const checkinCount = allBookings.filter(isReadyForCheckin).length

  const handleCardPress = (booking: Booking) => {
    const pathname = activeTab === TAB_CHECKOUT ? '/checkout' : '/checkin'
    router.push({ pathname: pathname as any, params: { bookingId: booking._id, plate: booking.car?.licensePlate ?? booking.car?.name } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header gradient */}
      <LinearGradient colors={['#1565c0', '#1976d2']} style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>LaborSync Flota</Text>
          <Text style={styles.headerTitle}>Panel de Operaciones</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadBookings(true)}>
          <RefreshCw size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_CHECKOUT && styles.tabActive]}
          onPress={() => setActiveTab(TAB_CHECKOUT)}
        >
          <LogOut size={16} color={activeTab === TAB_CHECKOUT ? '#1976d2' : '#9e9e9e'} />
          <Text style={[styles.tabText, activeTab === TAB_CHECKOUT && styles.tabTextActive]}>
            Despacho
          </Text>
          {checkoutCount > 0 && (
            <View style={[styles.badge, { backgroundColor: '#1976d2' }]}>
              <Text style={styles.badgeText}>{checkoutCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_CHECKIN && [styles.tabActive, styles.tabActiveGreen]]}
          onPress={() => setActiveTab(TAB_CHECKIN)}
        >
          <LogIn size={16} color={activeTab === TAB_CHECKIN ? '#2e7d32' : '#9e9e9e'} />
          <Text style={[styles.tabText, activeTab === TAB_CHECKIN && [styles.tabTextActive, { color: '#2e7d32' }]]}>
            Recepción
          </Text>
          {checkinCount > 0 && (
            <View style={[styles.badge, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.badgeText}>{checkinCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <Search size={18} color="#9e9e9e" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por placa, conductor o lugar…"
          placeholderTextColor="#bdbdbd"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#9e9e9e', fontSize: 18, lineHeight: 20 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Cargando reservas…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={48} color="#d32f2f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadBookings()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingCard booking={item} mode={activeTab} onPress={() => handleCardPress(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadBookings(true)} colors={['#1976d2']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{activeTab === TAB_CHECKOUT ? '🚗' : '🏁'}</Text>
              <Text style={styles.emptyTitle}>
                {search ? 'Sin resultados' : activeTab === TAB_CHECKOUT
                  ? 'No hay vehículos por despachar'
                  : 'No hay vehículos por recibir'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search ? `Sin coincidencias para "${search}"` : 'Todas las operaciones están al día'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faff' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1976d2' },
  tabActiveGreen: { borderBottomColor: '#2e7d32' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9e9e9e' },
  tabTextActive: { color: '#1976d2' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginVertical: 12, borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#e0e0e0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#212121', marginLeft: 10, height: 48 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  bookingCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  plateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  plateText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  cardDate: { fontSize: 12, color: '#9e9e9e', fontWeight: '500' },
  cardDriver: { fontSize: 14, color: '#424242', marginBottom: 2 },
  cardLabel: { color: '#9e9e9e', fontWeight: '400' },
  cardLocation: { fontSize: 12, color: '#9e9e9e', marginBottom: 10 },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  actionPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#757575', fontSize: 15 },
  errorText: { marginTop: 16, color: '#d32f2f', textAlign: 'center', fontSize: 15, lineHeight: 22 },
  retryBtn: { marginTop: 20, backgroundColor: '#1976d2', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#424242', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9e9e9e', textAlign: 'center' },
})
