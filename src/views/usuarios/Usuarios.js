import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CButton,
  CInputGroup,
  CAlert,
  CBadge,
  CSpinner,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilX, cilInfo, cilPlus, cilReload, cilSearch} from '@coreui/icons'
import UsuariosModal from './UsuariosModal'
import UsuariosTabela from './UsuariosTabela'
import UsuarioPermissaoModal from './usuarioPermisaoModal'
import { consultarUsuariosEoperaX, limparCacheUsuarios } from '../../services/popularTabela'
import { usePermissoesCRUD } from '../../contexts/PermissoesContext'


const Usuarios = () => {
  // Hook para verificar permissões da rota /usuarios
  const { podeAdicionar, podeEditar, podeDeletar } = usePermissoesCRUD('/usuarios');
  
  const [usuarios, setUsuarios] = useState([])
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cpf: '',
    tipoUsuario: '',
    celular: '',
    grupoCentralizador: '',
    ativo: '',
    supervisor: '',
    numOperacional: '',
    userIpal: '',
    userSesmt: '',
    senha: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Estados para modal de permissões
  const [showPermissaoModal, setShowPermissaoModal] = useState(false)
  const [editingUserPermissao, setEditingUserPermissao] = useState(null)

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [todosUsuarios, setTodosUsuarios] = useState([]) // Cache de todos os usuários
  const itemsPerPage = 10

  // Estado para debounce da pesquisa
  const [pesquisaTimeout, setPesquisaTimeout] = useState(null)

  // Carregar usuários da API apenas uma vez ao montar componente
  useEffect(() => {
    carregarTodosUsuarios()
  }, [])

  // Efeito para aplicar filtros e paginação quando dados ou filtros mudam
  useEffect(() => {
    aplicarFiltrosEPaginacao()
  }, [todosUsuarios, termoPesquisa, currentPage])

  // Efeito para pesquisa com debounce
  useEffect(() => {
    if (pesquisaTimeout) {
      clearTimeout(pesquisaTimeout)
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1) // Resetar para página 1 ao pesquisar
    }, 500) // Aguardar 500ms após parar de digitar

    setPesquisaTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [termoPesquisa])

  // Função para carregar todos os usuários uma única vez
  const carregarTodosUsuarios = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const dadosUsuarios = await consultarUsuariosEoperaX(forceRefresh)
      setTodosUsuarios(dadosUsuarios)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      showAlert('Erro ao carregar usuários. Verifique a conexão ou contate o suporte.', 'danger')
      setTodosUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  // Função para aplicar filtros e paginação nos dados já carregados
  const aplicarFiltrosEPaginacao = () => {
    if (todosUsuarios.length === 0) return

    // Filtrar por termo de pesquisa se fornecido
    let usuariosFiltrados = [...todosUsuarios]
    
    if (termoPesquisa.trim()) {
      const termoLower = termoPesquisa.toLowerCase().trim()
      const termoNumerico = termoPesquisa.replace(/[^\d]/g, '') // Remove tudo que não é número

      usuariosFiltrados = todosUsuarios.filter((usuario) => {
        // 1. Busca por nome (prioridade alta)
        const nomeMatch = usuario.nome && usuario.nome.toLowerCase().includes(termoLower)

        // 2. Busca por CPF (removendo formatação)
        const cpfLimpo = usuario.cpf ? usuario.cpf.replace(/[^\d]/g, '') : ''
        const cpfMatch = termoNumerico && cpfLimpo.includes(termoNumerico)

        // 3. Busca por matrícula
        const matriculaMatch =
          usuario.matricula && usuario.matricula.toString().toLowerCase().includes(termoLower)

        // 4. Busca por grupo centralizador
        const grupoMatch =
          usuario.grupoCentralizador &&
          usuario.grupoCentralizador.toLowerCase().includes(termoLower)

        // 5. Busca por tipo de usuário - melhorada para PJ/CLT
        const tipoMatch =
          usuario.tipoUsuario &&
          // Busca por "PJ" quando tipoUsuario é "P"
          ((termoLower.includes('pj') && usuario.tipoUsuario === 'P') ||
            // Busca por "CLT" quando tipoUsuario é "C"
            (termoLower.includes('clt') && usuario.tipoUsuario === 'C') ||
            // Busca pela letra original também
            usuario.tipoUsuario.toLowerCase().includes(termoLower))

        // 6. Busca por celular
        const celularLimpo = usuario.celular ? usuario.celular.replace(/[^\d]/g, '') : ''
        const celularMatch = termoNumerico && celularLimpo.includes(termoNumerico)

        // 7. Busca por projeto PJ (se aplicável)
        const projetoMatch =
          usuario.projetoPj && usuario.projetoPj.toLowerCase().includes(termoLower)

        return (
          nomeMatch ||
          cpfMatch ||
          matriculaMatch ||
          grupoMatch ||
          tipoMatch ||
          celularMatch ||
          projetoMatch
        )
      })

      // Ordenar os resultados para melhor relevância
      usuariosFiltrados.sort((a, b) => {
        // Priorizar correspondências exatas no nome
        const nomeAExato = a.nome && a.nome.toLowerCase().startsWith(termoLower)
        const nomeBExato = b.nome && b.nome.toLowerCase().startsWith(termoLower)

        if (nomeAExato && !nomeBExato) return -1
        if (!nomeAExato && nomeBExato) return 1

        // Depois priorizar correspondências no nome (qualquer posição)
        const nomeAMatch = a.nome && a.nome.toLowerCase().includes(termoLower)
        const nomeBMatch = b.nome && b.nome.toLowerCase().includes(termoLower)

        if (nomeAMatch && !nomeBMatch) return -1
        if (!nomeAMatch && nomeBMatch) return 1

        // Por último, ordenar alfabeticamente
        return (a.nome || '').localeCompare(b.nome || '')
      })
    } else {
      // Sem filtro, ordenar alfabeticamente por nome
      usuariosFiltrados.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    }

    // Aplicar paginação
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const usuariosPaginados = usuariosFiltrados.slice(startIndex, endIndex)

    // Calcular informações de paginação
    const total = usuariosFiltrados.length
    const totalPaginas = Math.ceil(total / itemsPerPage)
    const temMais = endIndex < total

    // Atualizar estados
    setUsuarios(usuariosPaginados)
    setTotalUsuarios(total)
    setTotalPages(totalPaginas)
    setHasMore(temMais)
  }

  const handlePesquisaChange = useCallback((e) => {
    setTermoPesquisa(e.target.value)
  }, [])

  const limparPesquisa = useCallback(() => {
    setTermoPesquisa('')
  }, [])

  const handlePageChange = useCallback((page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
      setCurrentPage(page)
    }
  }, [currentPage, totalPages, loading])

  const resetForm = () => {
    setFormData({
      matricula: '',
      nome: '',
      cpf: '',
      tipoUsuario: '',
      celular: '',
      grupoCentralizador: '',
      ativo: '',
      supervisor: '',
      numOperacional: '',
      userIpal: '',
      userSesmt: '',
      senha: '',
    })
    setFormErrors({})
    setEditingUser(null)
  }

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color })
    setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 5000)
  }

  const handleEdit = useCallback((user) => {
    setEditingUser(user)
    setShowModal(true)
  }, [])

  const handleEditPermissao = useCallback((user) => {
    setEditingUserPermissao(user)
    setShowPermissaoModal(true)
  }, [])

  const handleDelete = (matricula) => {
    const user = usuarios.find((u) => u.matricula === matricula)
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    setFormData({
      matricula: user.matricula || '',
      nome: user.nome || '',
      cpf: user.cpf || '',
      tipoUsuario: user.tipoUsuario || '',
      celular: user.celular || '',
      grupoCentralizador: user.grupoCentralizador || '',
      ativo: user.ativo || 'S',
      supervisor: user.supervisor || 'N',
      numOperacional: user.numOperacional || 'N',
      userIpal: user.userIpal || 'N',
      userSesmt: user.userSesmt || 'N',
      senha: '',
      confirmarSenha: '',
      projetoPj: user.projetoPj || '',
    })

    setShowModal(true)
  }

  const handleNewUser = useCallback(() => {
    resetForm()
    setShowModal(true)
  }, [])

  const getTipoUsuarioBadge = (tipo) => {
    const cores = {
      CLT: 'success',
      PJ: 'info',
      'NÃO INFORMADO': 'secondary',
    }

    let tipoFormatado = ''
    if (tipo === 'C') {
      tipoFormatado = 'CLT'
    } else if (tipo === 'P') {
      tipoFormatado = 'PJ'
    } else if (!tipo || tipo.trim() === '') {
      tipoFormatado = 'NÃO INFORMADO'
    } else {
      tipoFormatado = tipo
    }

    return <CBadge color={cores[tipoFormatado] || 'secondary'}>{tipoFormatado}</CBadge>
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return ''
    cpf = cpf.replace(/[^\d]/g, '')
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  // Função para calcular as páginas a serem exibidas
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  // Função para recarregar a lista de usuários (será chamada após cadastro/edição)
  const recarregarUsuarios = () => {
    // Limpar cache e forçar nova requisição
    limparCacheUsuarios()
    carregarTodosUsuarios(true)
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Gestão de Usuários</h1>
          <p className="mb-0 text-muted">Crie ou altere dados dos usuários.</p>
        </div>
      </div>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Gerenciamento de Usuários</h6>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol lg={6}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Pesquisar por nome, CPF, matrícula, grupo, PJ, CLT..."
                      value={termoPesquisa}
                      onChange={handlePesquisaChange}
                    />
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={limparPesquisa}
                      disabled={!termoPesquisa}
                    >
                      <CIcon icon={cilX} />
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol lg={6}>
                  <CButton
                    className="w-100"
                    color="primary"
                    onClick={handleNewUser}
                    disabled={loading}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Novo Usuário
                  </CButton>
                </CCol>
              </CRow>

              <hr />

              {alert.show && (
                <CAlert color={alert.color} className="d-flex align-items-center">
                  {alert.message}
                </CAlert>
              )}

              {/* Informações de paginação e total */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                  {loading ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <span>
                      Mostrando {usuarios.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
                      {Math.min(currentPage * itemsPerPage, totalUsuarios)} de {totalUsuarios} usuários
                      {termoPesquisa && ` (filtrados)`}
                    </span>
                  )}
                </div>
              </div>

              <UsuariosTabela
                paginatedUsuarios={usuarios}
                formatarCPF={formatarCPF}
                getTipoUsuarioBadge={getTipoUsuarioBadge}
                handleEdit={handleEdit}
                handleEditPermissao={handleEditPermissao}
                handleDelete={handleDelete}
                loading={loading}
                termoPesquisa={termoPesquisa}
                podeEditar={podeEditar}
                podeDeletar={podeDeletar}
              />

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-4">
                  <CPagination className="mb-0">
                    <CPaginationItem
                      aria-label="Previous"
                      disabled={currentPage === 1 || loading}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </CPaginationItem>

                    {visiblePages.map((page, idx) =>
                      page === '...' ? (
                        <CPaginationItem key={`dots-${idx}`} disabled>
                          <span>...</span>
                        </CPaginationItem>
                      ) : (
                        <CPaginationItem
                          key={page}
                          aria-label={`Page ${page}`}
                          active={currentPage === page}
                          disabled={loading}
                          onClick={() => handlePageChange(page)}
                          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                          {page}
                        </CPaginationItem>
                      ),
                    )}

                    <CPaginationItem
                      aria-label="Next"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <UsuariosModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingUser={editingUser}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onUsuarioSalvo={recarregarUsuarios} // Adicionar callback para recarregar
      />

      <UsuarioPermissaoModal
        showModal={showPermissaoModal}
        setShowModal={setShowPermissaoModal}
        editingUser={editingUserPermissao}
      />
      
    </div>
  )
}

export default Usuarios
