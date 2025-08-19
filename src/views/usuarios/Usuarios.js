import React, { useState, useEffect } from 'react'
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
import { cilPlus, cilX, cilReload, cilSearch } from '@coreui/icons'
import UsuariosModal from './UsuariosModal'
import UsuariosTabela from './UsuariosTabela'
import { consultarUsuariosEoperaX } from '../../services/popularTabela'
// Importar os novos services

const Usuarios = () => {
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

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const itemsPerPage = 10

  // Estado para debounce da pesquisa
  const [pesquisaTimeout, setPesquisaTimeout] = useState(null)

  // Carregar usuários da API ao montar componente
  useEffect(() => {
    carregarUsuariosPagina(1)
  }, [])

  // Efeito para recarregar dados quando a página muda
  useEffect(() => {
    if (currentPage > 0) {
      carregarUsuariosPagina(currentPage, termoPesquisa)
    }
  }, [currentPage])

  // Efeito para pesquisa com debounce
  useEffect(() => {
    if (pesquisaTimeout) {
      clearTimeout(pesquisaTimeout)
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1) // Resetar para página 1 ao pesquisar
      carregarUsuariosPagina(1, termoPesquisa)
    }, 500) // Aguardar 500ms após parar de digitar

    setPesquisaTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [termoPesquisa])

  const carregarUsuariosPagina = async (page, termo = '') => {
    setLoading(true)
    try {
      // Buscar todos os usuários da API
      const todosUsuarios = await consultarUsuariosEoperaX()

      // Filtrar por termo de pesquisa se fornecido
      let usuariosFiltrados = todosUsuarios
      if (termo.trim()) {
        const termoLower = termo.toLowerCase().trim()
        const termoNumerico = termo.replace(/[^\d]/g, '') // Remove tudo que não é número

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
      }

      // Ordenar os resultados para melhor relevância
      if (termo.trim()) {
        usuariosFiltrados.sort((a, b) => {
          const termoLower = termo.toLowerCase().trim()

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
      const startIndex = (page - 1) * itemsPerPage
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
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      showAlert('Erro ao carregar usuários. Verifique a conexão ou contate o suporte.', 'danger')
      setUsuarios([])
      setTotalUsuarios(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handlePesquisaChange = (e) => {
    setTermoPesquisa(e.target.value)
  }

  const limparPesquisa = () => {
    setTermoPesquisa('')
  }

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
      setCurrentPage(page)
      // Remover a chamada direta aqui, pois o useEffect vai cuidar disso
    }
  }

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

  const handleEdit = (user) => {
    setEditingUser(user)

    // Inicializar o formulário apenas com dados básicos
    // Os dados completos serão carregados da API no modal
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

  const handleNewUser = () => {
    resetForm()
    setShowModal(true)
  }

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
    carregarUsuariosPagina(currentPage, termoPesquisa)
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

              <UsuariosTabela
                paginatedUsuarios={usuarios}
                formatarCPF={formatarCPF}
                getTipoUsuarioBadge={getTipoUsuarioBadge}
                handleEdit={handleEdit}
                loading={loading}
                termoPesquisa={termoPesquisa}
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
    </div>
  )
}

export default Usuarios
