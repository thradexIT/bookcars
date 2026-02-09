import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        UPDATE_CLIENT_TYPE_HEADING: 'Modifier le type de client',
        NAME: 'Nom',
        DISPLAY_NAME: 'Nom affiché',
        DESCRIPTION: 'Description',
        DISCOUNT: 'Réduction (%)',
        ACTIVE: 'Actif',
    },
    en: {
        UPDATE_CLIENT_TYPE_HEADING: 'Edit Client Type',
        NAME: 'Name',
        DISPLAY_NAME: 'Display Name',
        DESCRIPTION: 'Description',
        DISCOUNT: 'Discount (%)',
        ACTIVE: 'Active',
    },
    es: {
        UPDATE_CLIENT_TYPE_HEADING: 'Editar Tipo de Cliente',
        NAME: 'Nombre',
        DISPLAY_NAME: 'Nombre para mostrar',
        DESCRIPTION: 'Descripción',
        DISCOUNT: 'Descuento (%)',
        ACTIVE: 'Activo',
    }
})

langHelper.setLanguage(strings as any)
export { strings }
