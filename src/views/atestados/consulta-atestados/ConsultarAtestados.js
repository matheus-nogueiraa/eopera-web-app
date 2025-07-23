import React, { useRef, useState, useEffect } from 'react'

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
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCheckCircle, cilClock, cilXCircle, cilZoomIn } from '@coreui/icons'

const ConsultaAtestados = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    status: '',
    tipificacao: '',
    especificacao: '',
  })

  const dataInicioRef = useRef(null)
  const dataFimRef = useRef(null)

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(10)

  // Estados para dados da API
  const [atestados, setAtestados] = useState([])
  const [atestadosFiltrados, setAtestadosFiltrados] = useState([])
  const [buscaRealizada, setBuscaRealizada] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // Configurações da API
  const API_TOKEN = '@k)1qlny;dG!ogXC]us7XB(2LzE{@w'
  const API_BASE_URL = 'https://adm.elcop.eng.br:9000/api'

  // Função para buscar atestados da API
  const buscarAtestadosAPI = async (matricula = '006082') => {
    console.log(`Iniciando busca na API para matrícula: ${matricula}`)

    try {
      const response = await fetch(`${API_BASE_URL}/consultarAtestados?matricula=${matricula}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Dados recebidos da API:', data)

      // Verificar se a resposta tem a estrutura esperada
      let atestadosArray = []
      if (Array.isArray(data)) {
        atestadosArray = data
      } else if (data && Array.isArray(data.atestados)) {
        atestadosArray = data.atestados
      } else if (data && Array.isArray(data.data)) {
        atestadosArray = data.data
      } else if (data && data.success && Array.isArray(data.result)) {
        atestadosArray = data.result
      } else {
        console.warn('Estrutura de dados inesperada:', data)
        atestadosArray = []
      }

      console.log(`${atestadosArray.length} atestados carregados da API`)
      setAtestados(atestadosArray)
      return atestadosArray
    } catch (error) {
      console.error('Erro ao buscar atestados da API:', error)
      throw error // Re-throw para que a função chamadora possa tratar
    }
  }

  // Carregar atestados ao montar o componente
  useEffect(() => {
    buscarAtestadosAPI()
  }, [])

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
        const dataInicioAtestado = new Date(atestado.dataInicio || atestado.dataInicial)
        const dataInicioFiltro = new Date(filtros.dataInicio)
        if (dataInicioAtestado < dataInicioFiltro) {
          return false
        }
      }

      // Filtro por data final
      if (filtros.dataFim) {
        const dataFimAtestado = new Date(atestado.dataFim || atestado.dataFinal)
        const dataFimFiltro = new Date(filtros.dataFim)
        if (dataFimAtestado > dataFimFiltro) {
          return false
        }
      }

      return true
    })
  }

  const buscarAtestados = async () => {
    console.log('Buscando atestados com filtros:', filtros)

    setCarregando(true)
    setBuscaRealizada(false) // Reset do estado de busca
    setErro(null) // Limpar erros anteriores

    try {
      // Sempre buscar dados frescos da API ao clicar em "Buscar"
      const dadosFrescos = await buscarAtestadosAPI()

      // Filtrar os atestados baseado nos filtros aplicados
      const resultados = filtrarAtestados(dadosFrescos, filtros)
      setAtestadosFiltrados(resultados)

      // Definir que a busca foi realizada
      setBuscaRealizada(true)

      // Resetar para a primeira página
      setPaginaAtual(1)

      console.log(
        `Busca concluída. ${resultados.length} atestados encontrados com os filtros aplicados.`,
      )
    } catch (error) {
      console.error('Erro durante a busca:', error)
      setErro('Erro ao realizar a busca. Tente novamente.')
      setAtestadosFiltrados([])
      setBuscaRealizada(false)
    } finally {
      setCarregando(false)
    }
  }

  // Função para recarregar dados da API
  const recarregarDados = async () => {
    await buscarAtestadosAPI()
    setBuscaRealizada(false)
    setAtestadosFiltrados([])
    setPaginaAtual(1)
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
    console.log('Visualizando atestado:', atestado)
    alert(`Visualizando atestado ID: ${atestado.id}`)
  }

  const getMotivoTexto = (atestado) => {
    switch (atestado.status) {
      case 'Aprovado':
        return 'Atestado dentro dos parâmetros'
      case 'Em Análise':
        return 'Analisando parâmetros do atestado'
      case 'Rejeitado':
        return atestado.motivoRejeicao || atestado.motivo || 'Motivo não informado'
      case 'Cancelado':
        return atestado.motivoCancelamento || atestado.motivo || 'Motivo não informado'
      default:
        return atestado.motivo || ''
    }
  }

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Obter itens da página atual
  const itensPaginaAtual = calcularItensPagina()
  const totalPaginas = calcularTotalPaginas()

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Consultar Atestados Enviados</h1>
      </div>

      {/* Exibir erro se houver */}
      {erro && (
        <CAlert color="danger" dismissible onClose={() => setErro(null)}>
          {erro}
        </CAlert>
      )}

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">
                Atestados Encontrados
                {carregando && <CSpinner size="sm" className="ms-2" />}
              </h6>
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
                    disabled={carregando}
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
                    disabled={carregando}
                  >
                    <option value="">Todas</option>
                    <option value="Atestado de Saúde">Atestado de Saúde</option>
                    <option value="Atestado Odontológico">Atestado Odontológico</option>
                  </CFormSelect>
                </CCol>

                {/* Especificação do atestado */}
                <CCol md={3}>
                  <CFormLabel htmlFor="especificacao">Especificação:</CFormLabel>
                  <CFormSelect
                    id="especificacao"
                    value={filtros.especificacao}
                    onChange={(e) => handleFiltroChange('especificacao', e.target.value)}
                    disabled={carregando}
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
                      disabled={carregando}
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
                      disabled={carregando}
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
                    disabled={carregando}
                  >
                    {carregando ? (
                      <CSpinner size="sm" className="me-2" />
                    ) : (
                      <CIcon icon={cilSearch} className="me-1" />
                    )}
                    {carregando ? 'Buscando...' : 'Buscar'}
                  </CButton>
                </CCol>
              </CRow>
              <hr />

              {/* Condicionar a exibição da tabela */}
              {carregando && !buscaRealizada ? (
                <div className="text-center py-4">
                  <CSpinner />
                  <p className="text-muted mt-2">Carregando atestados...</p>
                </div>
              ) : !buscaRealizada ? (
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
                          <th>Status</th>
                          <th>Tipificação</th>
                          <th>Especificação</th>
                          <th>Dias</th>
                          <th>Data Início</th>
                          <th>Data Final</th>
                          <th>Motivo</th>
                          <th>Anexo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensPaginaAtual.map((atestado, index) => (
                          <tr key={atestado.id || index}>
                            <td className="text-center">{renderStatus(atestado.status)}</td>
                            <td>{atestado.tipificacao}</td>
                            <td>{atestado.especificacao}</td>
                            <td className="text-center">{atestado.dias}</td>
                            <td className="text-center">
                              {formatarData(atestado.dataInicio || atestado.dataInicial)}
                            </td>
                            <td className="text-center">
                              {formatarData(atestado.dataFim || atestado.dataFinal)}
                            </td>
                            <td>{getMotivoTexto(atestado)}</td>
                            <td className="text-center">
                              <CButton
                                size="sm"
                                color="primary"
                                variant="outline"
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
