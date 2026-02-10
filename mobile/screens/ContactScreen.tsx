import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Linking, Alert } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import i18n from '@/lang/i18n'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import * as helper from '@/utils/helper'

const ContactScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'Contact'>) => {
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

  const handleEmailPress = async () => {
    const email = 'support@yourapp.com'
    const subject = 'Consulta desde la aplicación'
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`

    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Error', 'No se pudo abrir el cliente de correo')
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar abrir el correo')
    }
  }

  const handlePhonePress = async () => {
    const phoneNumber = 'tel:+51999999999'

    try {
      const supported = await Linking.canOpenURL(phoneNumber)
      if (supported) {
        await Linking.openURL(phoneNumber)
      } else {
        Alert.alert('Error', 'No se pudo realizar la llamada')
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar realizar la llamada')
    }
  }

  const handleWebPress = async () => {
    const url = 'https://www.yourwebsite.com'

    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Error', 'No se pudo abrir el navegador')
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar abrir el sitio web')
    }
  }

  const ContactItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )

  return (
    <Layout style={styles.master} navigation={navigation} route={route} onLoad={onLoad} reload={reload}>
      {visible && (
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps={helper.android() ? 'handled' : 'always'}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('CONTACT_TITLE')}</Text>
            <Text style={styles.subtitle}>
              {i18n.t('CONTACT_SUBTITLE')}
            </Text>
          </View>

          <View style={styles.contactList}>
            <ContactItem
              icon="📧"
              title={i18n.t('CONTACT_EMAIL')}
              subtitle="soporte@thradex.com"
              onPress={handleEmailPress}
            />

            <ContactItem
              icon="📱"
              title={i18n.t('CONTACT_PHONE')}
              subtitle="+51 933075200"
              onPress={handlePhonePress}
            />

            <ContactItem
              icon="🌐"
              title={i18n.t('CONTACT_WEBSITE')}
              subtitle="www.thradex.com"
              onPress={handleWebPress}
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{i18n.t('CONTACT_SCHEDULE_TITLE')}</Text>
            <Text style={styles.infoText}>{i18n.t('CONTACT_SCHEDULE_WEEKDAYS')}</Text>
            <Text style={styles.infoText}>{i18n.t('CONTACT_SCHEDULE_SATURDAY')}</Text>
            <Text style={styles.infoText}>{i18n.t('CONTACT_SCHEDULE_SUNDAY')}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{i18n.t('CONTACT_LOCATION_TITLE')}</Text>
            <Text style={styles.infoText}>{i18n.t('CONTACT_LOCATION_CITY')}</Text>
            <Text style={styles.infoText}>{i18n.t('CONTACT_LOCATION_ADDRESS')}</Text>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  contactList: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
})

export default ContactScreen
