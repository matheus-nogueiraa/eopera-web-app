import React, { useState, useEffect } from 'react'
import './Turmas.css'
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
  CButton,
  CButtonGroup,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormTextarea,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCheckCircle,
  cilPencil,
  cilTrash,
  cilPlus,
  cilPeople,
  cilBook,
  cilSettings,
  cilUser,
  cilGroup,
} from '@coreui/icons'
import { CPagination, CPaginationItem } from '@coreui/react'

const Turmas = () => {
  const [turmas, setTurmas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [cursos, setCursos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [editingTurma, setEditingTurma] = useState(null)

  // Adicionar estado para modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [turmaToDelete, setTurmaToDelete] = useState(null)

  // Adicionar estado para validação
  const [validated, setValidated] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataFim: '',
    cursoIds: [],
    usuariosSelecionados: [],
  })

  // Novo estado para o autocomplete
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false)

  // Novo estado para o autocomplete de cursos
  const [cursoSearch, setCursoSearch] = useState('')
  const [showCursoDropdown, setShowCursoDropdown] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Quantas turmas por página você quer exibir?

  // Dados mockados - substituir por chamadas à API
  useEffect(() => {
    setUsuarios([
      { id: 1, nome: 'João Silva', matricula: '008421', cpf: '12345678901' },
      { id: 2, nome: 'Maria Santos', matricula: '008422', cpf: '12345678902' },
      { id: 3, nome: 'Pedro Oliveira', matricula: '008423', cpf: '12345678903' },
      { id: 4, nome: 'Ana Costa', matricula: '008424', cpf: '12345678904' },
      { id: 5, nome: 'Lucas Pereira', matricula: '008425', cpf: '12345678905' },
      { id: 6, nome: 'Fernanda Lima', matricula: '008426', cpf: '12345678906' },
      { id: 7, nome: 'Roberto Almeida', matricula: '008427', cpf: '12345678907' },
      { id: 8, nome: 'Carla Souza', matricula: '008428', cpf: '12345678908' },
      { id: 9, nome: 'Mariana Rocha', matricula: '008429', cpf: '12345678909' },
      { id: 10, nome: 'Ricardo Martins', matricula: '008430', cpf: '12345678910' },
    ])

    setCursos([
      { id: 1, nome: 'React Fundamentals', categoria: 'Direção' },
      { id: 2, nome: 'JavaScript Avançado', categoria: 'Segurança' },
      { id: 3, nome: 'Node.js Backend', categoria: 'Técnico' },
      { id: 4, nome: 'Python para Iniciantes', categoria: 'Gerencial' },
      { id: 5, nome: 'Full Stack Development', categoria: 'Comercial' },
      { id: 6, nome: 'DevOps Essentials', categoria: 'Financeiro' },
      { id: 7, nome: 'UI/UX Design Fundamentals', categoria: 'Marketing' },
      { id: 8, nome: 'Data Science Basics', categoria: 'RH' },
      { id: 9, nome: 'Cybersecurity Essentials', categoria: 'Jurídico' },
      { id: 10, nome: 'Cloud Computing Basics', categoria: 'Logística' },
    ])

    setTurmas([
      {
        id: 1,
        nome: 'Turma React 2025.1',
        descricao: 'Primeira turma de React do ano',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'React Fundamentals',
        usuarios: ['João Silva', 'Maria Santos'],
        descricao: 'Turma focada em React para iniciantes',
      },
      {
        id: 1,
        nome: 'Turma React 2025.1',
        descricao: 'Primeira turma de React do ano',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'React Fundamentals',
        usuarios: ['João Silva', 'Maria Santos'],
        descricao: 'Turma focada em React para iniciantes',
      },
      {
        id: 2,
        nome: 'Turma JavaScript 2025.1',
        descricao: 'Primeira turma de JavaScript do ano',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'JavaScript Avançado',
        usuarios: ['Pedro Oliveira', 'Ana Costa'],
        descricao: 'Turma focada em JavaScript para intermediários',
      },
      {
        id: 3,
        nome: 'Turma Node.js 2025.1',
        descricao: 'Primeira turma de Node.js do ano',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Node.js Backend',
        usuarios: ['João Silva', 'Ana Costa'],
        descricao: 'Turma focada em desenvolvimento backend com Node.js',
      },
      {
        id: 4,
        nome: 'Turma Python 2025.1',
        descricao: 'Primeira turma de Python do ano',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Python para Iniciantes',
        usuarios: ['Maria Santos', 'Pedro Oliveira'],
        descricao: 'Turma focada em Python para iniciantes',
      },
      {
        id: 5,
        nome: 'Turma Full Stack 2025.1',
        descricao: 'Turma completa de desenvolvimento Full Stack',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Full Stack Development',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em desenvolvimento Full Stack',
      },
      {
        id: 6,
        nome: 'Turma DevOps 2025.1',
        descricao: 'Turma completa de DevOps',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'DevOps Essentials',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em práticas de DevOps',
      },
      {
        id: 7,
        nome: 'Turma UI/UX Design 2025.1',
        descricao: 'Turma completa de UI/UX Design',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'UI/UX Design Fundamentals',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em design de interfaces e experiência do usuário',
      },
      {
        id: 8,
        nome: 'Turma Data Science 2025.1',
        descricao: 'Turma completa de Data Science',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Data Science Basics',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em ciência de dados e análise de dados',
      },
      {
        id: 9,
        nome: 'Turma Cybersecurity 2025.1',
        descricao: 'Turma completa de Cybersecurity',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Cybersecurity Essentials',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em segurança cibernética e proteção de dados',
      },
      {
        id: 10,
        nome: 'Turma Cloud Computing 2025.1',
        descricao: 'Turma completa de Cloud Computing',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Cloud Computing Basics',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em computação em nuvem e serviços de nuvem',
      },
      {
        id: 11,
        nome: 'Turma QA 2025.1',
        descricao: 'Turma completa de Quality Assurance',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'QA Fundamentals',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em garantia de qualidade e testes de software',
      },
      {
        id: 12,
        nome: 'Turma Agile 2025.1',
        descricao: 'Turma completa de Agile e Scrum',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Agile and Scrum Basics',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em metodologias ágeis e Scrum',
      },
      {
        id: 13,
        nome: 'Turma Blockchain 2025.1',
        descricao: 'Turma completa de Blockchain',
        dataInicio: '2025-02-01',
        dataFim: '2025-04-30',
        curso: 'Blockchain Basics',
        usuarios: ['João Silva', 'Ana Costa', 'Maria Santos'],
        descricao: 'Turma focada em tecnologia Blockchain e suas aplicações',
      },
    ])
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUsuarioToggle = (usuarioId) => {
    setFormData((prev) => ({
      ...prev,
      usuariosSelecionados: prev.usuariosSelecionados.includes(usuarioId)
        ? prev.usuariosSelecionados.filter((id) => id !== usuarioId)
        : [...prev.usuariosSelecionados, usuarioId],
    }))
  }

  const removeUsuario = (usuarioId) => {
    setFormData((prev) => ({
      ...prev,
      usuariosSelecionados: prev.usuariosSelecionados.filter((id) => id !== usuarioId),
    }))
  }

  const handleCursoToggle = (cursoId) => {
    setFormData((prev) => ({
      ...prev,
      cursoIds: prev.cursoIds.includes(cursoId)
        ? prev.cursoIds.filter((id) => id !== cursoId)
        : [...prev.cursoIds, cursoId],
    }))
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
      usuario.matricula.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
      usuario.cpf.toLowerCase().includes(usuarioSearch.toLowerCase()),
  )

  // Novo filtro para cursos
  const filteredCursos = cursos.filter(
    (curso) =>
      curso.nome.toLowerCase().includes(cursoSearch.toLowerCase()) ||
      curso.categoria.toLowerCase().includes(cursoSearch.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cursoIds: [],
      usuariosSelecionados: [],
    })
    setUsuarioSearch('')
    setCursoSearch('')
    setEditingTurma(null)

    // Resetar validação
    setValidated(false)
  }

  const customTooltipStyle = {
    '--cui-tooltip-bg': '#333',
    '--cui-tooltip-color': '#fff',
    '--cui-tooltip-max-width': '500px',
    fontSize: '1em',
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
      return
    }

    // Validações customizadas
    if (formData.usuariosSelecionados.length === 0) {
      setAlertMessage('Selecione pelo menos um usuário para a turma!')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      setValidated(true)
      return
    }

    if (formData.cursoIds.length === 0) {
      setAlertMessage('Selecione pelo menos um curso para a turma!')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      setValidated(true)
      return
    }

    setValidated(true)

    const cursosSelecionados = cursos.filter((c) => formData.cursoIds.includes(c.id))
    const usuariosSelecionados = usuarios.filter((u) =>
      formData.usuariosSelecionados.includes(u.id),
    )

    const novaTurma = {
      id: editingTurma ? editingTurma.id : Date.now(),
      nome: formData.nome,
      descricao: formData.descricao,
      curso: cursosSelecionados.map((c) => c.nome),
      usuarios: usuariosSelecionados.map((u) => u.nome),
    }

    // Exibir o objeto da turma no console ao salvar
    if (editingTurma) {
      setTurmas((prev) => prev.map((t) => (t.id === editingTurma.id ? novaTurma : t)))
      setAlertMessage('Turma atualizada com sucesso!')
    } else {
      setTurmas((prev) => [...prev, novaTurma])
      setAlertMessage('Turma criada com sucesso!')
    }

    setShowAlert(true)
    setShowModal(false)
    resetForm()

    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleEdit = (turma) => {
    setEditingTurma(turma)
    setFormData({
      nome: turma.nome,
      descricao: turma.descricao,
      dataInicio: turma.dataInicio,
      dataFim: turma.dataFim,
      cursoIds: cursos.filter((c) => turma.curso.split(', ').includes(c.nome)).map((c) => c.id), // Múltiplos cursos
      usuariosSelecionados: usuarios
        .filter((u) => turma.usuarios.includes(u.nome))
        .map((u) => u.id),
    })
    setShowModal(true)
  }

  const handleDelete = (turmaId) => {
    const turma = turmas.find((t) => t.id === turmaId)
    setTurmaToDelete(turma)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (turmaToDelete) {
      setTurmas((prev) => prev.filter((t) => t.id !== turmaToDelete.id))
      setAlertMessage('Turma excluída com sucesso!')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
    setShowDeleteModal(false)
    setTurmaToDelete(null)
  }

  // Adicionar função para remover curso (estava faltando)
  const removeCurso = (cursoId) => {
    setFormData((prev) => ({
      ...prev,
      cursoIds: prev.cursoIds.filter((id) => id !== cursoId),
    }))
  }

  // Paginação
  const totalPages = Math.ceil(turmas.length / itemsPerPage)
  const paginatedTurmas = turmas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Gestão de Turmas</h1>
          <p className="mb-0 text-muted">Crie e gerencie turmas e seus cursos</p>
        </div>
      </div>

      {showAlert && (
        <CAlert color="success" className="mb-4">
          <CIcon icon={cilCheckCircle} className="me-2" />
          {alertMessage}
        </CAlert>
      )}

      {/* Estatísticas */}
      <CRow className="g-4">
        <CCol sm={6} lg={4}>
          <CCard className="text-white bg-primary">
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-5 fw-semibold">{turmas.length}</div>
                <div>Turmas Ativas</div>
              </div>
              <CIcon icon={cilPeople} height={24} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={4}>
          <CCard className="text-white bg-success">
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-5 fw-semibold">{usuarios.length}</div>
                <div>Usuários Total</div>
              </div>
              <CIcon icon={cilUser} height={24} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={4}>
          <CCard className="text-white bg-secondary">
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-5 fw-semibold">{cursos.length}</div>
                <div>Cursos Disponíveis</div>
              </div>
              <CIcon icon={cilBook} height={24} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <hr />

      {/* Tabela de Turmas */}
      <CRow className="mb-4">
        <CCol lg={12}>
          <CButton color="primary" className="w-100" onClick={() => setShowModal(true)}>
            <CIcon icon={cilPlus} className="me-2" />
            Nova Turma
          </CButton>
        </CCol>
      </CRow>
      <CRow className="g-3">
        <CCol lg={12}>
          <CTable hover bordered align="middle" responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nome da Turma</CTableHeaderCell>
                <CTableHeaderCell>Cursos</CTableHeaderCell>
                <CTableHeaderCell>Alunos</CTableHeaderCell>
                <CTableHeaderCell>Descrição</CTableHeaderCell>
                <CTableHeaderCell>Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedTurmas.map((turma) => (
                <CTableRow key={turma.id}>
                  {/* Estilização personalizada para o nome da turma */}
                  <CTableDataCell
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                      cursor: 'pointer',
                      color: '#90171B',
                    }}
                  >
                    <CIcon icon={cilGroup} height={18} className="me-2" />
                    {turma.nome}
                  </CTableDataCell>

                  {/* Estilização personalizada para os cursos */}
                  <CTableDataCell
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                      cursor: 'pointer',
                      color: '#353738ff',
                    }}
                  >
                    <CTooltip
                      content={Array.isArray(turma.curso) ? turma.curso.join(', ') : turma.curso}
                      placement="top"
                      style={customTooltipStyle}
                    >
                      <span>
                        {' '}
                        <CIcon icon={cilBook} height={18} className="me-2" />
                        {(Array.isArray(turma.curso)
                          ? turma.curso
                          : typeof turma.curso === 'string'
                            ? turma.curso.split(',').map((c) => c.trim())
                            : []
                        ).join(', ')}
                      </span>
                    </CTooltip>
                  </CTableDataCell>

                  {/* Estilização personalizada para os alunos */}
                  <CTableDataCell
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                      cursor: 'pointer',
                      color: '#039660ff',
                    }}
                  >
                    <CIcon icon={cilUser} height={16} className="me-2" />
                    {turma.usuarios.length} Alunos
                  </CTableDataCell>
                  <CTableDataCell
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                      cursor: 'pointer',
                    }}
                  >
                    <CTooltip content={turma.descricao} placement="top" style={customTooltipStyle}>
                      <span>{turma.descricao}</span>
                    </CTooltip>
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <CButtonGroup size="sm">
                      <CButton
                        onClick={() => handleEdit(turma)}
                        color="secondary"
                        variant="ghost"
                        className="d-flex align-items-center"
                        title="Editar"
                      >
                        <CIcon icon={cilPencil} className="me-2" />
                      </CButton>
                      <CButton
                        onClick={() => handleDelete(turma.id)}
                        color="danger"
                        variant="ghost"
                        className="d-flex align-items-center"
                        title="Excluir"
                      >
                        <CIcon icon={cilTrash} className="me-2" />
                      </CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Paginação */}
          <CPagination align="end" className="mt-2">
            <CPaginationItem
              aria-label="Previous"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>

            {Array.from({ length: totalPages }, (_, idx) => (
              <CPaginationItem
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </CPaginationItem>
            ))}

            <CPaginationItem
              aria-label="Next"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            >
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        </CCol>
      </CRow>

      {/* Modal de Confirmação de Exclusão */}
      <CModal
        alignment="center"
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setTurmaToDelete(null)
        }}
        aria-labelledby="confirmarExclusao"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle id="confirmarExclusao">Confirmar Exclusão</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="text-center">
            <CIcon icon={cilTrash} size="xl" className="text-danger mb-3" />
            <h5>Tem certeza que deseja excluir esta turma?</h5>
            {turmaToDelete && (
              <div className="mt-3">
                <strong>{turmaToDelete.nome}</strong>
                <p className="text-muted mb-0">{turmaToDelete.descricao}</p>
              </div>
            )}
            <p className="text-danger mt-3 mb-0">
              <strong>Esta ação não pode ser desfeita!</strong>
            </p>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setTurmaToDelete(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            <CIcon icon={cilTrash} className="me-2" />
            Excluir Turma
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de Criação/Edição */}
      <CModal
        alignment="center"
        visible={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        aria-labelledby="novaTurma"
        size="lg"
        backdrop="static"
        fullscreen="md-down"
      >
        <CModalHeader>
          <CModalTitle id="novaTurma">{editingTurma ? 'Editar Turma' : 'Nova Turma'}</CModalTitle>
        </CModalHeader>
        <CForm
          className="needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CModalBody>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel htmlFor="nome">
                  Nome da Turma:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome da turma"
                  required
                  invalid={validated && !formData.nome}
                />
                <div className="invalid-feedback">Por favor, insira o nome da turma.</div>
              </CCol>

              <div className="mt-4">
                <CFormLabel>
                  Alunos da Turma:<span className="text-danger">*</span>
                </CFormLabel>

                {/* Campo de busca com autocomplete */}
                <div className="position-relative">
                  <CFormInput
                    type="text"
                    placeholder="Buscar usuários por nome, matrícula ou CPF..."
                    value={usuarioSearch}
                    onChange={(e) => {
                      setUsuarioSearch(e.target.value)
                      setShowUsuarioDropdown(true)
                    }}
                    onFocus={() => setShowUsuarioDropdown(true)}
                    className="mb-2"
                    invalid={validated && formData.usuariosSelecionados.length === 0}
                  />
                  {validated && formData.usuariosSelecionados.length === 0 && (
                    <div className="invalid-feedback d-block">
                      Selecione pelo menos um usuário para a turma.
                    </div>
                  )}

                  {/* Dropdown com resultados filtrados */}
                  {showUsuarioDropdown && usuarioSearch && (
                    <div
                      className="shadow-sm bg-white position-absolute w-100 z-2"
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {filteredUsuarios.length > 0 ? (
                        filteredUsuarios
                          .filter((usuario) => !formData.usuariosSelecionados.includes(usuario.id))
                          .map((usuario) => (
                            <div
                              key={usuario.id}
                              className="p-2 border-bottom cursor-pointer hover-bg-light"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                handleUsuarioToggle(usuario.id)
                                setUsuarioSearch('')
                                setShowUsuarioDropdown(false)
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                            >
                              <div>
                                <strong>{usuario.nome}</strong>
                                <br />
                                <small className="text-muted">
                                  Matrícula: {usuario.matricula} | CPF: {usuario.cpf}
                                </small>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-2 text-muted">Nenhum usuário encontrado</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Usuários selecionados exibidos como badges */}
                {formData.usuariosSelecionados.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">Usuários selecionados:</small>
                    <div className="mt-1">
                      {usuarios
                        .filter((usuario) => formData.usuariosSelecionados.includes(usuario.id))
                        .map((usuario) => (
                          <CBadge
                            key={usuario.id}
                            color="primary"
                            className="me-1 mb-1 d-inline-flex align-items-center"
                          >
                            {usuario.nome}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.65em' }}
                              onClick={() => removeUsuario(usuario.id)}
                              aria-label="Remover usuário"
                            />
                          </CBadge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Clique fora para fechar dropdown */}
                {showUsuarioDropdown && (
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1 }}
                    onClick={() => setShowUsuarioDropdown(false)}
                  />
                )}
              </div>
              <CCol md={12}>
                <CFormLabel htmlFor="cursoId">
                  Cursos:<span className="text-danger">*</span>
                </CFormLabel>

                {/* Campo de busca com autocomplete para cursos */}
                <div className="position-relative">
                  <CFormInput
                    type="text"
                    placeholder="Buscar cursos por título ou categoria..."
                    value={cursoSearch}
                    onChange={(e) => {
                      setCursoSearch(e.target.value)
                      setShowCursoDropdown(true)
                    }}
                    onFocus={() => setShowCursoDropdown(true)}
                    className="mb-2"
                    invalid={validated && formData.cursoIds.length === 0}
                  />
                  {validated && formData.cursoIds.length === 0 && (
                    <div className="invalid-feedback d-block">
                      Selecione pelo menos um curso para a turma.
                    </div>
                  )}

                  {/* Dropdown com resultados filtrados de cursos */}
                  {showCursoDropdown && cursoSearch && (
                    <div
                      className="border rounded shadow-sm bg-white position-absolute w-100 z-3"
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {filteredCursos.length > 0 ? (
                        filteredCursos
                          .filter((curso) => !formData.cursoIds.includes(curso.id))
                          .map((curso) => (
                            <div
                              key={curso.id}
                              className="p-2 border-bottom cursor-pointer hover-bg-light"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                handleCursoToggle(curso.id)
                                setCursoSearch('')
                                setShowCursoDropdown(false)
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                            >
                              <div>
                                <strong>{curso.nome}</strong>
                                <br />
                                <small className="text-muted">Categoria: {curso.categoria}</small>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-2 text-muted">Nenhum curso encontrado</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cursos selecionados exibidos como badges */}
                {formData.cursoIds.length > 0 && (
                  <div className="mt-2 mb-3">
                    <small className="text-muted">Cursos selecionados:</small>
                    <div className="mt-1">
                      {cursos
                        .filter((curso) => formData.cursoIds.includes(curso.id))
                        .map((curso) => (
                          <CBadge
                            key={curso.id}
                            color="primary"
                            className="me-1 mb-1 d-inline-flex align-items-center"
                          >
                            {curso.nome}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.65em' }}
                              onClick={() => removeCurso(curso.id)}
                              aria-label="Remover curso"
                            />
                          </CBadge>
                        ))}
                    </div>
                  </div>
                )}
                {/* Campo de seleção de cursos com checkboxes (mantido) */}
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={12}>
                <CFormTextarea
                  id="descricao"
                  floatingLabel="Descrição da turma"
                  style={{ height: '100px' }}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição da turma"
                  required
                  invalid={validated && !formData.descricao}
                />
                <div className="invalid-feedback">Por favor, insira a descrição da turma.</div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancelar
            </CButton>
            <CButton color="primary" type="submit">
              {editingTurma ? 'Atualizar' : 'Criar'} Turma
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default Turmas
