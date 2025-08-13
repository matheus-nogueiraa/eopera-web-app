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
import { atestadosService } from '../../services/consultarAtestadosService'


const ConsultaAtestados = () => {
  const [ filtros, setFiltros ] = useState({
    dataInicio: '',
    dataFim: '',
    status: '',
    tipificacao: '',
    especificacao: '',
  })

  const dataInicioRef = useRef(null)
  const dataFimRef = useRef(null)

  // Estados para paginação
  const [ paginaAtual, setPaginaAtual ] = useState(1)
  const [ itensPorPagina ] = useState(10)

  // Estados para dados da API
  const [ atestados, setAtestados ] = useState([])
  const [ atestadosFiltrados, setAtestadosFiltrados ] = useState([])
  const [ buscaRealizada, setBuscaRealizada ] = useState(false)
  const [ carregando, setCarregando ] = useState(false)
  const [ carregandoInicial, setCarregandoInicial ] = useState(true) // Novo estado para carregamento inicial
  const [ erro, setErro ] = useState(null)
  const [ erroAtestado, setErroAtestado ] = useState(null) // Novo estado para erro de atestado

  // Função para normalizar os dados da API
  const normalizarAtestado = (atestadoAPI) => {
    // Calcular dias entre datas
    const calcularDias = (inicio, fim) => {
      if (!inicio || !fim) return 0
      const dataInicio = new Date(inicio)
      const dataFim = new Date(fim)
      const diffTime = Math.abs(dataFim - dataInicio)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }

    // Mapear status da API para status do frontend
    const mapearStatus = (statusAtestado) => {
      const statusMap = {
        success: 'Em Análise',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
        cancelled: 'Cancelado',

      }
      return statusMap[ statusAtestado ] || 'Em Análise'
    }

    // Mapear motivo baseado no status do atestado
    const mapearMotivo = (statusAtestado, statusRecebimento, mensagem) => {
      switch (statusAtestado) {
        case 'rejected':
          // Para rejeitado: statusRecebimento tem prioridade, se não houver, usa mensagem
          return statusRecebimento || mensagem || 'Motivo não informado'

        case 'success':
        case 'approved':
          // Para sucesso ou aprovado: usar mensagem
          return mensagem || 'Atestado processado com sucesso'

        case 'cancelled':
          // Para cancelado: mensagem padrão
          return 'Não informado'

        case 'error':
          // Para erro: definir estado de erro e retornar mensagem
          setErroAtestado(mensagem || 'Erro não especificado')
          return mensagem || 'Erro de consulta'

        default:
          // Para outros casos: tentar statusRecebimento, depois mensagem
          return statusRecebimento || mensagem || 'Status não identificado'
      }
    }

    return {
      id: atestadoAPI.numFluig || Math.random().toString(36).substr(2, 9),
      status: mapearStatus(atestadoAPI.statusAtestado),
      tipificacao: 'Atestado de Saúde', // Valor padrão baseado no CID
      especificacao: atestadoAPI.motivo || 'Doença',
      dias: calcularDias(atestadoAPI.dtInicio, atestadoAPI.dtFim),
      dataInicio: atestadoAPI.dtInicio,
      dataFim: atestadoAPI.dtFim,
      dataInicial: atestadoAPI.dtInicio, // Compatibilidade
      dataFinal: atestadoAPI.dtFim, // Compatibilidade
      motivo: mapearMotivo(
        atestadoAPI.statusAtestado,
        atestadoAPI.statusRecebimento,
        atestadoAPI.mensagem,
      ),
      cid: atestadoAPI.cid,
      dtEnvioAtestado: atestadoAPI.dtEnvioAtestado,
      numFluig: atestadoAPI.numFluig,
      mensagem: atestadoAPI.mensagem,
    }
  }

  // Função para buscar atestados da API
  const buscarAtestadosAPI = async () => {
    const matriculaUsuario = localStorage.getItem('matricula')

    if (!matriculaUsuario) {
      throw new Error('Usuário não está logado ou matrícula não encontrada.')
    }

    try {
      const response = await atestadosService.consultarAtestados(matriculaUsuario)
      console.log('Dados da API:', response)

      if (response && response.success !== false) {
        // Normalizar os dados da API
        const atestadosNormalizados = (response.data || []).map(normalizarAtestado)
        setAtestados(atestadosNormalizados)
        return atestadosNormalizados
      } else {
        throw new Error('Resposta da API não foi bem-sucedida.')
      }
    } catch (error) {
      console.error('Erro ao buscar atestados da API:', error)
      throw error
    }
  }

  // Verificar se o usuário está logado ao carregar o componente
  useEffect(() => {
    const verificarLogin = () => {
      const matriculaUsuario = localStorage.getItem('matricula')
      const nomeUsuario =
        localStorage.getItem('nomeUsuario') ||
        localStorage.getItem('nome') ||
        localStorage.getItem('userName')

      console.log('Verificação de login:')
      console.log('Matrícula:', matriculaUsuario)
      console.log('Nome:', nomeUsuario)

      // Listar todos os itens do localStorage para debug
      console.log('Todos os itens do localStorage:')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)
        console.log(`${key}: ${value}`)
      }

      if (!matriculaUsuario) {
        // Verificar se há informações de login em outras chaves
        const chavesAlternativas = [ 'userMatricula', 'user_matricula', 'matriculaUsuario', 'userId' ]
        let encontrouMatricula = false

        for (const chave of chavesAlternativas) {
          const valor = localStorage.getItem(chave)
          if (valor) {
            console.log(`Matrícula encontrada na chave ${chave}:`, valor)
            localStorage.setItem('matricula', valor)
            encontrouMatricula = true
            break
          }
        }

        if (!encontrouMatricula) {
          setErro('Usuário não está logado. Redirecionando para login...')
          setTimeout(() => {
            window.location.href = '/login'
          }, 3000)
          return
        }
      }

      // Carregar e consultar atestados automaticamente ao montar o componente
      setCarregandoInicial(true)
      buscarAtestadosAPI()
        .then((dadosCarregados) => {
          // Após carregar os dados, executar a busca automaticamente
          const resultados = filtrarAtestados(dadosCarregados, filtros)
          setAtestadosFiltrados(resultados)
          setBuscaRealizada(true)
          setPaginaAtual(1)
          console.log(`Consulta inicial concluída. ${resultados.length} atestados encontrados.`)
        })
        .catch((error) => {
          console.error('Erro detalhado:', error)
          setErro('Erro ao carregar atestados iniciais: ' + error.message)
        })
        .finally(() => {
          setCarregandoInicial(false)
        })
    }

    verificarLogin()
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
      [ campo ]: valor,
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
        const dataInicioAtestado = atestado.dataInicio || atestado.dataInicial
        if (dataInicioAtestado) {
          const dataInicioFiltro = new Date(filtros.dataInicio)
          const dataAtestado = new Date(dataInicioAtestado)
          if (dataAtestado < dataInicioFiltro) {
            return false
          }
        }
      }

      // Filtro por data final
      if (filtros.dataFim) {
        const dataFimAtestado = atestado.dataFim || atestado.dataFinal
        if (dataFimAtestado) {
          const dataFimFiltro = new Date(filtros.dataFim)
          const dataAtestado = new Date(dataFimAtestado)
          if (dataAtestado > dataFimFiltro) {
            return false
          }
        }
      }

      return true
    })
  }

  const buscarAtestados = async (filtros) => {
    console.log('Buscando atestados com filtros:', filtros)

    setCarregando(true)
    setBuscaRealizada(false)
    setErro(null)
    setErroAtestado(null) // Limpar erro de atestado anterior

    try {
      // Verificar se o usuário está logado
      const matriculaUsuario = localStorage.getItem('matricula')

      if (!matriculaUsuario) {
        throw new Error('Usuário não está logado. Faça login novamente.')
      }

      // Buscar dados frescos da API
      const dadosFrescos = await buscarAtestadosAPI()

      // Verificar se há algum atestado com erro
      const atestadosComErro = dadosFrescos.filter(
        (atestado) => atestado.status === 'Erro de consulta',
      )

      if (atestadosComErro.length > 0) {
        // Se há atestados com erro, não mostrar a tabela
        setBuscaRealizada(true)
        setAtestadosFiltrados([])
        return
      }

      // Filtrar os atestados baseado nos filtros aplicados
      const resultados = filtrarAtestados(dadosFrescos, filtros)
      setAtestadosFiltrados(resultados)

      setBuscaRealizada(true)
      setPaginaAtual(1)

      // Não limpar os filtros após busca bem-sucedida

      console.log(
        `Busca concluída. ${resultados.length} atestados encontrados com os filtros aplicados.`,
      )
    } catch (error) {
      console.error('Erro durante a busca:', error)
      setErro(error.message || 'Erro ao realizar a busca. Tente novamente.')
      setAtestadosFiltrados([])
      setBuscaRealizada(false)
    } finally {
      setCarregando(false)
    }
  }

  // Função para recarregar dados da API
  const recarregarDados = async () => {
    try {
      const dadosFrescos = await buscarAtestadosAPI()
      
      // Limpar filtros
      const filtrosLimpos = {
        dataInicio: '',
        dataFim: '',
        status: '',
        tipificacao: '',
        especificacao: '',
      }
      setFiltros(filtrosLimpos)
      
      // Aplicar busca automaticamente com filtros limpos
      const resultados = filtrarAtestados(dadosFrescos, filtrosLimpos)
      setAtestadosFiltrados(resultados)
      setBuscaRealizada(true)
      setPaginaAtual(1)
      
    } catch (error) {
      console.error('Erro ao recarregar dados:', error)
      setErro('Erro ao recarregar dados: ' + error.message)
      setBuscaRealizada(false)
      setAtestadosFiltrados([])
      setPaginaAtual(1)
    }
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
    return statusConfig[ status ] || { color: 'secondary', icon: null, text: status }
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

  const getMotivoTexto = (atestado) => {
    return atestado.motivo || 'Motivo não informado'
  }

  // Função para formatar data
  const formatarData = (data) => {
    // Verificar casos inválidos
    if (!data ||
      data === "{}" ||
      data === "-" ||
      data === "Invalid Date" ||
      data === "null" ||
      data === "undefined") {
      return "-";
    }

    try {
      const dataObj = new Date(data);
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        return "-";
      }
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", data, error);
      return "-";
    }
  }

  // Obter itens da página atual
  const itensPaginaAtual = calcularItensPagina()
  const totalPaginas = calcularTotalPaginas()

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Consultar Atestados Enviados</h1>
          {/* Debug info - remover em produção */}
          <small className="text-muted">
            Matrícula: {localStorage.getItem('matricula') || 'NÃO ENCONTRADA'} | Nome:{' '}
            {localStorage.getItem('nomeUsuario') ||
              localStorage.getItem('nome') ||
              'NÃO ENCONTRADO'}
          </small>
        </div>
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
              <h6 className="m-0 font-weight-bold text-primary">Atestados Encontrados</h6>
            </CCardHeader>

            <CCardBody>
              <CRow className="g-3">

                {/* Filtros de busca */}
                <CCol md={4}>
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

                {/* Filtro de data inicial */}
                <CCol md={4}>
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
                <CCol md={4}>
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
                    onClick={() => buscarAtestados(filtros)}
                    disabled={carregando}
                  >
                    {carregando ? (
                      <CSpinner size="sm" className="me-2" />
                    ) : (
                      <CIcon icon={cilSearch} className="me-1" />
                    )}
                    {carregando ? 'Buscando...' : 'Filtrar'}
                  </CButton>
                </CCol>
                <span className="text-primary">
                  *Somente os atestados enviados pelo Eopera serão exibidos! Use os filtros para refinar a busca.
                </span>
              </CRow>
              <hr />
              {/* Condicionar a exibição da tabela */}
              {carregandoInicial ? (
                <div className="text-center py-4">
                  <CSpinner />
                  <p className="text-muted mt-2">Carregando atestados...</p>
                </div>
              ) : carregando && !buscaRealizada ? (
                <div className="text-center py-4">
                  <CSpinner />
                  <p className="text-muted mt-2">Buscando atestados...</p>
                </div>
              ) : !buscaRealizada ? (
                <div className="text-center py-4">
                  <p className="text-muted">Clique em "Buscar" para filtrar os atestados.</p>
                </div>
              ) : erroAtestado ? (
                <CAlert color="secondary" className="text-center">
                  <p className="m-0">{erroAtestado}</p>
                </CAlert>
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
                          <th>Solicitação</th>
                          <th>Motivo</th>
                          {/* <th>Anexo</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {itensPaginaAtual.map((atestado, index) => (
                          <tr key={atestado.id || index}>
                            <td className="text-center">{renderStatus(atestado.status)}</td>
                            <td>{atestado.tipificacao}</td>
                            <td>{atestado.especificacao}</td>
                            <td className="text-center">{atestado.dias || "-"}</td>
                            <td className="text-center">
                              {formatarData(atestado.dataInicio || atestado.dataInicial)}
                            </td>
                            <td className="text-center">
                              {formatarData(atestado.dataFim || atestado.dataFinal || "-")}
                            </td>
                            <td className="text-center">{atestado.numFluig || '-'}</td>
                            <td>{getMotivoTexto(atestado)}</td>
                            {/* <td className="text-center">
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
                            </td> */}
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
