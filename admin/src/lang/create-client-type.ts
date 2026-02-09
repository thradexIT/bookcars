import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        CREATE_CLIENT_TYPE_HEADING: 'Nouveau type de client',
        NAME: 'Nom',
        DISPLAY_NAME: 'Nom affiché',
        DESCRIPTION: 'Description',
        DISCOUNT: 'Réduction (%)',
        ACTIVE: 'Actif',
    },
    en: {
        CREATE_CLIENT_TYPE_HEADING: 'New Client Type',
        NAME: 'Name',
        DISPLAY_NAME: 'Display Name',
        DESCRIPTION: 'Description',
        DISCOUNT: 'Discount (%)',
        ACTIVE: 'Active',
    },
    es: {
        CREATE_CLIENT_TYPE_HEADING: 'Nuevo Tipo de Cliente',
        NAME: 'Nombre',
        DISPLAY_NAME: 'Nombre para mostrar',
        DESCRIPTION: 'Descripción',
        DISCOUNT: 'Descuento (%)',
        ACTIVE: 'Activo',
    }
})

langHelper.setLanguage(strings as any)
export { strings }
