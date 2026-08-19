import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        DELETE_CLIENT_TYPE: 'Êtes-vous sûr de vouloir supprimer ce type de client ?',
        DELETE_CLIENT_TYPES: 'Êtes-vous sûr de vouloir supprimer ces types de clients ?',
        DELETE_SELECTION: 'Supprimer la sélection',
    },
    en: {
        DELETE_CLIENT_TYPE: 'Are you sure you want to delete this client type?',
        DELETE_CLIENT_TYPES: 'Are you sure you want to delete these client types?',
        DELETE_SELECTION: 'Delete selection',
    },
    es: {
        DELETE_CLIENT_TYPE: '¿Estás seguro de que quieres eliminar este tipo de cliente?',
        DELETE_CLIENT_TYPES: '¿Estás seguro de que quieres eliminar estos tipos de clientes?',
        DELETE_SELECTION: 'Eliminar selección',
    }
})

langHelper.setLanguage(strings as any)
export { strings }
