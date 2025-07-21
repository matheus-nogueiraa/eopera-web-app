import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Treinamentos = React.lazy(() => import('./views/treinamentos/treinamentos'))
const TreinamentoDetalhe = React.lazy(() => import('./views/treinamentos/TreinamentoDetalhe'))
const CriarCursos = React.lazy(() => import('./views/cursos/criarCursos'))
const CriarQuestionario = React.lazy(() => import('./views/questionarios/criarQuestionario'))
const Atestados = React.lazy(() => import('./views/atestados/Atestados'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/atestados', name: 'Atestados', element: Atestados },
  { path: '/treinamentos', name: 'Treinamentos', element: Treinamentos },
  { path: '/treinamentos/:id', name: 'Detalhe do Treinamento', element: TreinamentoDetalhe },
  { path: '/criar-cursos', name: 'Criar Cursos', element: CriarCursos },
  { path: '/criar-questionarios', name: 'Criar Questionários', element: CriarQuestionario },
]

export default routes
