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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButtonGroup,
  CSpinner,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilX } from '@coreui/icons'
import UsuariosModal from './UsuariosModal'
import UsuariosTabela from './UsuariosTabela'
import UsuarioPermissaoModal from './usuarioPermisaoModal'

// Importar o service de usuários
import { consultarUsuariosEoperaX } from '../../services/usuariosService'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cpf: '',
    tipoUsuario: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Estados para modal de permissões
  const [showPermissaoModal, setShowPermissaoModal] = useState(false)
  const [editingUserPermissao, setEditingUserPermissao] = useState(null)

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Quantidade de usuários por página

  // Carregar usuários da API ao montar componente
  useEffect(() => {
    carregarUsuarios()
  }, [])

  // Efeito para filtrar usuários quando o termo de pesquisa muda
  useEffect(() => {
    filtrarUsuarios()
  }, [usuarios, termoPesquisa])

  // Paginação dos usuários filtrados
  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage)
  const paginatedUsuarios = usuariosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Resetar página quando pesquisa mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [termoPesquisa])

  const carregarUsuarios = async () => {
    setLoading(true)
    try {
      console.log('Iniciando carregamento de usuários...')
      const dadosUsuarios = await consultarUsuariosEoperaX()

      console.log('Dados recebidos da API:', dadosUsuarios)

      // Transformar os dados da API para o formato esperado pelo componente
      const usuariosFormatados = dadosUsuarios.map((usuario) => ({
        matricula: usuario.matricula || '',
        nome: usuario.nome || '',
        cpf: usuario.cpf || '',
        tipoUsuario: usuario.tipoUsuario || '',
      }))

      setUsuarios(usuariosFormatados)
      console.log(`${usuariosFormatados.length} usuários carregados com sucesso`)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      showAlert(
        'Erro ao carregar usuários da API. Verifique a conexão ou contate o suporte.',
        'danger',
      )

      // Em caso de erro, manter dados simulados para não quebrar a aplicação
      const dadosSimulados = [
        {
          matricula: '001134',
          nome: 'LUCAS YAN BEZERRA DE OLIVEIRA',
          cpf: '07391225177',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001135',
          nome: 'MARIA SILVA SANTOS',
          cpf: '12345678901',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001136',
          nome: 'JOÃO CARLOS PEREIRA',
          cpf: '98765432109',
          tipoUsuario: 'CLT',
        },
      ]
      setUsuarios(dadosSimulados)
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    if (!termoPesquisa.trim()) {
      setUsuariosFiltrados(usuarios)
      return
    }

    const termo = termoPesquisa.toLowerCase().trim()
    const usuariosFiltrados = usuarios.filter((usuario) => {
      const nome = usuario.nome?.toLowerCase() || ''
      const cpf = usuario.cpf?.replace(/[^\d]/g, '') || '' // Remove formatação do CPF
      const cpfFormatado = formatarCPF(usuario.cpf || '').toLowerCase()
      const matricula = usuario.matricula?.toLowerCase() || ''

      return (
        nome.includes(termo) ||
        cpf.includes(termo) ||
        cpfFormatado.includes(termo) ||
        matricula.includes(termo)
      )
    })

    setUsuariosFiltrados(usuariosFiltrados)
  }

  const handlePesquisaChange = (e) => {
    setTermoPesquisa(e.target.value)
  }

  const limparPesquisa = () => {
    setTermoPesquisa('')
  }

  const resetForm = () => {
    setFormData({
      matricula: '',
      nome: '',
      cpf: '',
      tipoUsuario: '',
    })
    setFormErrors({})
    setEditingUser(null)
  }

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color })
    setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 4000)
  }

  const validarCPF = (cpf) => {
    const s = cpf.replace(/\D/g, '')
    if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false

    // Dígito 1
    let soma = 0
    for (let i = 0; i < 9; i++) soma += Number(s[i]) * (10 - i)
    let resto = soma % 11
    const d1 = resto < 2 ? 0 : 11 - resto
    if (d1 !== Number(s[9])) return false

    // Dígito 2
    soma = 0
    for (let i = 0; i < 10; i++) soma += Number(s[i]) * (11 - i)
    resto = soma % 11
    const d2 = resto < 2 ? 0 : 11 - resto
    return d2 === Number(s[10])
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return ''
    cpf = cpf.replace(/[^\d]/g, '')
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.matricula.trim()) {
      errors.matricula = 'Matrícula é obrigatória'
    } else if (formData.matricula.length < 6) {
      errors.matricula = 'Matrícula deve ter pelo menos 6 caracteres'
    }

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }

    const cpfLimpo = formData.cpf.replace(/[^\d]/g, '')
    if (!cpfLimpo) {
      errors.cpf = 'CPF é obrigatório'
    } else if (cpfLimpo.length !== 11) {
      errors.cpf = 'CPF deve conter 11 dígitos'
    } else if (!validarCPF(cpfLimpo)) {
      errors.cpf = 'CPF inválido'
    }

    if (!formData.tipoUsuario) {
      errors.tipoUsuario = 'Tipo de usuário é obrigatório'
    }

    // Verificar se matrícula já existe
    const matriculaExists = usuarios.some(
      (user) => user.matricula === formData.matricula && user.matricula !== editingUser?.matricula,
    )
    if (matriculaExists) {
      errors.matricula = 'Esta matrícula já está em uso'
    }

    // Verificar se CPF já existe
    const cpfExists = usuarios.some((user) => {
      const cpfUsuario = user.cpf?.replace(/[^\d]/g, '') || ''
      return cpfUsuario === cpfLimpo && user.matricula !== editingUser?.matricula
    })
    if (cpfExists) {
      errors.cpf = 'Este CPF já está cadastrado'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const dadosParaAPI = {
        matricula: formData.matricula,
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/[^\d]/g, ''),
        tipoUsuario: formData.tipoUsuario,
      }

      if (editingUser) {
        // Editar usuário - chamada PUT para API
        setUsuarios((prev) =>
          prev.map((user) => (user.matricula === editingUser.matricula ? dadosParaAPI : user)),
        )
        showAlert('Usuário atualizado com sucesso!')
      } else {
        // Adicionar novo usuário - chamada POST para API
        setUsuarios((prev) => [...prev, dadosParaAPI])
        showAlert('Usuário cadastrado com sucesso!')
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      showAlert('Erro ao salvar usuário: ' + error.message, 'danger')
    }

    setLoading(false)
  }

  const handleEdit = (user) => {
    setFormData({
      matricula: user.matricula,
      nome: user.nome,
      cpf: formatarCPF(user.cpf),
      tipoUsuario: user.tipoUsuario,
    })
    setEditingUser(user)
    setShowModal(true)
  }

  const handleEditPermissao = (user) => {
    setEditingUserPermissao(user)
    setShowPermissaoModal(true)
  }

  const handleDelete = (matricula) => {
    const user = usuarios.find((u) => u.matricula === matricula)
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      setUsuarios((prev) => prev.filter((user) => user.matricula !== userToDelete.matricula))
      showAlert('Usuário excluído com sucesso!')
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      showAlert('Erro ao excluir usuário: ' + error.message, 'danger')
    }
    setLoading(false)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
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

    // Formatação dos valores
    let tipoFormatado = ''
    if (tipo === 'C') {
      tipoFormatado = 'CLT'
    } else if (tipo === 'P') {
      tipoFormatado = 'PJ'
    } else if (!tipo || tipo.trim() === '') {
      tipoFormatado = 'NÃO INFORMADO'
    } else {
      // Para outros valores que já podem estar formatados (CLT, PJ)
      tipoFormatado = tipo
    }

    return <CBadge color={cores[tipoFormatado] || 'secondary'}>{tipoFormatado}</CBadge>
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

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Gestão de Usuários</h1>
          <p className="mb-0 text-muted">Crie, exclua ou altere dados dos usuários.</p>
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
                      placeholder="Pesquisar por nome, CPF ou matrícula..."
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
                {/*<CCol lg={7}>
                  <CButton
                    className="w-100"
                    color="primary"
                    onClick={handleNewUser}
                    disabled={loading}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Adicionar Novo Usuário
                  </CButton>
                </CCol>*/}
              </CRow>

              {termoPesquisa && (
                <div className="mb-3">
                  <small className="text-muted">
                    Mostrando {usuariosFiltrados.length} de {usuarios.length} usuários
                    {termoPesquisa && ` para "${termoPesquisa}"`}
                  </small>
                </div>
              )}

              {usuariosFiltrados.length > itemsPerPage && (
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Página {currentPage} de {totalPages} - Exibindo{' '}
                    {(currentPage - 1) * itemsPerPage + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, usuariosFiltrados.length)} de{' '}
                    {usuariosFiltrados.length} usuários
                  </small>
                </div>
              )}

              <hr />
              {alert.show && (
                <CAlert color={alert.color} className="d-flex align-items-center">
                  {alert.message}
                </CAlert>
              )}
              {loading && (
                <div className="text-center py-3">
                  <CSpinner color="primary" />
                  <p className="mt-2 text-muted">Carregando usuários...</p>
                </div>
              )}

              <UsuariosTabela
                paginatedUsuarios={paginatedUsuarios}
                formatarCPF={formatarCPF}
                getTipoUsuarioBadge={getTipoUsuarioBadge}
                handleEdit={handleEdit}
                handleEditPermissao={handleEditPermissao}
                handleDelete={handleDelete}
                loading={loading}
                termoPesquisa={termoPesquisa}
              />

              

              {totalPages > 1 && (
                <div className="d-flex justify-content-end">
                  <CPagination className="mb-0">
                    <CPaginationItem
                      aria-label="Previous"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
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
                          onClick={() => setCurrentPage(page)}
                          style={{ cursor: 'pointer' }}
                        > 
                          {page}
                        </CPaginationItem>
                      ),
                    )}

                    <CPaginationItem
                      aria-label="Next"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
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
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        userToDelete={userToDelete}
        editingUser={editingUser}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        handleSubmit={handleSubmit}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
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
