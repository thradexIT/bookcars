import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        NEW_CLIENT_TYPE: 'Nouveau type de client',
        CLIENT_TYPE: 'Type de client',
    },
    en: {
        NEW_CLIENT_TYPE: 'New client type',
        CLIENT_TYPE: 'Client type',
    },
    es: {
        NEW_CLIENT_TYPE: 'Nuevo tipo de cliente',
        CLIENT_TYPE: 'Tipo de cliente',
    }
})

langHelper.setLanguage(strings as any)
export { strings }
