import React, { useEffect, useState } from 'react'
import {
  CarRental as SupplierIcon,
  Cookie as CookieIcon,
  EventSeat as BookingsIcon,
  ExitToApp as LogoutIcon,
  Feed as TermsIcon,
  Home as HomeIcon,
  InfoOutlined as AboutIcon,
  Language,
  LocationOn as LocationIcon,
  Login as LoginIcon,
  Mail as ContactIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  PersonOutline as PersonIcon,
  PrivacyTip as PrivacyIcon,
  QuestionAnswer as HelpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import env from '@/config/env.config'
import { mitosBrand } from '@/config/mitosBrand'
import { NotificationContextType, useNotificationContext } from '@/context/NotificationContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import * as UserService from '@/services/UserService'
import '@/assets/css/mitos-header.css'

type DrawerLink = {
  label: string
  path: string
  icon: React.ReactNode
  visible?: boolean
}

const MitosHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userLoaded } = useUserContext() as UserContextType
  const { notificationCount } = useNotificationContext() as NotificationContextType
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const isHome = location.pathname === '/'
  const isSearch = location.pathname === '/search'
  const isSignedIn = userLoaded && Boolean(user)

  useEffect(() => {
    document.title = mitosBrand.name
    setDrawerOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  const goToSection = (id: string) => {
    if (!isHome) {
      navigate('/')
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const goToSearch = () => goToSection('mitos-search')

  const goTo = (path: string) => {
    setDrawerOpen(false)
    setAccountOpen(false)
    navigate(path)
  }

  const handleSignOut = async () => {
    setAccountOpen(false)
    setDrawerOpen(false)
    await UserService.signout(true, false)
  }

  const drawerLinks: DrawerLink[] = [
    { label: 'Inicio', path: '/', icon: <HomeIcon fontSize="small" /> },
    { label: 'Mis reservas', path: '/bookings', icon: <BookingsIcon fontSize="small" />, visible: isSignedIn },
    { label: 'Proveedores', path: '/suppliers', icon: <SupplierIcon fontSize="small" />, visible: !env.HIDE_SUPPLIERS },
    { label: 'Sedes', path: '/locations', icon: <LocationIcon fontSize="small" /> },
    { label: 'Nosotros', path: '/about', icon: <AboutIcon fontSize="small" /> },
    { label: 'Preguntas frecuentes', path: '/faq', icon: <HelpIcon fontSize="small" /> },
    { label: 'Contacto', path: '/contact', icon: <ContactIcon fontSize="small" /> },
    { label: 'Privacidad', path: '/privacy', icon: <PrivacyIcon fontSize="small" /> },
    { label: 'Términos', path: '/tos', icon: <TermsIcon fontSize="small" /> },
    { label: 'Cookies', path: '/cookie-policy', icon: <CookieIcon fontSize="small" /> },
  ]

  return (
    <>
      <header className="mitos-topbar">
        <div className="mitos-topbar-brand">
          <button
            className="mitos-menu-toggle"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </button>
          <button
            className="mitos-topbar-logo"
            type="button"
            aria-label="Mitos Rent a Car - Inicio"
            onClick={() => goToSection('inicio')}
          />
        </div>

        <nav className="mitos-topbar-nav" aria-label="Navegación principal">
          <button type="button" className={isHome ? 'is-active' : ''} onClick={() => goToSection('inicio')}>Inicio</button>
          <button type="button" className={isSearch ? 'is-active' : ''} onClick={() => goToSection('vehiculos')}>Vehículos</button>
          <button type="button" onClick={() => goToSection('como-funciona')}>Cómo funciona</button>
          <button type="button" onClick={() => goToSection('promociones')}>Viajes</button>
          <button type="button" onClick={() => goToSection('preguntas')}>FAQ</button>
          <button type="button" onClick={() => goToSection('contacto')}>Contacto</button>
        </nav>

        <div className="mitos-topbar-actions">
          <button type="button" className="mitos-language" aria-label="Idioma español">
            <Language fontSize="small" /> ES <span>⌄</span>
          </button>

          {userLoaded && !isSignedIn && (
            <div className="mitos-auth-actions" aria-label="Acceso de cliente">
              <button type="button" className="mitos-auth-link" onClick={() => goTo('/sign-up')}>
                <PersonIcon fontSize="small" />
                Registrarse
              </button>
              <button type="button" className="mitos-auth-link mitos-auth-link-primary" onClick={() => goTo('/sign-in')}>
                <LoginIcon fontSize="small" />
                Iniciar sesión
              </button>
            </div>
          )}

          {isSignedIn && (
            <div className="mitos-customer-actions">
              <button
                type="button"
                className="mitos-icon-action"
                aria-label={notificationCount > 0 ? `${notificationCount} notificaciones` : 'Notificaciones'}
                onClick={() => goTo('/notifications')}
              >
                <NotificationsIcon fontSize="small" />
                {notificationCount > 0 && <span className="mitos-notification-count">{notificationCount}</span>}
              </button>

              <button type="button" className="mitos-bookings-link" onClick={() => goTo('/bookings')}>
                <BookingsIcon fontSize="small" />
                Mis reservas
              </button>

              <div className="mitos-account-wrap">
                <button
                  type="button"
                  className="mitos-account-button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <PersonIcon fontSize="small" />
                  Mi cuenta
                  <span>⌄</span>
                </button>

                {accountOpen && (
                  <div className="mitos-account-menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => goTo('/settings')}>
                      <SettingsIcon fontSize="small" />
                      Configuración
                    </button>
                    <button type="button" role="menuitem" onClick={handleSignOut}>
                      <LogoutIcon fontSize="small" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="button" className="mitos-search-nav" onClick={goToSearch}>
            {isSearch ? 'Nueva búsqueda' : 'Buscar auto'}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="mitos-drawer-backdrop" role="presentation" onClick={() => setDrawerOpen(false)}>
          <aside
            className="mitos-drawer"
            aria-label="Menú Mitos"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mitos-drawer-head">
              <div className="mitos-drawer-logo" aria-label="Mitos Rent a Car" />
              <button type="button" aria-label="Cerrar menú" onClick={() => setDrawerOpen(false)}>×</button>
            </div>

            <nav className="mitos-drawer-nav">
              {drawerLinks
                .filter((link) => link.visible !== false)
                .map((link) => (
                  <button key={link.path} type="button" onClick={() => goTo(link.path)}>
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                ))}
            </nav>

            {!isSignedIn && userLoaded && (
              <div className="mitos-drawer-auth">
                <button type="button" onClick={() => goTo('/sign-up')}>
                  <PersonIcon fontSize="small" />
                  Registrarse
                </button>
                <button type="button" className="is-primary" onClick={() => goTo('/sign-in')}>
                  <LoginIcon fontSize="small" />
                  Iniciar sesión
                </button>
              </div>
            )}

            {isSignedIn && (
              <div className="mitos-drawer-auth">
                <button type="button" onClick={() => goTo('/settings')}>
                  <SettingsIcon fontSize="small" />
                  Configuración
                </button>
                <button type="button" onClick={handleSignOut}>
                  <LogoutIcon fontSize="small" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

export default MitosHeader
