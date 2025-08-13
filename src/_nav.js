import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilEducation,
  cilBarChart,
  cilVideo,
  cilBadge,
  cilGroup,
  cilPeople,
  cilClipboard,
  cilContact,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // {
  //   component: CNavItem,
  //   name: 'Ranking',
  //   to: '/ranking',
  //   icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  // },
  {
    component: CNavTitle,
    name: 'E-opera X',
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
        to: '/consulta-atestados',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Ordens de Serviço',
    to: '/servicos',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Gestão de Usuários',
    to: '/usuarios',
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />
  },

  // {
  //   component: CNavTitle,
  //   name: 'Eopera Academy',
  // },
  // {
  //   component: CNavItem,
  //   name: 'Treinamentos',
  //   to: '/treinamentos',
  //   icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Conteúdos',
  //   icon: <CIcon icon={cilVideo} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Criar Cursos',
  //       to: '/criar-cursos',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Criar Questionários',
  //       to: '/criar-questionarios',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Turmas',
  //   to: '/turmas',
  //   icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Certificados',
  //   to: '/certificados',
  //   icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
  // },
]

export default _nav
