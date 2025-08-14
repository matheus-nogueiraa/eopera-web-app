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
  cilHome
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // {
  //   component: CNavItem,
  //   name: 'Ranking',
  //   to: '/ranking',
  //   icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  //   requiresPermission: true, // Adicione esta linha para rotas que precisam de permissão
  // },
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    // Home é pública - não precisa de requiresPermission
  },
  {
    component: CNavTitle,
    name: 'E-opera X',
  },
  {
    component: CNavGroup,
    name: 'Atestados',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    // Grupo é público - não precisa de requiresPermission
    items: [
      {
        component: CNavItem,
        name: 'Enviar atestados',
        to: '/atestados',
        // Público - não precisa de requiresPermission
      },
      {
        component: CNavItem,
        name: 'Consultar atestados',
        to: '/consulta-atestados',
        // Público - não precisa de requiresPermission
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Ordens de Serviço',
    to: '/servicos',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    requiresPermission: true, // Esta rota precisa de permissão
  },
  {
    component: CNavItem,
    name: 'Painel de controle',
    to: '/usuarios',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    requiresPermission: true, // Esta rota precisa de permissão
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
  //   requiresPermission: true, // Descomente e adicione esta linha quando ativar
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Conteúdos',
  //   icon: <CIcon icon={cilVideo} customClassName="nav-icon" />,
  //   requiresPermission: true, // Para grupos, verifica se pelo menos um item filho é permitido
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Criar Cursos',
  //       to: '/criar-cursos',
  //       requiresPermission: true,
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Criar Questionários',
  //       to: '/criar-questionarios',
  //       requiresPermission: true,
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Turmas',
  //   to: '/turmas',
  //   icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  //   requiresPermission: true,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Certificados',
  //   to: '/certificados',
  //   icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
  //   requiresPermission: true,
  // },
]

// Função para filtrar navegação baseada em permissões
export const filterNavigationByPermissions = (navigation, rotasPermitidas) => {
  const isRouteAllowed = (route) => {
    // Rotas públicas (sem requiresPermission) são sempre permitidas
    if (!route.requiresPermission) {
      return true
    }
    
    // Para rotas com requiresPermission, verificar se está nas rotas permitidas
    if (route.to) {
      return rotasPermitidas.includes(route.to)
    }
    
    return false
  }

  const filterItem = (item) => {
    // Se é um grupo
    if (item.items) {
      // Filtrar os itens filhos primeiro
      const filteredItems = item.items
        .map(filterItem)
        .filter(subItem => subItem !== null)
      
      // Se não sobrou nenhum item filho, não mostrar o grupo
      if (filteredItems.length === 0) {
        return null
      }
      
      // Se o grupo em si requer permissão, verificar
      if (item.requiresPermission && !isRouteAllowed(item)) {
        return null
      }
      
      // Retornar o grupo com os itens filtrados
      return {
        ...item,
        items: filteredItems
      }
    }
    
    // Se é um item simples
    if (!isRouteAllowed(item)) {
      return null
    }
    
    return item
  }

  return navigation
    .map(filterItem)
    .filter(item => item !== null)
}

export default _nav
