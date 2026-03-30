import React, { useState } from 'react'
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as UserService from '@/services/UserService'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      const user = await UserService.signIn({ email: email.trim(), password })
      if (user?.accessToken) {
        router.replace('/(tabs)')
      } else {
        Alert.alert('Acceso denegado', 'Credenciales incorrectas o cuenta no activa.')
      }
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.status === 204
        ? 'Credenciales incorrectas o cuenta no autorizada.'
        : 'No se pudo conectar al servidor. Verifica tu red.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#1565c0', '#1976d2', '#42a5f5']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Logo / Brand */}
            <View style={styles.brand}>
              <Text style={styles.brandIcon}>🚗</Text>
              <Text style={styles.brandName}>LaborSync</Text>
              <Text style={styles.brandSubtitle}>Control de Flota Vehicular</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>Accede con tu cuenta de operador</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="operador@empresa.com"
                  placeholderTextColor="#bdbdbd"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#bdbdbd"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.loginBtnText}>Ingresar</Text>
                }
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>LaborSync v1.0 — Acceso solo para operadores autorizados</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  brandIcon: { fontSize: 64, marginBottom: 12 },
  brandName: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  brandSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#212121', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9e9e9e', marginBottom: 28 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 8 },
  input: {
    backgroundColor: '#f8faff', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 12, padding: 16, fontSize: 16, color: '#212121',
  },
  loginBtn: {
    backgroundColor: '#1976d2', borderRadius: 12, padding: 18,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#1976d2', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loginBtnDisabled: { backgroundColor: '#90caf9', shadowOpacity: 0 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 24 },
})
