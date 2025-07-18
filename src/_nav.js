import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilEducation,
  cilBarChart,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />
  },
  {
    component: CNavTitle,
    name: 'Home',
  },
  {
    component: CNavGroup,
    name: 'Atestados',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Envio de atestado',
        to: '/atestados',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Treinamentos',
    to: '/treinamentos',
    icon: <CIcon icon={cilEducation} customClassName="nav-icon" />
  },
]

export default _nav
