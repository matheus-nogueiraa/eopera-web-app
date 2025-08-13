import React, { useState, useEffect } from 'react'
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
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
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
import { cilPencil, cilTrash, cilPlus, cilUser, cilCheckAlt, cilX, cilSearch } from '@coreui/icons'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' })
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cpf: '',
    tipoUsuario: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Quantidade de usuários por página

  // Simulação de dados iniciais com os campos da API
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
      // Aqui você fará a chamada real para sua API
      // const response = await fetch('/api/usuarios')
      // const dados = await response.json()

      // Simulação de dados para desenvolvimento
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
        {
          matricula: '001541',
          nome: 'CARLOS FREITAS SOUZA',
          cpf: '98765432147',
          tipoUsuario: '',
        },
        {
          matricula: '001542',
          nome: 'ANA PAULA OLIVEIRA',
          cpf: '12345678912',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001543',
          nome: 'FELIPE GOMES DA SILVA',
          cpf: '12345678913',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001544',
          nome: 'JULIANA COSTA ALMEIDA',
          cpf: '12345678914',
          tipoUsuario: '',
        },
        {
          matricula: '001545',
          nome: 'GABRIELA SOUZA',
          cpf: '12345678915',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001546',
          nome: 'VITOR HUGO',
          cpf: '12345678916',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001547',
          nome: 'MARCOS SILVA',
          cpf: '12345678917',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001548',
          nome: 'LUIZ FERNANDO',
          cpf: '12345678918',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001549',
          nome: 'CARLA SOUZA',
          cpf: '12345678919',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001550',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678920',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001551',
          nome: 'GUSTAVO SILVA',
          cpf: '12345678921',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001552',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678922',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001553',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678923',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001554',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678924',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001555',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678925',
          tipoUsuario: 'PJ',
        },
        {
          matricula: '001556',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678926',
          tipoUsuario: 'CLT',
        },
        {
          matricula: '001557',
          nome: 'FABIOLA MARTINS',
          cpf: '12345678927',
          tipoUsuario: 'PJ',
        },
      ]

      setTimeout(() => {
        setUsuarios(dadosSimulados)
        setLoading(false)
      }, 500) // Simula delay da API
    } catch (error) {
      showAlert('Erro ao carregar usuários: ' + error.message, 'danger')
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
      const nome = usuario.nome.toLowerCase()
      const cpf = usuario.cpf.replace(/[^\d]/g, '') // Remove formatação do CPF
      const cpfFormatado = formatarCPF(usuario.cpf).toLowerCase()
      const matricula = usuario.matricula.toLowerCase()

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
    cpf = cpf.replace(/[^\d]/g, '')
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let newValue = value

    // Formatação automática do CPF
    if (name === 'cpf') {
      // Remove caracteres não numéricos
      newValue = value.replace(/[^\d]/g, '')

      // Aplica formatação apenas quando necessário
      if (newValue.length >= 11) {
        newValue = newValue.substring(0, 11) // Limita a 11 dígitos
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      } else if (newValue.length >= 7) {
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      } else if (newValue.length >= 4) {
        newValue = newValue.replace(/(\d{3})(\d{1,3})/, '$1.$2')
      }
    }

    // Converter nome para maiúsculas (como na API)
    if (name === 'nome') {
      newValue = value.toUpperCase()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Limpar erro do campo
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
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

    // Verificar se CPF já existe - CORREÇÃO AQUI
    const cpfExists = usuarios.some((user) => {
      const cpfUsuario = user.cpf.replace(/[^\d]/g, '') // Remove formatação do CPF armazenado
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
        // const response = await fetch(`/api/usuarios/${editingUser.matricula}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(dadosParaAPI)
        // })

        // Simulação para desenvolvimento
        setUsuarios((prev) =>
          prev.map((user) => (user.matricula === editingUser.matricula ? dadosParaAPI : user)),
        )
        showAlert('Usuário atualizado com sucesso!')
      } else {
        // Adicionar novo usuário - chamada POST para API
        // const response = await fetch('/api/usuarios', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(dadosParaAPI)
        // })

        // Simulação para desenvolvimento
        setUsuarios((prev) => [...prev, dadosParaAPI])
        showAlert('Usuário cadastrado com sucesso!')
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
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

  const handleDelete = (matricula) => {
    const user = usuarios.find((u) => u.matricula === matricula)
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      // Chamada DELETE para API
      // await fetch(`/api/usuarios/${userToDelete.matricula}`, { method: 'DELETE' })

      // Simulação para desenvolvimento
      setUsuarios((prev) => prev.filter((user) => user.matricula !== userToDelete.matricula))
      showAlert('Usuário excluído com sucesso!')
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
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
      PJ: 'info',
      CLT: 'success',
      '': 'secondary',
    }
    return <CBadge color={cores[tipo] || 'secondary'}>{tipo || 'NÃO INFORMADO'}</CBadge>
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Gestão de Usuários</h1>
          <p className="mb-0 text-muted">Crie, exclua ou altere dados dos usuários.</p>
        </div>
      </div>
      <>
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <h6 className="m-0 font-weight-bold text-primary">Gerenciamento de Usuários</h6>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  <CCol lg={5}>
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
                  <CCol lg={7}>
                    <CButton
                      className="w-100"
                      color="primary"
                      onClick={handleNewUser}
                      disabled={loading}
                    >
                      <CIcon icon={cilPlus} className="me-1" />
                      Adicionar Novo Usuário
                    </CButton>
                  </CCol>
                </CRow>

                {termoPesquisa && (
                  <div className="mb-3">
                    <small className="text-muted">
                      Mostrando {usuariosFiltrados.length} de {usuarios.length} usuários
                      {termoPesquisa && ` para "${termoPesquisa}"`}
                    </small>
                  </div>
                )}

                {/* Informação da paginação */}
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
                  </div>
                )}
                <CTable hover bordered align="middle" responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Matrícula</CTableHeaderCell>
                      <CTableHeaderCell>Nome</CTableHeaderCell>
                      <CTableHeaderCell>CPF</CTableHeaderCell>
                      <CTableHeaderCell>Tipo de Usuário</CTableHeaderCell>
                      <CTableHeaderCell>Ações</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {paginatedUsuarios.map((user) => (
                      <CTableRow key={user.matricula}>
                        <CTableDataCell>
                          <strong className="text-primary">{user.matricula}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{user.nome}</CTableDataCell>
                        <CTableDataCell>{formatarCPF(user.cpf)}</CTableDataCell>
                        <CTableDataCell>{getTipoUsuarioBadge(user.tipoUsuario)}</CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup className="w-100">
                            <CButton
                              className="flex-fill"
                              color="secondary"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              disabled={loading}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="primary"
                              size="sm"
                              onClick={() => handleDelete(user.matricula)}
                              disabled={loading}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CButtonGroup>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {paginatedUsuarios.length === 0 && !loading && (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center">
                          {termoPesquisa
                            ? 'Nenhum usuário encontrado para esta pesquisa'
                            : 'Nenhum usuário cadastrado'}
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>

                {/* Paginação */}
                {totalPages > 1 && (
                  <CPagination align="end" className="mt-3">
                    <CPaginationItem
                      aria-label="Previous"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </CPaginationItem>

                    {Array.from({ length: totalPages }, (_, idx) => (
                      <CPaginationItem
                        key={idx + 1}
                        active={currentPage === idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        style={{ cursor: 'pointer' }}
                      >
                        {idx + 1}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      aria-label="Next"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                      style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </CPaginationItem>
                  </CPagination>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Modal para Adicionar/Editar Usuário */}
        <CModal
          alignment="center"
          visible={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="matricula">
                      Matrícula <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="matricula"
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleInputChange}
                      invalid={!!formErrors.matricula}
                      placeholder="Ex: 001134"
                      // Não permite editar matrícula
                    />
                    <CFormFeedback invalid>{formErrors.matricula}</CFormFeedback>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="cpf">
                      CPF <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      invalid={!!formErrors.cpf}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <CFormFeedback invalid>{formErrors.cpf}</CFormFeedback>
                  </div>
                </CCol>
              </CRow>
              <div className="mb-3">
                <CFormLabel htmlFor="nome">
                  Nome Completo <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  invalid={!!formErrors.nome}
                  placeholder="DIGITE O NOME COMPLETO"
                />
                <CFormFeedback invalid>{formErrors.nome}</CFormFeedback>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="tipoUsuario">
                  Tipo de Usuário <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  id="tipoUsuario"
                  name="tipoUsuario"
                  value={formData.tipoUsuario}
                  onChange={handleInputChange}
                  invalid={!!formErrors.tipoUsuario}
                >
                  <option value="" disabled>
                    Selecione o tipo de usuário...
                  </option>
                  <option value="PJ">PJ</option>
                  <option value="CLT">CLT</option>
                </CFormSelect>
                <CFormFeedback invalid>{formErrors.tipoUsuario}</CFormFeedback>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButtonGroup className="w-100">
                <CButton
                  className="flex-fill"
                  color="secondary"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  disabled={loading}
                >
                  <CIcon icon={cilX} className="me-1" />
                  Cancelar
                </CButton>
                <CButton className="flex-fill" color="primary" type="submit" disabled={loading}>
                  <CIcon icon={cilCheckAlt} className="me-1" />
                  {loading && <CSpinner size="sm" className="me-2" />}
                  {editingUser ? 'Atualizar' : 'Cadastrar'}
                </CButton>
              </CButtonGroup>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Modal de Confirmação de Exclusão */}
        <CModal alignment="center" visible={showDeleteModal} onClose={cancelDelete} size="md">
          <CModalHeader>
            <CModalTitle className="text-danger">
              <CIcon icon={cilTrash} className="me-2" />
              Confirmar Exclusão
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="text-center mb-3">
              <CIcon icon={cilUser} size="3xl" className="text-muted mb-3" />
              <p className="mb-2">
                <strong>Tem certeza que deseja excluir este usuário?</strong>
              </p>
              {userToDelete && (
                <div className="border rounded p-3 bg-light">
                  <p className="mb-1">
                    <strong>Matrícula:</strong> {userToDelete.matricula}
                  </p>
                  <p className="mb-1">
                    <strong>Nome:</strong> {userToDelete.nome}
                  </p>
                  <p className="mb-0">
                    <strong>CPF:</strong> {formatarCPF(userToDelete.cpf)}
                  </p>
                </div>
              )}
              <p className="text-danger mt-3 mb-0">
                <small>
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita.
                </small>
              </p>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButtonGroup className="w-100">
              <CButton
                className="flex-fill"
                color="secondary"
                onClick={cancelDelete}
                disabled={loading}
              >
                <CIcon icon={cilX} className="me-1" />
                Cancelar
              </CButton>
              <CButton
                className="flex-fill"
                color="danger"
                onClick={confirmDelete}
                disabled={loading}
              >
                <CIcon icon={cilTrash} className="me-1" />
                {loading && <CSpinner size="sm" className="me-2" />}
                Excluir Usuário
              </CButton>
            </CButtonGroup>
          </CModalFooter>
        </CModal>
      </>
    </div>
  )
}

export default Usuarios
