import React from 'react'

interface HeaderProps {
  hidden?: boolean
  hideSignin?: boolean
  headerTitle?: string
}

/**
 * Legacy compatibility shim.
 *
 * The public application shell (`AppLayout`) is the single authority for the
 * customer header and always renders `MitosHeader`. Some recovered pages may
 * still import this historical component directly; rendering anything here
 * would either resurrect the BookCars shell or duplicate the Mitos header.
 */
const Header = ({
  hidden: _hidden,
  hideSignin: _hideSignin,
  headerTitle: _headerTitle,
}: HeaderProps) => null

export default Header
