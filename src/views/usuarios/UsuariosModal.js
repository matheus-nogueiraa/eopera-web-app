import React, { useState, useEffect } from 'react'
import {
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CFormSwitch,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { consultarFuncionarioClt } from '../../services/dadosPorCpf'
import { gerenciarUsuarios } from '../../services/campoGruposCentralizados'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

const UsuariosModal = ({
  showModal,
  setShowModal,
  editingUser,
  loading,
  formData,
  setFormData,
  formErrors,
  handleSubmit,
}) => {
  const [consultandoCpf, setConsultandoCpf] = useState(false)
  const [alertCpf, setAlertCpf] = useState({ show: false, message: '', color: 'info' })
  const [gruposCentralizados, setGruposCentralizados] = useState([])
  const [gruposFiltrados, setGruposFiltrados] = useState([])
  const [carregandoGrupos, setCarregandoGrupos] = useState(false)
  const [searchGrupo, setSearchGrupo] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Carregar grupos centralizados ao abrir o modal
  useEffect(() => {
    if (showModal) {
      carregarGruposCentralizados()
      // Resetar campo de busca ao abrir o modal
      setSearchGrupo('')
      setShowDropdown(false)
    }
  }, [showModal])

  // Sincronizar searchGrupo com formData ao carregar usuário para edição
  useEffect(() => {
    if (editingUser && formData.grupoCentralizador) {
      setSearchGrupo(formData.grupoCentralizador)
    }
  }, [editingUser, formData.grupoCentralizador])

  // Filtrar grupos quando o usuário digita
  useEffect(() => {
    console.log('useEffect filtros executado:', {
      gruposCentralizados: gruposCentralizados.length,
      searchGrupo: searchGrupo,
      searchGrupoTrim: searchGrupo.trim(),
    })

    if (!gruposCentralizados || gruposCentralizados.length === 0) {
      console.log('Nenhum grupo carregado ainda')
      setGruposFiltrados([])
      return
    }

    if (searchGrupo.trim() === '') {
      // Se não há busca, mostrar os primeiros 10 grupos
      console.log('Sem busca, mostrando primeiros 10 grupos')
      const primeiros10 = gruposCentralizados.slice(0, 10)
      console.log('Primeiros 10 grupos:', primeiros10)
      setGruposFiltrados(primeiros10)
    } else {
      // Filtrar grupos baseado na busca
      console.log('Filtrando grupos...')
      const filtrados = gruposCentralizados
        .filter((grupo) => {
          const descricaoLower = grupo.descricao.toLowerCase().trim()
          const searchLower = searchGrupo.toLowerCase().trim()
          const codGrupoString = grupo.codGrupo.toString()

          const matchDescricao = descricaoLower.includes(searchLower)
          const matchCodigo = codGrupoString.includes(searchGrupo.trim())

          return matchDescricao || matchCodigo
        })
        .slice(0, 10) // Limitar a 10 resultados

      console.log('Grupos filtrados encontrados:', filtrados.length, filtrados)
      setGruposFiltrados(filtrados)
    }
  }, [searchGrupo, gruposCentralizados])

  const carregarGruposCentralizados = async () => {
    setCarregandoGrupos(true)
    try {
      const grupos = await gerenciarUsuarios.getGruposCentralizados()
      console.log('Grupos carregados da API:', grupos)

      if (Array.isArray(grupos) && grupos.length > 0) {
        // Verificar se os dados têm a estrutura esperada
        const primeiroGrupo = grupos[0]
        if (primeiroGrupo.codGrupo && primeiroGrupo.descricao) {
          console.log('Estrutura dos dados válida:', primeiroGrupo)
          setGruposCentralizados(grupos)
          // Inicializar com os primeiros 10 grupos
          setGruposFiltrados(grupos.slice(0, 10))
        } else {
          console.error('Estrutura de dados inválida:', primeiroGrupo)
          setGruposCentralizados([])
          setGruposFiltrados([])
        }
      } else {
        console.log('Nenhum grupo encontrado ou formato inválido')
        setGruposCentralizados([])
        setGruposFiltrados([])
      }
    } catch (error) {
      console.error('Erro ao carregar grupos centralizados:', error)
      showCpfAlert('Erro ao carregar grupos centralizados', 'danger')
      setGruposCentralizados([])
      setGruposFiltrados([])
    } finally {
      setCarregandoGrupos(false)
    }
  }

  // Event listener para fechar dropdown com ESC ou clique fora
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
      }
    }

    const handleClickOutside = (event) => {
      // Verificar se o clique foi fora do campo de busca e dropdown
      if (
        !event.target.closest('#grupoCentralizador') &&
        !event.target.closest('[data-dropdown="grupo-centralizador"]')
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('keydown', handleEscapeKey)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown])

  const handleGrupoSearch = (e) => {
    const value = e.target.value
    console.log('handleGrupoSearch - Valor digitado:', value)
    console.log('handleGrupoSearch - Grupos disponíveis:', gruposCentralizados.length)

    setSearchGrupo(value)

    // Sempre mostrar dropdown quando o usuário digita (se há grupos carregados)
    if (gruposCentralizados.length > 0) {
      setShowDropdown(true)
    }

    // Limpar o valor do formData se o usuário estiver digitando algo diferente
    // do que foi selecionado anteriormente
    const valorAtual = `${value.split(' - ')[0]} - ${value.split(' - ')[1] || ''}`.trim()
    if (formData.grupoCentralizador !== valorAtual && !value.includes(' - ')) {
      setFormData((prev) => ({
        ...prev,
        grupoCentralizador: '',
      }))
    }
  }

  const handleGrupoSelect = (grupo) => {
    const valorCompleto = `${grupo.codGrupo} - ${grupo.descricao.trim()}`
    console.log('Grupo selecionado:', valorCompleto)
    console.log('Dados do grupo:', { codGrupo: grupo.codGrupo, descricao: grupo.descricao })

    setSearchGrupo(valorCompleto)
    setShowDropdown(false)

    // Atualizar o formData com o valor selecionado
    setFormData((prev) => ({
      ...prev,
      grupoCentralizador: valorCompleto,
    }))
  }

  const showCpfAlert = (message, color = 'info') => {
    setAlertCpf({ show: true, message, color })
    setTimeout(() => setAlertCpf({ show: false, message: '', color: 'info' }), 4000)
  }

  const consultarDadosPorCpf = async (cpf) => {
    if (!cpf || cpf.length !== 11) return

    setConsultandoCpf(true)

    try {
      const dadosFuncionario = await consultarFuncionarioClt(cpf)

      if (dadosFuncionario && dadosFuncionario.length > 0) {
        const funcionario = dadosFuncionario[0]

        // Debug: Vamos ver todos os dados que estão vindo da API
        console.log('Dados completos da API:', funcionario)
        console.log('DDD da API:', funcionario.ddd)
        console.log('Celular da API:', funcionario.celular)

        // Formar o número completo com DDD + celular (10 dígitos total)
        let numeroCompleto = ''

        // Verificar se ambos os campos existem
        if (funcionario.ddd && funcionario.celular) {
          const ddd = funcionario.ddd.toString().padStart(2, '0') // Garantir 2 dígitos
          const celularLimpo = funcionario.celular.toString().replace(/[^\d]/g, '') // Remove qualquer formatação

          console.log('DDD processado:', ddd)
          console.log('Celular limpo:', celularLimpo)

          // Forma o número completo: DDD (2 dígitos) + celular (8 dígitos) = 10 dígitos total
          const numeroCompleto10Digitos = ddd + celularLimpo
          console.log('Número completo antes da formatação:', numeroCompleto10Digitos)

          if (numeroCompleto10Digitos.length === 10) {
            // Aplica formatação: (XX) XXXX-XXXX
            numeroCompleto = numeroCompleto10Digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
            console.log('Número formatado:', numeroCompleto)
          } else {
            // Se não conseguir formar 10 dígitos, tenta usar apenas o celular
            console.log('Não conseguiu formar 10 dígitos, usando celular original')
            numeroCompleto = funcionario.celular || ''
          }
        } else {
          console.log('DDD ou celular não encontrados na API')
          console.log('DDD existe:', !!funcionario.ddd)
          console.log('Celular existe:', !!funcionario.celular)

          // Se não tem DDD, usa apenas o celular
          if (funcionario.celular) {
            numeroCompleto = funcionario.celular.toString()
          }
        }

        // Preencher automaticamente os campos com os dados da API
        setFormData((prev) => ({
          ...prev,
          nome: funcionario.nome || '',
          matricula: funcionario.matricula || '',
          celular: numeroCompleto,
        }))

        showCpfAlert('Dados do funcionário encontrados e preenchidos automaticamente!', 'success')
      } else {
        showCpfAlert('CPF não encontrado.', 'warning')

        // Se não encontrou dados CLT, limpar os campos para permitir inserção manual (PJ)
        if (formData.tipoUsuario === 'PJ') {
          setFormData((prev) => ({
            ...prev,
            nome: '',
            matricula: '',
            celular: '',
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao consultar CPF:', error)
      showCpfAlert('Erro ao consultar dados do CPF. Preencha os dados manualmente.', 'danger')
    } finally {
      setConsultandoCpf(false)
    }
  }

  const handleInputChange = async (e) => {
    const { name, value, checked } = e.target
    let newValue = value

    // Para switches, usar checked ao invés de value
    if (['ativo', 'supervisor', 'numOperacional', 'userIpal', 'userSesmt'].includes(name)) {
      newValue = checked ? 'S' : 'N'
    } else {
      // Formatação automática do CPF
      if (name === 'cpf') {
        // Remove caracteres não numéricos
        const cpfLimpo = value.replace(/[^\d]/g, '')

        // Limita a 11 dígitos
        const cpfNumerico = cpfLimpo.substring(0, 11)

        // Aplica formatação
        if (cpfNumerico.length >= 11) {
          newValue = cpfNumerico.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

          // Se for CLT e o CPF está completo (11 dígitos), consultar a API
          if (formData.tipoUsuario === 'CLT' && cpfNumerico.length === 11) {
            // Usar setTimeout para permitir que o estado seja atualizado primeiro
            setTimeout(() => {
              consultarDadosPorCpf(cpfNumerico)
            }, 100)
          }
        } else if (cpfNumerico.length >= 7) {
          newValue = cpfNumerico.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
        } else if (cpfNumerico.length >= 4) {
          newValue = cpfNumerico.replace(/(\d{3})(\d{1,3})/, '$1.$2')
        } else {
          newValue = cpfNumerico
        }
      }

      // Formatação automática do celular - SOMENTE 10 DÍGITOS
      if (name === 'celular') {
        newValue = value.replace(/[^\d]/g, '')
        newValue = newValue.substring(0, 10)

        if (newValue.length === 10) {
          newValue = newValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        } else if (newValue.length > 6) {
          newValue = newValue.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
        } else if (newValue.length > 2) {
          newValue = newValue.replace(/(\d{2})(\d+)/, '($1) $2')
        }
      }

      // Converter nome para maiúsculas (removido grupoCentralizador daqui)
      if (name === 'nome') {
        newValue = value.toUpperCase()
      }
    }

    // Se mudou o tipo de usuário, limpar TODOS os campos
    if (name === 'tipoUsuario') {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        // Limpar todos os campos independente do tipo selecionado
        cpf: '',
        nome: '',
        matricula: '',
        celular: '',
        senha: '',
        grupoCentralizador: '',
        projetoPj: '',
        supervisor: 'N',
        numOperacional: 'N',
        userIpal: 'N',
        userSesmt: 'N',
        ativo: 'S', // Manter ativo como padrão
      }))

      // Limpar também o campo de pesquisa do grupo
      setSearchGrupo('')
      setShowDropdown(false)

      // Limpar alerta ao trocar tipo de usuário
      setAlertCpf({ show: false, message: '', color: 'info' })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }))
    }
  }

  // Verificar se é PJ ou CLT
  const isPJ = formData.tipoUsuario === 'PJ'
  const isCLT = formData.tipoUsuario === 'CLT'
  const noTypeSelected = !formData.tipoUsuario || formData.tipoUsuario === ''

  return (
    <>
      <CModal alignment="center" visible={showModal} onClose={() => setShowModal(false)} size="xl">
        <CModalHeader>
          <CModalTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertCpf.show && (
            <CAlert color={alertCpf.color} className="d-flex align-items-center mb-3">
              {consultandoCpf && <CSpinner size="sm" className="me-2" />}
              {alertCpf.message}
            </CAlert>
          )}

          <CForm onSubmit={handleSubmit}>
            <CRow>
              {/* Campo do tipo de usuario */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="tipoUsuario" className="mb-2">
                  Tipo de Contrato:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  id="tipoUsuario"
                  name="tipoUsuario"
                  value={formData.tipoUsuario}
                  onChange={handleInputChange}
                  invalid={!!formErrors.tipoUsuario}
                  disabled={loading}
                  required
                >
                  <option value="" disabled>
                    Selecione o tipo de usuário
                  </option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                </CFormSelect>
                <CFormFeedback invalid>{formErrors.tipoUsuario}</CFormFeedback>
              </CCol>

              {/* Campo para CPF */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="cpf" className="mb-2">
                  CPF:<span className="text-danger">*</span>
                  {consultandoCpf && <CSpinner size="sm" className="ms-2" />}
                </CFormLabel>
                <CFormInput
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  invalid={!!formErrors.cpf}
                  disabled={loading || noTypeSelected || consultandoCpf}
                  required
                  placeholder={
                    noTypeSelected
                      ? 'Selecione primeiro o tipo de usuário'
                      : consultandoCpf
                        ? 'Consultando...'
                        : 'Digite o CPF'
                  }
                />
                <CFormFeedback invalid>{formErrors.cpf}</CFormFeedback>
              </CCol>

              {/* Campo para o nome */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="nome" className="mb-2">
                  Nome:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  invalid={!!formErrors.nome}
                  disabled={loading || noTypeSelected || consultandoCpf || (isCLT && !editingUser)}
                  required={isPJ}
                  placeholder={
                    noTypeSelected
                      ? 'Selecione primeiro o tipo de usuário'
                      : isCLT && !editingUser
                        ? 'Nome será preenchido automaticamente.'
                        : 'Digite o nome'
                  }
                />
                <CFormFeedback invalid>{formErrors.nome}</CFormFeedback>
              </CCol>
            </CRow>

            <CRow className="mb-1">
              {/* Campo para a matricula ou Projeto PJ */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor={isPJ ? 'projetoPj' : 'matricula'} className="mb-2">
                  {isPJ ? 'Projeto PJ' : 'Matrícula'}:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  id={isPJ ? 'projetoPj' : 'matricula'}
                  name={isPJ ? 'projetoPj' : 'matricula'}
                  value={isPJ ? formData.projetoPj || '' : formData.matricula}
                  onChange={handleInputChange}
                  invalid={isPJ ? !!formErrors.projetoPj : !!formErrors.matricula}
                  disabled={loading || noTypeSelected || consultandoCpf || (isCLT && !editingUser)}
                  required={isPJ}
                  placeholder={
                    noTypeSelected
                      ? 'Selecione primeiro o tipo de usuário'
                      : isCLT && !editingUser
                        ? 'Matrícula será preenchida automaticamente.'
                        : isPJ
                          ? '000001'
                          : 'Digite a matrícula'
                  }
                />
                <CFormFeedback invalid>
                  {isPJ ? formErrors.projetoPj : formErrors.matricula}
                </CFormFeedback>
              </CCol>

              {/* Campo para o celular */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="celular" className="mb-2">
                  Contato:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  invalid={!!formErrors.celular}
                  disabled={loading || noTypeSelected || consultandoCpf || (isCLT && !editingUser)}
                  placeholder={
                    noTypeSelected
                      ? 'Selecione primeiro o tipo de usuário'
                      : isCLT && !editingUser
                        ? 'DDD + Celular será preenchido automaticamente.'
                        : '(62) 9999-9999'
                  }
                  required={isPJ}
                />
                <CFormFeedback invalid>{formErrors.celular}</CFormFeedback>
              </CCol>

              {/* Campo para senha */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="senha" className="mb-2">
                  Crie uma senha:<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleInputChange}
                  invalid={!!formErrors.senha}
                  disabled={loading || noTypeSelected}
                  required
                  placeholder={
                    noTypeSelected ? 'Selecione primeiro o tipo de usuário' : 'Digite a senha'
                  }
                />
                <CFormFeedback invalid>{formErrors.senha}</CFormFeedback>
              </CCol>

              {/* Campo para o grupo centralizador com autocomplete */}
              <CCol md={12} className="mb-4">
                <CFormLabel htmlFor="grupoCentralizador" className="mb-2">
                  Grupo Centralizador:<span className="text-danger">*</span>
                  {carregandoGrupos && <CSpinner size="sm" className="ms-2" />}
                </CFormLabel>

                <div className="position-relative">
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      id="grupoCentralizador"
                      name="grupoCentralizador"
                      value={searchGrupo}
                      onChange={handleGrupoSearch}
                      onFocus={() => setShowDropdown(true)}
                      invalid={!!formErrors.grupoCentralizador}
                      disabled={loading || noTypeSelected || carregandoGrupos}
                      required
                      placeholder={
                        noTypeSelected
                          ? 'Selecione primeiro o tipo de usuário'
                          : carregandoGrupos
                            ? 'Carregando grupos...'
                            : 'Digite para buscar o grupo centralizador'
                      }
                      autoComplete="off"
                    />
                  </CInputGroup>

                  {/* Dropdown com os grupos filtrados */}
                  {showDropdown && !carregandoGrupos && gruposFiltrados.length > 0 && (
                    <div
                      data-dropdown="grupo-centralizador"
                      className="position-absolute w-100 bg-white border border-light-subtle rounded shadow-sm"
                      style={{
                        top: '100%',
                        zIndex: 1050,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {gruposFiltrados.map((grupo) => (
                        <div
                          key={grupo.codGrupo}
                          className="px-3 py-2 cursor-pointer border-bottom border-light"
                          style={{
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                          onClick={() => handleGrupoSelect(grupo)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="text-primary">{grupo.codGrupo}</strong>
                              <span className="ms-2 text-dark">{grupo.descricao.trim()}</span>
                            </div>
                            <small className="text-muted">Clique para selecionar</small>
                          </div>
                        </div>
                      ))}

                      {/* Mostrar mensagem se não encontrou resultados na busca */}
                      {searchGrupo.trim() !== '' && gruposFiltrados.length === 0 && (
                        <div className="px-3 py-2 text-muted text-center">
                          <small>Nenhum grupo encontrado para "{searchGrupo}"</small>
                        </div>
                      )}

                      {/* Botão para fechar o dropdown */}
                      <div className="px-3 py-2 border-top bg-light">
                        <small
                          className="text-muted cursor-pointer text-center d-block"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowDropdown(false)}
                        >
                          Clique aqui ou pressione ESC para fechar
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Mostrar mensagem quando não há grupos carregados */}
                  {showDropdown && !carregandoGrupos && gruposCentralizados.length === 0 && (
                    <div
                      className="position-absolute w-100 bg-white border border-light-subtle rounded shadow-sm"
                      style={{
                        top: '100%',
                        zIndex: 1050,
                      }}
                    >
                      <div className="px-3 py-2 text-muted text-center">
                        <small>Nenhum grupo centralizador encontrado</small>
                      </div>
                    </div>
                  )}
                </div>

                <CFormFeedback invalid>{formErrors.grupoCentralizador}</CFormFeedback>
              </CCol>
            </CRow>
            {isCLT && (
              <small style={{ color: 'primary' }} className="text-muted">
                Para usuários CLT, os dados serão preenchidos automaticamente após digitar o CPF
                completo.
              </small>
            )}

            <hr />

            <CRow className="mb-3">
              {/* Campo para indicar se é supervisor */}
              <CCol md={2}>
                <CFormSwitch
                  size="xl"
                  label="Supervisor"
                  id="supervisor"
                  name="supervisor"
                  checked={formData.supervisor === 'S'}
                  onChange={handleInputChange}
                  disabled={loading || noTypeSelected}
                />
                <CFormFeedback invalid>{formErrors.supervisor}</CFormFeedback>
              </CCol>

              {/* Campo para indicar se possui equipe */}
              <CCol md={2}>
                <CFormSwitch
                  size="xl"
                  label="Possui Equipe"
                  id="numOperacional"
                  name="numOperacional"
                  checked={formData.numOperacional === 'S'}
                  onChange={handleInputChange}
                  disabled={loading || noTypeSelected}
                />
                <CFormFeedback invalid>{formErrors.numOperacional}</CFormFeedback>
              </CCol>

              {/* Campo para indicar se é um usuario IPAL */}
              <CCol md={2}>
                <CFormSwitch
                  size="xl"
                  label="Usuário IPAL"
                  id="userIpal"
                  name="userIpal"
                  checked={formData.userIpal === 'S'}
                  onChange={handleInputChange}
                  disabled={loading || noTypeSelected}
                />
                <CFormFeedback invalid>{formErrors.userIpal}</CFormFeedback>
              </CCol>

              {/* Campo para indicar se é um usuario SESMT */}
              <CCol md={2}>
                <CFormSwitch
                  size="xl"
                  label="SESMT"
                  id="userSesmt"
                  name="userSesmt"
                  checked={formData.userSesmt === 'S'}
                  onChange={handleInputChange}
                  disabled={loading || noTypeSelected}
                />
                <CFormFeedback invalid>{formErrors.userSesmt}</CFormFeedback>
              </CCol>

              {/* Campo para o status do usuário */}
              <CCol md={3}>
                <CFormSwitch
                  size="xl"
                  label="Ativo ou inativo"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo === 'S'}
                  onChange={handleInputChange}
                  disabled={loading || noTypeSelected}
                />
                <CFormFeedback invalid>{formErrors.ativo}</CFormFeedback>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={loading || consultandoCpf}>
            {loading ? <CSpinner size="sm" className="me-1" /> : null}
            {editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsuariosModal
