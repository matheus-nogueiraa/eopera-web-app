import React from 'react'
import ProtectedRoute from './components/ProtectedRoute'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Treinamentos = React.lazy(() => import('./views/treinamentos/treinamentos'))
const TreinamentoDetalhe = React.lazy(() => import('./views/treinamentos/TreinamentoDetalhe'))
const CriarCursos = React.lazy(() => import('./views/cursos/criarCursos'))
const CriarQuestionario = React.lazy(() => import('./views/questionarios/criarQuestionario'))
const Atestados = React.lazy(() => import('./views/atestados/Atestados'))
const ConsultaAtestados = React.lazy(() => import('./views/consulta-atestados/ConsultarAtestados'))
const Certificados = React.lazy(() => import('./views/certificados/Certificados'))
const Turmas = React.lazy(() => import('./views/turmas/Turmas'))
const Servicos = React.lazy(() => import('./views/serviços/servicos'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/ranking', name: 'Dashboard', element: () => <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/atestados', name: 'Atestados', element: () => <ProtectedRoute><Atestados /></ProtectedRoute> },
  { path: '/consulta-atestados', name: 'Consultar Atestados', element: () => <ProtectedRoute><ConsultaAtestados /></ProtectedRoute> },
  { path: '/servicos', name: 'Ordens de Serviço', element: () => <ProtectedRoute><Servicos /></ProtectedRoute> },
  // { path: '/treinamentos', name: 'Treinamentos', element: () => <ProtectedRoute><Treinamentos /></ProtectedRoute> },
  // { path: '/treinamentos/:id', name: 'Detalhe do Treinamento', element: () => <ProtectedRoute><TreinamentoDetalhe /></ProtectedRoute> },
  // { path: '/criar-cursos', name: 'Criar Cursos', element: () => <ProtectedRoute><CriarCursos /></ProtectedRoute> },
  // { path: '/criar-questionarios', name: 'Criar Questionários', element: () => <ProtectedRoute><CriarQuestionario /></ProtectedRoute> },
  // { path: '/certificados', name: 'Certificados', element: () => <ProtectedRoute><Certificados /></ProtectedRoute> },
  // { path: '/turmas', name: 'Turmas', element: () => <ProtectedRoute><Turmas /></ProtectedRoute> },
  // { path: '/meus-certificados', name: 'Meus Certificados', element: () => <ProtectedRoute><Certificados /></ProtectedRoute> },
]

export default routes
