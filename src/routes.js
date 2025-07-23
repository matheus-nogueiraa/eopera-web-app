import React from 'react'
import ProtectedRoute from './components/ProtectedRoute'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Treinamentos = React.lazy(() => import('./views/treinamentos/treinamentos'))
const TreinamentoDetalhe = React.lazy(() => import('./views/treinamentos/TreinamentoDetalhe'))
const CriarCursos = React.lazy(() => import('./views/cursos/criarCursos'))
const CriarQuestionario = React.lazy(() => import('./views/questionarios/criarQuestionario'))
const Atestados = React.lazy(() => import('./views/atestados/Atestados'))
const ConsultaAtestados = React.lazy(() => import('./views/atestados/consulta-atestados/ConsultarAtestados'))
const Certificados = React.lazy(() => import('./views/certificados/certificados'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: () => <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/atestados', name: 'Atestados', element: () => <ProtectedRoute><Atestados /></ProtectedRoute> },
  { path: '/treinamentos', name: 'Treinamentos', element: () => <ProtectedRoute><Treinamentos /></ProtectedRoute> },
  { path: '/atestados/consulta-atestados', name: 'Consultar Atestados', element: () => <ProtectedRoute><ConsultaAtestados /></ProtectedRoute> },
  { path: '/treinamentos/:id', name: 'Detalhe do Treinamento', element: () => <ProtectedRoute><TreinamentoDetalhe /></ProtectedRoute> },
  { path: '/criar-cursos', name: 'Criar Cursos', element: () => <ProtectedRoute><CriarCursos /></ProtectedRoute> },
  { path: '/criar-questionarios', name: 'Criar Questionários', element: () => <ProtectedRoute><CriarQuestionario /></ProtectedRoute> },
  { path: '/meus-certificados', name: 'Meus Certificados', element: () => <ProtectedRoute><Certificados /></ProtectedRoute> },
]

export default routes
