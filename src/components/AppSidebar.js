import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CCardImage
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'



// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader className="border-bottom" style={{ display: 'flex', justifyContent: 'space-evenly', padding: '0.1rem' }}>
        <CSidebarBrand  to="/">
          <CCardImage src="src/assets/images/Elcop-academy.png" alt="Elcop Academy" style={{ width: 152, height: 152 }} />
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch({ type: 'set', sidebarShow: false })} />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
