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
            <Text style={styles.title}>{i18n.t('TOS_TITLE')}</Text>
            <Text style={styles.date}>{i18n.t('TOS_DATE')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_1_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_1_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_2_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_2_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_3_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_3_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_4_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_4_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_5_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_5_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_6_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_6_CONTENT')}</Text>

            <Text style={styles.sectionTitle}>{i18n.t('TOS_SECTION_7_TITLE')}</Text>
            <Text style={styles.text}>{i18n.t('TOS_SECTION_7_CONTENT')}</Text>
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
