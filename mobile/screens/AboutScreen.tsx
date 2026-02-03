import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, ScrollView, View, Image, TouchableOpacity, Linking } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useIsFocused } from '@react-navigation/native'

import i18n from '@/lang/i18n'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import * as helper from '@/utils/helper'

const AboutScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'About'>) => {
  const isFocused = useIsFocused()
  const [reload, setReload] = useState(false)
  const [visible, setVisible] = useState(false)

  const _init = async () => {
    setVisible(false)
    const language = await UserService.getLanguage()
    i18n.locale = language
    setVisible(true)
  }

  useEffect(() => {
    if (isFocused) {
      _init()
      setReload(true)
    } else {
      setVisible(false)
    }
  }, [route.params, isFocused])

  const onLoad = () => {
    setReload(false)
  }

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (error) {
      console.error('Error opening link:', error)
    }
  }

  const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  )

  return (
    <Layout style={styles.master} navigation={navigation} route={route} onLoad={onLoad} reload={reload}>
      {visible && (
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps={helper.android() ? 'handled' : 'always'}
        >
          {/* Logo y nombre de la app */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Rent a Car</Text>
            <Text style={styles.version}>Versión 1.0.0</Text>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acerca de Nosotros</Text>
            <Text style={styles.description}>
              Somos una plataforma líder en alquiler de vehículos, comprometidos con brindarte
              la mejor experiencia de movilidad. Con una amplia flota de vehículos y un servicio
              de excelencia, facilitamos tus desplazamientos de manera segura, cómoda y confiable.
            </Text>
          </View>

          {/* Características principales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características Principales</Text>

            <FeatureItem
              icon="🚗"
              title="Amplia Flota de Vehículos"
              description="Desde económicos hasta premium, encuentra el auto perfecto para ti"
            />

            <FeatureItem
              icon="📱"
              title="Reserva Fácil y Rápida"
              description="Alquila tu vehículo en minutos desde tu smartphone"
            />

            <FeatureItem
              icon="🔒"
              title="Seguro y Confiable"
              description="Todos nuestros vehículos cuentan con seguro completo"
            />

            <FeatureItem
              icon="💳"
              title="Pagos Seguros"
              description="Múltiples métodos de pago con tecnología encriptada"
            />
          </View>

          {/* Información de contacto y legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Legal</Text>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('ToS', { d: Date.now() })}
            >
              <Text style={styles.linkText}>Términos de Servicio</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleLinkPress('https://www.thradex.com/privacy')}
            >
              <Text style={styles.linkText}>Política de Privacidad</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleLinkPress('https://www.thradex.com/licenses')}
            >
              <Text style={styles.linkText}>Licencias de Código Abierto</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Redes sociales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Síguenos</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://facebook.com/rentacar')}
              >
                <Text style={styles.socialIcon}>📘</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://twitter.com/rentacar')}
              >
                <Text style={styles.socialIcon}>🐦</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://instagram.com/rentacar')}
              >
                <Text style={styles.socialIcon}>📷</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://linkedin.com/company/rentacar')}
              >
                <Text style={styles.socialIcon}>💼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Rent a Car</Text>
            <Text style={styles.footerText}>Hecho con ❤️ en Perú</Text>
          </View>
        </ScrollView>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  master: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 28,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
})

export default AboutScreen
