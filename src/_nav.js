import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilEducation,
  cilBarChart,
  cilVideo,
  cilBadge
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
        name: 'Enviar atestados',
        to: '/atestados',
      },

      {
        component: CNavItem,
        name: 'Consultar atestados',
        to: '/atestados/consulta-atestados',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Treinamentos',
    to: '/treinamentos',
    icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
  },
   {
    component: CNavItem,
    name: "Meus Certificados",
    to: "/meus-certificados",
    icon: <CIcon icon={cilBadge} customClassName="nav-icon"/>
  },
   {
    component: CNavTitle,
    name: 'Cadastros',
  },
  {
    component: CNavGroup,
    name: 'Conteúdos',
    icon: <CIcon icon={cilVideo} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Criar Cursos',
        to: '/criar-cursos',
      },
      {
        component: CNavItem,
        name: 'Criar Questionários',
        to: '/criar-questionarios',
      },
    ],
  },
  {
    component: CNavItem,
    name: "Certificados",
    to: "/certificados",
    icon: <CIcon icon={cilBadge} customClassName="nav-icon"/>
  }

]

export default _nav
