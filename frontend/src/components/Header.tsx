import React from 'react'
import MitosHeader from '@/components/MitosHeader'

interface HeaderProps {
  hidden?: boolean
  hideSignin?: boolean
  headerTitle?: string
}

/**
 * Backward-compatible public header boundary.
 *
 * Older customer pages may still import `Header`. They must never be able to
 * resurrect the legacy BookCars public shell, so this compatibility component
 * delegates every visible header to MitosHeader.
 */
const Header = ({
  hidden,
  hideSignin: _hideSignin,
  headerTitle: _headerTitle,
}: HeaderProps) => (hidden ? null : <MitosHeader />)

export default Header
