import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, ScrollView, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import i18n from '@/lang/i18n'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import * as helper from '@/utils/helper'

const ToSScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'ToS'>) => {
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

  return (
    <Layout style={styles.master} navigation={navigation} route={route} onLoad={onLoad} reload={reload}>
      {visible && (
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps={helper.android() ? 'handled' : 'always'}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Términos de Servicio</Text>
            <Text style={styles.date}>Última actualización: Febrero 2026</Text>

            <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
            <Text style={styles.text}>
              Al acceder y utilizar esta aplicación, usted acepta estar sujeto a estos Términos de Servicio
              y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos
              términos, se le prohíbe usar o acceder a este servicio.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso del Servicio</Text>
            <Text style={styles.text}>
              Usted se compromete a utilizar el servicio únicamente para fines legales y de manera que no
              infrinja los derechos de terceros ni restrinja o inhiba el uso y disfrute del servicio por
              parte de terceros.
            </Text>

            <Text style={styles.sectionTitle}>3. Privacidad y Datos Personales</Text>
            <Text style={styles.text}>
              Su privacidad es importante para nosotros. Recopilamos, usamos y protegemos su información
              personal de acuerdo con nuestra Política de Privacidad. Al utilizar este servicio, usted
              consiente la recopilación y el uso de su información según lo descrito.
            </Text>

            <Text style={styles.sectionTitle}>4. Propiedad Intelectual</Text>
            <Text style={styles.text}>
              Todo el contenido incluido en esta aplicación, como texto, gráficos, logos, imágenes y
              software, es propiedad de la empresa o sus proveedores de contenido y está protegido por
              las leyes de derechos de autor.
            </Text>

            <Text style={styles.sectionTitle}>5. Limitación de Responsabilidad</Text>
            <Text style={styles.text}>
              En ningún caso la empresa será responsable por daños indirectos, incidentales, especiales
              o consecuentes que resulten del uso o la imposibilidad de usar el servicio.
            </Text>

            <Text style={styles.sectionTitle}>6. Modificaciones</Text>
            <Text style={styles.text}>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las
              modificaciones entrarán en vigor inmediatamente después de su publicación en la aplicación.
            </Text>

            <Text style={styles.sectionTitle}>7. Contacto</Text>
            <Text style={styles.text}>
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos a través de los
              canales de soporte proporcionados en la aplicación.
            </Text>
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
    paddingVertical: 30,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
    textAlign: 'justify',
  },
})

export default ToSScreen
