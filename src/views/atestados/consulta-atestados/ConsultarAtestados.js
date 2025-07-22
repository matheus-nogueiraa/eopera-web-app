import React, { useRef, useState } from 'react'

import './ConsultarAtestados.css'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CFormFeedback,
  CInputGroup,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCheckCircle, cilClock, cilXCircle, cilZoomIn } from '@coreui/icons'

const ConsultaAtestados = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    status: '',
    tipificacao: '',
  })

  const dataInicioRef = useRef(null)
  const dataFimRef = useRef(null)

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(10) // Número de itens por página

  const [atestados, setAtestados] = useState([
    // Dados de exemplo - substitua por dados reais da API
    {
      id: 1,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2025-07-15',
      dataFim: '2025-07-17',
      dias: 3,
      medico: 'Dr. João Silva',
      status: 'Aprovado',
      dataEnvio: '2025-07-15',
    },
    {
      id: 2,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2025-07-01',
      dataFim: '2025-09-30',
      dias: 90,
      medico: 'Dra. Ana Paula',
      status: 'Em Análise',
      dataEnvio: '2025-07-01',
    },
    {
      id: 3,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2025-07-05',
      dataFim: '2025-07-09',
      dias: 5,
      medico: 'Dr. Carlos Oliveira',
      status: 'Rejeitado',
      dataEnvio: '2025-07-05',
      motivoRejeicao: 'Documento ilegível ou incompleto',
    },
    {
      id: 4,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Doença',
      dataInicio: '2025-06-10',
      dataFim: '2025-06-12',
      dias: 3,
      medico: 'Dr. Maria Santos',
      status: 'Aprovado',
      dataEnvio: '2025-06-10',
    },
    {
      id: 5,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2025-06-20',
      dataFim: '2025-06-20',
      dias: 1,
      medico: 'Dr. Pedro Costa',
      status: 'Cancelado',
      dataEnvio: '2025-06-20',
      motivoCancelamento: 'Cancelado pelo usuário',
    },
    {
      id: 6,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2025-05-15',
      dataFim: '2025-05-20',
      dias: 6,
      medico: 'Dra. Fernanda Lima',
      status: 'Aprovado',
      dataEnvio: '2025-05-15',
    },
    {
      id: 7,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2025-04-01',
      dataFim: '2025-04-05',
      dias: 5,
      medico: 'Dr. Lucas Almeida',
      status: 'Em Análise',
      dataEnvio: '2025-04-01',
    },
    {
      id: 8,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Licença maternidade',
      dataInicio: '2025-03-10',
      dataFim: '2025-03-15',
      dias: 6,
      medico: 'Dra. Juliana Rocha',
      status: 'Rejeitado',
      dataEnvio: '2025-03-10',
    },
    {
      id: 9,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2025-02-20',
      dataFim: '2025-02-25',
      dias: 6,
      medico: 'Dr. André Souza',
      status: 'Aprovado',
      dataEnvio: '2025-02-20',
    },
    {
      id: 10,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Doença',
      dataInicio: '2025-01-05',
      dataFim: '2025-01-10',
      dias: 6,
      medico: 'Dra. Camila Pereira',
      status: 'Cancelado',
      dataEnvio: '2025-01-05',
    },
    {
      id: 11,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2024-12-15',
      dataFim: '2025-01-15',
      dias: 32,
      medico: 'Dr. Rafael Martins',
      status: 'Aprovado',
      dataEnvio: '2024-12-15',
    },
    {
      id: 12,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2024-11-01',
      dataFim: '2024-11-05',
      dias: 5,
      medico: 'Dra. Beatriz Costa',
      status: 'Em Análise',
      dataEnvio: '2024-11-01',
    },
    {
      id: 13,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2024-10-10',
      dataFim: '2024-10-15',
      dias: 6,
      medico: 'Dr. Tiago Silva',
      status: 'Rejeitado',
      dataEnvio: '2024-10-10',
    },
    {
      id: 14,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Licença maternidade',
      dataInicio: '2024-09-20',
      dataFim: '2024-09-25',
      dias: 6,
      medico: 'Dra. Larissa Souza',
      status: 'Aprovado',
      dataEnvio: '2024-09-20',
    },
    {
      id: 15,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2024-08-05',
      dataFim: '2024-08-10',
      dias: 6,
      medico: 'Dr. Gustavo Almeida',
      status: 'Cancelado',
      dataEnvio: '2024-08-05',
    },
    {
      id: 16,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Doença',
      dataInicio: '2024-07-15',
      dataFim: '2024-07-20',
      dias: 6,
      medico: 'Dra. Mariana Costa',
      status: 'Aprovado',
      dataEnvio: '2024-07-15',
    },
    {
      id: 17,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2024-06-01',
      dataFim: '2024-06-05',
      dias: 5,
      medico: 'Dr. Felipe Santos',
      status: 'Em Análise',
      dataEnvio: '2024-06-01',
    },
    {
      id: 18,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2024-05-10',
      dataFim: '2024-05-15',
      dias: 6,
      medico: 'Dra. Paula Rocha',
      status: 'Rejeitado',
      dataEnvio: '2024-05-10',
    },
    {
      id: 19,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2024-04-20',
      dataFim: '2024-04-25',
      dias: 6,
      medico: 'Dr. Lucas Pereira',
      status: 'Aprovado',
      dataEnvio: '2024-04-20',
    },
    {
      id: 20,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Licença maternidade',
      dataInicio: '2024-03-05',
      dataFim: '2024-03-10',
      dias: 6,
      medico: 'Dra. Ana Lima',
      status: 'Cancelado',
      dataEnvio: '2024-03-05',
    },
    {
      id: 21,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2024-02-15',
      dataFim: '2024-02-18',
      dias: 4,
      medico: 'Dr. Roberto Nascimento',
      status: 'Aprovado',
      dataEnvio: '2024-02-15',
    },
    {
      id: 22,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2024-01-20',
      dataFim: '2024-01-25',
      dias: 6,
      medico: 'Dra. Patricia Moreira',
      status: 'Rejeitado',
      dataEnvio: '2024-01-20',
      motivoRejeicao: 'Assinatura médica ilegível',
    },
    {
      id: 23,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2023-12-01',
      dataFim: '2024-02-29',
      dias: 90,
      medico: 'Dr. Eduardo Silva',
      status: 'Aprovado',
      dataEnvio: '2023-12-01',
    },
    {
      id: 24,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Doença',
      dataInicio: '2023-11-10',
      dataFim: '2023-11-12',
      dias: 3,
      medico: 'Dra. Vanessa Costa',
      status: 'Em Análise',
      dataEnvio: '2023-11-10',
    },
    {
      id: 25,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2023-10-25',
      dataFim: '2023-10-30',
      dias: 6,
      medico: 'Dr. Marcos Oliveira',
      status: 'Cancelado',
      dataEnvio: '2023-10-25',
      motivoCancelamento: 'Retorno antecipado ao trabalho',
    },
    {
      id: 26,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Licença maternidade',
      dataInicio: '2023-09-05',
      dataFim: '2023-09-08',
      dias: 4,
      medico: 'Dra. Cristina Ferreira',
      status: 'Aprovado',
      dataEnvio: '2023-09-05',
      motivoCancelamento: 'Retorno antecipado ao trabalho',
    },
    {
      id: 27,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2023-08-12',
      dataFim: '2023-08-16',
      dias: 5,
      medico: 'Dr. Alexandre Santos',
      status: 'Rejeitado',
      dataEnvio: '2023-08-12',
      motivoRejeicao: 'Data de validade do atestado expirada',
    },
    {
      id: 28,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2023-07-18',
      dataFim: '2023-07-22',
      dias: 5,
      medico: 'Dra. Monica Ribeiro',
      status: 'Aprovado',
      dataEnvio: '2023-07-18',
    },
    {
      id: 29,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2023-06-02',
      dataFim: '2023-06-04',
      dias: 3,
      medico: 'Dr. Fernando Alves',
      status: 'Em Análise',
      dataEnvio: '2023-06-02',
    },
    {
      id: 30,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Doença',
      dataInicio: '2023-05-08',
      dataFim: '2023-05-12',
      dias: 5,
      medico: 'Dra. Claudia Martins',
      status: 'Cancelado',
      dataEnvio: '2023-05-08',
      motivoCancelamento: 'Solicitação de cancelamento pelo funcionário',
    },
    {
      id: 31,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2023-04-14',
      dataFim: '2023-04-20',
      dias: 7,
      medico: 'Dr. Henrique Lima',
      status: 'Aprovado',
      dataEnvio: '2023-04-14',
    },
    {
      id: 32,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Licença maternidade',
      dataInicio: '2023-03-22',
      dataFim: '2023-03-26',
      dias: 5,
      medico: 'Dra. Isabela Rocha',
      status: 'Rejeitado',
      dataEnvio: '2023-03-22',
      motivoRejeicao: 'CRM do médico não localizado',
    },
    {
      id: 33,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Doença',
      dataInicio: '2023-02-28',
      dataFim: '2023-03-03',
      dias: 4,
      medico: 'Dr. Gabriel Souza',
      status: 'Aprovado',
      dataEnvio: '2023-02-28',
    },
    {
      id: 34,
      tipificacao: 'Atestado Odontológico',
      especificacao: 'Acidente de trabalho',
      dataInicio: '2023-01-15',
      dataFim: '2023-01-18',
      dias: 4,
      medico: 'Dra. Leticia Pereira',
      status: 'Em Análise',
      dataEnvio: '2023-01-15',
    },
    {
      id: 35,
      tipificacao: 'Atestado de Saúde',
      especificacao: 'Licença maternidade',
      dataInicio: '2022-12-10',
      dataFim: '2023-03-10',
      dias: 90,
      medico: 'Dr. Diego Costa',
      status: 'Cancelado',
      dataEnvio: '2022-12-10',
      motivoCancelamento: 'Mudança de empresa',
    },

    // Adicionar mais atestados conforme necessário
  ])

  // Adicionar estado para os dados filtrados
  const [atestadosFiltrados, setAtestadosFiltrados] = useState([])

  // Adicionar estado para controlar se a busca foi realizada
  const [buscaRealizada, setBuscaRealizada] = useState(false)

  // Função para calcular os itens da página atual
  const calcularItensPagina = () => {
    const indiceInicial = (paginaAtual - 1) * itensPorPagina
    const indiceFinal = indiceInicial + itensPorPagina
    return atestadosFiltrados.slice(indiceInicial, indiceFinal)
  }

  // Função para calcular o número total de páginas
  const calcularTotalPaginas = () => {
    return Math.ceil(atestadosFiltrados.length / itensPorPagina)
  }

  // Função para mudar de página
  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina)
  }

  // Gerar números das páginas para exibição
  const gerarNumerosPaginas = () => {
    const totalPaginas = calcularTotalPaginas()
    const numeros = []

    for (let i = 1; i <= totalPaginas; i++) {
      numeros.push(i)
    }

    return numeros
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // Função para filtrar os atestados
  const filtrarAtestados = (dados, filtros) => {
    return dados.filter((atestado) => {
      // Filtro por status
      if (filtros.status && atestado.status !== filtros.status) {
        return false
      }

      // Filtro por tipificação
      if (filtros.tipificacao && atestado.tipificacao !== filtros.tipificacao) {
        return false
      }

      // Filtro por especificação
      if (filtros.especificacao && atestado.especificacao !== filtros.especificacao) {
        return false
      }

      // Filtro por data início
      if (filtros.dataInicio) {
        const dataInicioAtestado = new Date(atestado.dataInicio)
        const dataInicioFiltro = new Date(filtros.dataInicio)
        if (dataInicioAtestado < dataInicioFiltro) {
          return false
        }
      }

      // Filtro por data final
      if (filtros.dataFim) {
        const dataFimAtestado = new Date(atestado.dataFim)
        const dataFimFiltro = new Date(filtros.dataFim)
        if (dataFimAtestado > dataFimFiltro) {
          return false
        }
      }

      return true
    })
  }

  const buscarAtestados = () => {
    console.log('Buscando atestados com filtros:', filtros)

    // Filtrar os atestados baseado nos filtros
    const resultados = filtrarAtestados(atestados, filtros)
    setAtestadosFiltrados(resultados)

    // Definir que a busca foi realizada
    setBuscaRealizada(true)

    // Resetar para a primeira página
    setPaginaAtual(1)

    // Limpar os filtros após a busca
    setFiltros({
      dataInicio: '',
      dataFim: '',
      status: '',
      tipificacao: '',
      especificacao: '',
    })
  }

  const expandirCalendario = (ref) => {
    if (ref.current) {
      ref.current.showPicker()
    }
  }

  const getStatusConfig = (status) => {
    const statusConfig = {
      Aprovado: {
        color: 'success',
        icon: cilCheckCircle,
        text: 'Aprovado',
      },
      'Em Análise': {
        color: 'warning',
        icon: cilClock,
        text: 'Em Análise',
      },
      Rejeitado: {
        color: 'danger',
        icon: cilXCircle,
        text: 'Rejeitado',
      },

      Cancelado: {
        color: 'secondary',
        icon: cilXCircle,
        text: 'Cancelado',
      },
    }
    return statusConfig[status] || { color: 'secondary', icon: null, text: status }
  }

  const renderStatus = (status) => {
    const config = getStatusConfig(status)
    return (
      <CBadge
        color={config.color}
        className="d-flex align-items-center gap-1 justify-content-center"
      >
        {config.icon && <CIcon icon={config.icon} size="sm" />}
        {config.text}
      </CBadge>
    )
  }

  const visualizarAtestado = (atestado) => {
    // Implementar lógica para visualizar detalhes do atestado
    console.log('Visualizando atestado:', atestado)
    // Você pode abrir um modal, navegar para outra página, etc.
    alert(`Visualizando atestado ID: ${atestado.id}`)
  }

  const getMotivoTexto = (atestado) => {
    switch (atestado.status) {
      case 'Aprovado':
        return 'Atestado dentro dos parâmetros'
      case 'Em Análise':
        return 'Analisando parâmetros do atestado'
      case 'Rejeitado':
        return atestado.motivoRejeicao || 'Motivo não informado'
      case 'Cancelado':
        return atestado.motivoCancelamento || 'Motivo não informado'
      default:
        return atestado.motivo || ''
    }
  }

  // Obter itens da página atual
  const itensPaginaAtual = calcularItensPagina()
  const totalPaginas = calcularTotalPaginas()

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Consultar Atestados Enviados</h1>
      </div>

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Atestados Encontrados</h6>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">

                {/* Filtros de busca */}
                <CCol md={2}>
                  <CFormLabel htmlFor="status">Status:</CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    id="status"
                    value={filtros.status}
                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Rejeitado">Rejeitado</option>
                    <option value="Cancelado">Cancelado</option>
                  </CFormSelect>
                </CCol>

                {/* Tipificação de atestado */}
                <CCol md={3}>
                  <CFormLabel htmlFor="tipificacao">Tipificação:</CFormLabel>
                  <CFormSelect
                    id="tipificacao"
                    value={filtros.tipificacao}
                    onChange={(e) => handleFiltroChange('tipificacao', e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="Atestado de Saúde">Atestado de Saúde.</option>
                    <option value="Atestado Odontológico">Atestado Odontológico.</option>
                  </CFormSelect>
                </CCol>

                {/* Especificação do atestado */}
                <CCol md={3}>
                  <CFormLabel htmlFor="especificacao">Especificação:</CFormLabel>
                  <CFormSelect
                    id="especificacao"
                    value={filtros.especificacao}
                    onChange={(e) => handleFiltroChange('especificacao', e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="Doença">Doença</option>
                    <option value="Acidente de trabalho">Acidente de trabalho</option>
                    <option value="Licença maternidade">Licença maternidade</option>
                  </CFormSelect>
                </CCol>

                {/* Filtro de data inicial */}
                <CCol md={2}>
                  <CFormLabel htmlFor="dataInicio">Data Início:</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="date"
                      id="dataInicio"
                      ref={dataInicioRef}
                      value={filtros.dataInicio}
                      onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                      onClick={() => expandirCalendario(dataInicioRef)}
                    />
                  </CInputGroup>
                </CCol>

                {/* Filtro de data final */}
                <CCol md={2}>
                  <CFormLabel htmlFor="dataFim">Data Final:</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="date"
                      id="dataFim"
                      ref={dataFimRef}
                      value={filtros.dataFim}
                      onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                      onClick={() => expandirCalendario(dataFimRef)}
                    />
                  </CInputGroup>
                </CCol>

                {/* Botão de busca */}
                <CCol md={12} className="text-center">
                  <CButton
                    size="md"
                    type="button"
                    color="primary"
                    className="w-100"
                    onClick={buscarAtestados}
                  >
                    <CIcon icon={cilSearch} className="me-1" />
                    Buscar
                  </CButton>
                </CCol>
              </CRow>
              <hr />

              {/* Condicionar a exibição da tabela ao estado buscaRealizada */}
              {!buscaRealizada ? (
                <div className="text-center py-4">
                  <p className="text-muted">Clique em "Buscar" para visualizar os atestados.</p>
                </div>
              ) : atestadosFiltrados.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Nenhum atestado encontrado com os filtros aplicados.</p>
                </div>
              ) : (
                <>
                  {/* Informações de resultados */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">
                      Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{' '}
                      {Math.min(paginaAtual * itensPorPagina, atestadosFiltrados.length)} de{' '}
                      {atestadosFiltrados.length} resultados
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th>Status:</th>
                          <th>Tipificação:</th>
                          <th>Especificação:</th>
                          <th>Dias:</th>
                          <th>Data Início:</th>
                          <th>Data Final:</th>
                          <th>Motivo:</th>
                          <th>Anexo:</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensPaginaAtual.map((atestado) => (
                          <tr key={atestado.id}>
                            <td className="text-center">{renderStatus(atestado.status)}</td>
                            <td>{atestado.tipificacao}</td>
                            <td>{atestado.especificacao}</td>
                            <td className="text-center">{atestado.dias}</td>
                            <td className="text-center">
                              {new Date(atestado.dataInicio).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="text-center">
                              {new Date(atestado.dataFim).toLocaleDateString('pt-BR')}
                            </td>
                            <td>{getMotivoTexto(atestado)}</td>
                            <td className="text-center">
                              <CButton
                                size="sm"
                                color="primary"
                                variant="outline"
                                className="mx-auto"
                                title="Visualizar detalhes do atestado"
                                onClick={() => visualizarAtestado(atestado)}
                              >
                                <CIcon icon={cilZoomIn} size="sm" />
                                Visualizar
                              </CButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="d-flex justify-content-end mt-3 mb-2">
                      <CPagination aria-label="Navegação de páginas">
                        <CPaginationItem
                          aria-label="Anterior"
                          disabled={paginaAtual === 1}
                          onClick={() => paginaAtual > 1 && mudarPagina(paginaAtual - 1)}
                          style={{ cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer' }}
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </CPaginationItem>

                        {gerarNumerosPaginas().map((numero) => (
                          <CPaginationItem
                            key={numero}
                            active={numero === paginaAtual}
                            onClick={() => mudarPagina(numero)}
                            style={{ cursor: 'pointer' }}
                          >
                            {numero}
                          </CPaginationItem>
                        ))}

                        <CPaginationItem
                          aria-label="Próximo"
                          disabled={paginaAtual === totalPaginas}
                          onClick={() => paginaAtual < totalPaginas && mudarPagina(paginaAtual + 1)}
                          style={{
                            cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <span aria-hidden="true">&raquo;</span>
                        </CPaginationItem>
                      </CPagination>
                    </div>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default ConsultaAtestados
