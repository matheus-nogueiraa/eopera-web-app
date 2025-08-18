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
import { editarFuncionario } from '../../services/alterarUsuario'
import { gerenciaGruposCentralizados } from '../../services/campoGruposCentralizados'
import { gerenciarUsuarios } from '../../services/gerenciarUsuarios'
import { consultarListaProjetos } from '../../services/consultarProjetosPj'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCheckCircle, cilWarning } from '@coreui/icons'

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

  // Estados para projetos PJ
  const [projetosPj, setProjetosPj] = useState([])
  const [projetosPjFiltrados, setProjetosPjFiltrados] = useState([])
  const [carregandoProjetosPj, setCarregandoProjetosPj] = useState(false)
  const [searchProjetoPj, setSearchProjetoPj] = useState('')
  const [showDropdownProjetoPj, setShowDropdownProjetoPj] = useState(false)

  // Estados para modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [originalData, setOriginalData] = useState(null)

  // Novo estado para controlar o carregamento dos dados de edição
  const [carregandoDadosEdicao, setCarregandoDadosEdicao] = useState(false)

  // Carregar grupos centralizados ao abrir o modal
  useEffect(() => {
    if (showModal) {
      carregarGruposCentralizados()
      carregarProjetosPj()
      // Resetar campos de busca ao abrir o modal
      setSearchGrupo('')
      setShowDropdown(false)
      setSearchProjetoPj('')
      setShowDropdownProjetoPj(false)
    }
  }, [showModal])

  // Sincronizar searchGrupo com formData ao carregar usuário para edição
  useEffect(() => {
    if (editingUser && formData.grupoCentralizador) {
      setSearchGrupo(formData.grupoCentralizador)
    }
  }, [editingUser, formData.grupoCentralizador])

  // Sincronizar searchProjetoPj com formData ao carregar usuário para edição
  useEffect(() => {
    if (editingUser && formData.projetoPj) {
      setSearchProjetoPj(formData.projetoPj)
    }
  }, [editingUser, formData.projetoPj])

  // Filtrar grupos quando o usuário digita
  useEffect(() => {
   


    if (!gruposCentralizados || gruposCentralizados.length === 0) {
     
      setGruposFiltrados([])
      return
    }


    if (searchGrupo.trim() === '') {
      const primeiros10 = gruposCentralizados.slice(0, 10)
     
      setGruposFiltrados(primeiros10)
    } else {

      const filtrados = gruposCentralizados
        .filter((grupo) => {
          // Verificar se o grupo tem as propriedades necessárias
          if (!grupo.descricao || !grupo.codGrupo) {
            return false
          }

          const descricaoLower = grupo.descricao.toLowerCase().trim()
          const searchLower = searchGrupo.toLowerCase().trim()
          const codGrupoString = grupo.codGrupo.toString()

          const matchDescricao = descricaoLower.includes(searchLower)
          const matchCodigo = codGrupoString.includes(searchGrupo.trim())

          return matchDescricao || matchCodigo
        })
        .slice(0, 10) // Limitar a 10 resultados

      setGruposFiltrados(filtrados)
    }
    
  }, [searchGrupo, gruposCentralizados])

  // Filtrar projetos PJ quando o usuário digita
  useEffect(() => {
   
    

    if (!projetosPj || projetosPj.length === 0) {
   
      setProjetosPjFiltrados([])
      return
    }

    

    if (searchProjetoPj.trim() === '') {
      // Se não há busca, mostrar os primeiros 10 projetos
      
      const primeiros10 = projetosPj.slice(0, 10)
    
      setProjetosPjFiltrados(primeiros10)
    } else {

      const filtrados = projetosPj
        .filter((projeto) => {
          // Verificar se o projeto tem as propriedades necessárias
          if (!projeto.descricao || !projeto.codGrupo) {
            return false
          }

          const descricaoLower = projeto.descricao.toLowerCase().trim()
          const searchLower = searchProjetoPj.toLowerCase().trim()
          const codGrupoString = projeto.codGrupo.toString()

          const matchDescricao = descricaoLower.includes(searchLower)
          const matchCodigo = codGrupoString.includes(searchProjetoPj.trim())

          // Log detalhado para debug
         

          return matchDescricao || matchCodigo
        })
        .slice(0, 10) // Limitar a 10 resultados

      setProjetosPjFiltrados(filtrados)
    }
  }, [searchProjetoPj, projetosPj])

  const carregarGruposCentralizados = async () => {
    setCarregandoGrupos(true)
    try {
      const grupos = await gerenciaGruposCentralizados.getGruposCentralizados()

      if (Array.isArray(grupos) && grupos.length > 0) {
        // Verificar se os dados têm a estrutura esperada
        const primeiroGrupo = grupos[0]

        if (primeiroGrupo.codGrupo !== undefined && primeiroGrupo.descricao !== undefined) {
          setGruposCentralizados(grupos)
          // Inicializar com os primeiros 10 grupos
          const primeiros10 = grupos.slice(0, 10)
          setGruposFiltrados(primeiros10)
        } else {
          console.error('Estrutura de dados inválida - propriedades faltando:', primeiroGrupo)
          setGruposCentralizados([])
          setGruposFiltrados([])
        }
      } else {
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

  const carregarProjetosPj = async () => {
    setCarregandoProjetosPj(true)
    try {
      const projetos = await consultarListaProjetos.consultarListaProjetos()

      if (Array.isArray(projetos) && projetos.length > 0) {
        // Verificar se os dados têm a estrutura esperada
        const primeiroProjeto = projetos[0]

        if (primeiroProjeto.codGrupo !== undefined && primeiroProjeto.descricao !== undefined) {
          setProjetosPj(projetos)
          // Inicializar com os primeiros 10 projetos
          const primeiros10 = projetos.slice(0, 10)
          setProjetosPjFiltrados(primeiros10)
        } else {
          console.error(
            'Estrutura de dados projetos PJ inválida - propriedades faltando:',
            primeiroProjeto,
          )
          setProjetosPj([])
          setProjetosPjFiltrados([])
        }
      } else {
        setProjetosPj([])
        setProjetosPjFiltrados([])
      }
    } catch (error) {
      console.error('Erro ao carregar projetos PJ:', error)
      showCpfAlert('Erro ao carregar projetos PJ', 'danger')
      setProjetosPj([])
      setProjetosPjFiltrados([])
    } finally {
      setCarregandoProjetosPj(false)
    }
  }

  // Event listener para fechar dropdown com ESC ou clique fora
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
        setShowDropdownProjetoPj(false)
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

      if (
        !event.target.closest('#projetoPj') &&
        !event.target.closest('[data-dropdown="projeto-pj"]')
      ) {
        setShowDropdownProjetoPj(false)
      }
    }

    if (showDropdown || showDropdownProjetoPj) {
      document.addEventListener('keydown', handleEscapeKey)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown, showDropdownProjetoPj])

  const handleGrupoSearch = (e) => {
    const value = e.target.value

    setSearchGrupo(value)

    // Sempre mostrar dropdown quando o usuário digita (se há grupos carregados)
    if (gruposCentralizados.length > 0) {
      setShowDropdown(true)
    } else {
    }

    // Limpar o valor do formData se o usuário estiver digitando algo diferente
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

    setSearchGrupo(valorCompleto)
    setShowDropdown(false)

    // Atualizar o formData com o valor selecionado
    setFormData((prev) => ({
      ...prev,
      grupoCentralizador: valorCompleto,
    }))
  }

  const handleProjetoPjSearch = (e) => {
    const value = e.target.value

    setSearchProjetoPj(value)

    // Sempre mostrar dropdown quando o usuário digita (se há projetos carregados)
    if (projetosPj.length > 0) {
      setShowDropdownProjetoPj(true)
    } else {
    }

    // Limpar o valor do formData se o usuário estiver digitando algo diferente
    const valorAtual = `${value.split(' - ')[0]} - ${value.split(' - ')[1] || ''}`.trim()
    if (formData.projetoPj !== valorAtual && !value.includes(' - ')) {
      setFormData((prev) => ({
        ...prev,
        projetoPj: '',
      }))
    }
  }

  const handleProjetoPjSelect = (projeto) => {
    const valorCompleto = `${projeto.codGrupo} - ${projeto.descricao.trim()}`
    setSearchProjetoPj(valorCompleto)
    setShowDropdownProjetoPj(false)

    // Atualizar o formData com o valor selecionado
    setFormData((prev) => ({
      ...prev,
      projetoPj: valorCompleto,
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

        // Formar o número completo com DDD + celular
        let numeroCompleto = ''

        // Verificar se ambos os campos existem e são válidos
        if (funcionario.ddd && funcionario.celular) {
          const ddd = funcionario.ddd.toString().replace(/[^\d]/g, '').padStart(2, '0')
          let celularLimpo = funcionario.celular.toString().replace(/[^\d]/g, '')


          // Se o celular tem 9 dígitos, remover o primeiro 9 para ficar com 8 dígitos
          if (celularLimpo.length === 9 && celularLimpo.startsWith('9')) {
            celularLimpo = celularLimpo.substring(1)
          }

          // Verificar se o celular tem 8 dígitos (formato desejado)
          if (celularLimpo.length === 8) {
            // Formar número completo: DDD + celular (total 10 dígitos)
            const numeroCompleto10 = ddd + celularLimpo

            // Formatação para 10 dígitos (DDD + 8 dígitos do celular)
            if (numeroCompleto10.length === 10) {
              numeroCompleto = numeroCompleto10.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
            }

          }
        }

        // Se não conseguiu formar o número completo, tentar usar apenas o celular
        if (!numeroCompleto && funcionario.celular) {
          let celularApenasNumeros = funcionario.celular.toString().replace(/[^\d]/g, '')

          // Se o celular já vem com DDD e tem 11 dígitos, remover o 9 excedente
          if (celularApenasNumeros.length === 11) {
            const ddd = celularApenasNumeros.substring(0, 2)
            let celular = celularApenasNumeros.substring(2)

            // Se o celular tem 9 dígitos e começa com 9, remover o primeiro 9
            if (celular.length === 9 && celular.startsWith('9')) {
              celular = celular.substring(1)
            }

            celularApenasNumeros = ddd + celular
          }

          // Se o celular já vem com DDD e tem 10 dígitos
          if (celularApenasNumeros.length === 10) {
            numeroCompleto = celularApenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          } else if (celularApenasNumeros.length === 8) {
            // Se tem apenas 8 dígitos, assumir DDD padrão (62 para Goiás)
            numeroCompleto = ('62' + celularApenasNumeros).replace(
              /(\d{2})(\d{4})(\d{4})/,
              '($1) $2-$3',
            )
          } else {
            // Para outros casos, usar o valor original se tiver até 10 dígitos
            if (celularApenasNumeros.length <= 10) {
              numeroCompleto = funcionario.celular.toString()
            }
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
      // Formatação automática da senha - apenas 6 dígitos numéricos
      if (name === 'senha' || name === 'confirmarSenha') {
        // Remove tudo que não é dígito
        const apenasNumeros = value.replace(/[^\d]/g, '')

        // Limita a 6 dígitos
        newValue = apenasNumeros.substring(0, 6)
      }

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

      // Formatação automática do celular - aceita apenas 10 dígitos (com DDD)
      if (name === 'celular') {
        const apenasNumeros = value.replace(/[^\d]/g, '')

        // Limitar a 10 dígitos (DDD + 8 dígitos do celular)
        const numeroLimitado = apenasNumeros.substring(0, 10)

        // Aplicar formatação conforme o tamanho
        if (numeroLimitado.length === 10) {
          // Formato: (XX) XXXX-XXXX
          newValue = numeroLimitado.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        } else if (numeroLimitado.length > 6) {
          // Formatação parcial durante a digitação
          newValue = numeroLimitado.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
        } else if (numeroLimitado.length > 2) {
          // Formatação parcial durante a digitação
          newValue = numeroLimitado.replace(/(\d{2})(\d+)/, '($1) $2')
        } else {
          newValue = numeroLimitado
        }
      }

      // Converter nome para maiúsculas
      if (name === 'nome') {
        newValue = value.toUpperCase()
      }
    }

    // Se mudou o tipo de usuário, limpar campos apenas se NÃO estiver editando usuário
    if (name === 'tipoUsuario') {
      if (!editingUser) {
        // Limpeza de campos apenas para usuário novo
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
          // Limpar todos os campos independente do tipo selecionado
          cpf: '',
          nome: '',
          matricula: '',
          celular: '',
          senha: '',
          confirmarSenha: '',
          grupoCentralizador: '',
          projetoPj: '',
          supervisor: 'N',
          numOperacional: 'N',
          userIpal: 'N',
          userSesmt: 'N',
          ativo: 'S', // Manter ativo como padrão
        }))

        // Limpar também os campos de pesquisa
        setSearchGrupo('')
        setShowDropdown(false)
        setSearchProjetoPj('')
        setShowDropdownProjetoPj(false)
      } else {
        // Para edição, apenas trocar o tipo sem limpar outros campos
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
        }))
      }

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

  // Função para validar o formulário
  const validarFormulario = () => {
    const errors = {}

    // Se estiver editando, a validação é mais flexível
    if (editingUser) {
      // Validação do CPF (sempre obrigatório, mas já está preenchido e não pode ser alterado)
      if (!formData.cpf) {
        errors.cpf = 'CPF é obrigatório'
      } else if (formData.cpf.replace(/[^\d]/g, '').length !== 11) {
        errors.cpf = 'CPF deve ter 11 dígitos'
      }

      // Validação da senha (opcional na edição, mas se preenchida deve ter 6 dígitos)
      if (formData.senha && formData.senha.length !== 6) {
        errors.senha = 'Senha deve ter exatamente 6 dígitos numéricos'
      }

      // Validação da confirmação de senha (apenas se a senha foi preenchida)
      if (formData.senha && !formData.confirmarSenha) {
        errors.confirmarSenha = 'Confirmação de senha é obrigatória quando nova senha é definida'
      } else if (formData.senha && formData.senha !== formData.confirmarSenha) {
        errors.confirmarSenha = 'As senhas não coincidem'
      }

      return errors
    }

    // Validação para novo usuário (original - todos os campos obrigatórios)
    // Validação do tipo de usuário
    if (!formData.tipoUsuario) {
      errors.tipoUsuario = 'Tipo de contrato é obrigatório'
    }

    // Validação do CPF
    if (!formData.cpf) {
      errors.cpf = 'CPF é obrigatório'
    } else if (formData.cpf.replace(/[^\d]/g, '').length !== 11) {
      errors.cpf = 'CPF deve ter 11 dígitos'
    }

    // Validação do nome (apenas para PJ)
    if (isPJ && !formData.nome) {
      errors.nome = 'Nome é obrigatório'
    }

    // Validação da matrícula (apenas para CLT)
    if (isCLT && !formData.matricula) {
      errors.matricula = 'Matrícula é obrigatória'
    }

    // Validação do projeto PJ (apenas para PJ)
    if (isPJ && !formData.projetoPj) {
      errors.projetoPj = 'Projeto PJ é obrigatório'
    }

    // Validação do celular
    if (!formData.celular) {
      errors.celular = 'Celular é obrigatório'
    }

    // Validação do grupo centralizador
    if (!formData.grupoCentralizador) {
      errors.grupoCentralizador = 'Grupo Centralizador é obrigatório'
    }

    // Validação da senha - deve ter exatamente 6 dígitos numéricos
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length !== 6) {
      errors.senha = 'Senha deve ter exatamente 6 dígitos numéricos'
    }

    // Validação da confirmação de senha
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem'
    }

    return errors
  }

  const formatarDadosParaAPI = (formData) => {
    // Extrair apenas os números do CPF
    const cpfLimpo = formData.cpf.replace(/[^\d]/g, '')

    // Extrair apenas os números do celular (remover formatação)
    let celularLimpo = formData.celular.replace(/[^\d]/g, '')

    // Se o celular tem 11 dígitos (DDD + 9 + 8 dígitos), remover o 9 extra
    if (celularLimpo.length === 11 && celularLimpo.substring(2, 3) === '9') {
      celularLimpo = celularLimpo.substring(0, 2) + celularLimpo.substring(3)
    }

    // Extrair apenas o código do grupo centralizador (antes do " - ")
    const grupoCodigo = formData.grupoCentralizador.split(' - ')[0] || formData.grupoCentralizador

    // Extrair apenas o código do projeto PJ (antes do " - ")
    const projetoPjCodigo = formData.projetoPj ? formData.projetoPj.split(' - ')[0] : ''

    // Determinar o tipo de usuário no formato da API
    let tipoUsuarioAPI = ''
    if (formData.tipoUsuario === 'CLT') {
      tipoUsuarioAPI = 'C'
    } else if (formData.tipoUsuario === 'PJ') {
      tipoUsuarioAPI = 'P'
    }

    // Montar objeto no formato da API
    const dadosAPI = {
      cpf: cpfLimpo, // Adicionar o CPF para identificar o usuário na edição
      tipoUsuario: tipoUsuarioAPI,
      filialFuncionario: formData.filialFuncionario || '',
      matricula: formData.matricula || '',
      nome: formData.nome.trim(),
      grupoCentralizador: grupoCodigo,
      supervisor: formData.supervisor, // Já está em S/N
      numOperacional: formData.numOperacional, // Já está em S/N
      userIpal: formData.userIpal, // Já está em S/N
      userSesmt: formData.userSesmt, // Já está em S/N
      celular: celularLimpo, // Sem formatação, máximo 10 dígitos
      ativo: formData.ativo, // Já está em S/N
      projetoPj: projetoPjCodigo,
      armazemHancock: formData.armazemHancock || '',
      equipeHancock: formData.equipeHancock || '',
      admin: formData.admin || false,
    }

    // Adicionar senha apenas se foi preenchida
    if (formData.senha && formData.senha.trim()) {
      dadosAPI.senha = formData.senha
    }


    return dadosAPI
  }

  const cadastrarUsuario = async (formData) => {
    try {
      // Converter os dados do formulário para o formato da API
      const dadosFormatados = formatarDadosParaAPI(formData)


      // Enviar para a API
      const response = await gerenciarUsuarios.enviarCadastro(dadosFormatados)

      return response
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      throw error
    }
  }

  // Modificar a função handleFormSubmit
  const handleFormSubmit = async (e) => {
    if (e) {
      e.preventDefault()
    }

    // Executar validação
    const errors = validarFormulario()

    // Se houver erros, mostrar alerta e não enviar
    if (Object.keys(errors).length > 0) {
      const primeiroErro = Object.values(errors)[0]
      showCpfAlert(primeiroErro, 'danger')
      return
    }

    // Se está editando um usuário, mostrar modal de confirmação
    if (editingUser) {
      const changes = getChangedFields()

      // Se não há mudanças, apenas fechar o modal
      if (changes.length === 0) {
        showCpfAlert('Nenhuma alteração foi feita.', 'info')
        setTimeout(() => {
          setShowModal(false)
        }, 2000)
        return
      }

      // Mostrar modal de confirmação com as mudanças
      setShowConfirmModal(true)
      return
    }

    // Se não está editando (novo usuário), submeter diretamente
    try {
      const response = await cadastrarUsuario(formData)

      // Verificar se a resposta indica sucesso
      if (response === true || response?.success === true || response?.status === true) {
        // Se chegou até aqui, o cadastro foi bem-sucedido
        showCpfAlert('Usuário cadastrado com sucesso!', 'success')

        // Fechar modal após mostrar sucesso
        setTimeout(() => {
          setShowModal(false)
        }, 2000)
      } else {
        // Se a resposta não indica sucesso
        throw new Error('Resposta da API não indica sucesso')
      }
    } catch (error) {
      // Se houve erro, manter modal aberto e mostrar erro
      console.error('Erro ao cadastrar usuário:', error)

      let mensagemErro = 'Erro ao cadastrar usuário. Tente novamente.'

      // Tentar extrair mensagem de erro específica da API
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (error.message) {
        mensagemErro = error.message
      }

      showCpfAlert(mensagemErro, 'danger')
    }
  }

  // Função para cancelar a confirmação
  const cancelarConfirmacao = () => {
    setShowConfirmModal(false)
  }

  // Função para comparar dados originais com os editados e retornar apenas os alterados
  const getChangedFieldsForAPI = () => {
    if (!originalData) return null

    const changedData = {
      cpf: formData.cpf.replace(/[^\d]/g, ''), // CPF sempre necessário para identificação
    }

    let hasChanges = false

    // Mapear campos do formulário para campos da API
    const fieldMapping = {
      tipoUsuario: (value) => (value === 'CLT' ? 'C' : value === 'PJ' ? 'P' : value),
      nome: (value) => value.trim(),
      matricula: (value) => value || '',
      celular: (value) => {
        // Extrair apenas os números do celular (remover formatação)
        let celularLimpo = value.replace(/[^\d]/g, '')

        // Se o celular tem 11 dígitos (DDD + 9 + 8 dígitos), remover o 9 extra
        if (celularLimpo.length === 11 && celularLimpo.substring(2, 3) === '9') {
          celularLimpo = celularLimpo.substring(0, 2) + celularLimpo.substring(3)
        }

        return celularLimpo
      },
      grupoCentralizador: (value) => value.split(' - ')[0] || value,
      projetoPj: (value) => (value ? value.split(' - ')[0] : ''),
      supervisor: (value) => value,
      numOperacional: (value) => value,
      userIpal: (value) => value,
      userSesmt: (value) => value,
      ativo: (value) => value,
      senha: (value) => value || undefined, // Não enviar se vazio
    }

    // Verificar cada campo e adicionar apenas os que mudaram
    Object.keys(fieldMapping).forEach((field) => {
      const originalValue = originalData[field]
      let currentValue = formData[field]

      // Aplicar transformação se necessário
      if (fieldMapping[field]) {
        currentValue = fieldMapping[field](currentValue)
      }

      // Comparar valores (considerando valores transformados)
      let originalTransformed = originalValue
      if (field === 'tipoUsuario') {
        originalTransformed =
          originalValue === 'CLT' ? 'C' : originalValue === 'PJ' ? 'P' : originalValue
      } else if (field === 'celular') {
        originalTransformed = fieldMapping.celular(originalValue || '')
      } else if (field === 'grupoCentralizador' || field === 'projetoPj') {
        originalTransformed = (originalValue || '').split(' - ')[0] || originalValue
      } else if (field === 'nome') {
        originalTransformed = (originalValue || '').trim()
      }

      // Verificar se houve mudança
      if (originalTransformed !== currentValue) {
        // Para senha, só incluir se foi preenchida
        if (field === 'senha') {
          if (currentValue && currentValue.trim()) {
            changedData[field] = currentValue
            hasChanges = true
          }
        } else {
          changedData[field] = currentValue
          hasChanges = true
        }
      }
    })

    // Adicionar campos fixos que sempre devem estar presentes
    changedData.filialFuncionario = formData.filialFuncionario || ''
    changedData.armazemHancock = formData.armazemHancock || ''
    changedData.equipeHancock = formData.equipeHancock || ''
    changedData.admin = formData.admin || false


    return hasChanges ? changedData : null
  }

  // Função para formatar dados para exibição na confirmação
  const getChangedFields = () => {
    if (!originalData) return []

    const changes = []
    const fieldsToCheck = {
      tipoUsuario: 'Tipo de Contrato',
      nome: 'Nome',
      matricula: 'Matrícula',
      celular: 'Contato',
      grupoCentralizador: 'Grupo Centralizador',
      projetoPj: 'Projeto PJ',
      senha: 'Senha',
      supervisor: 'Supervisor',
      numOperacional: 'Possui Equipe',
      userIpal: 'Usuário IPAL',
      userSesmt: 'SESMT',
      ativo: 'Status',
    }

    Object.keys(fieldsToCheck).forEach((field) => {
      const original = originalData[field]
      const current = formData[field]

      if (original !== current) {
        let originalValue = original
        let currentValue = current

        // Formatar valores para melhor exibição
        if (
          field === 'supervisor' ||
          field === 'numOperacional' ||
          field === 'userIpal' ||
          field === 'userSesmt'
        ) {
          originalValue = original === 'S' ? 'Sim' : 'Não'
          currentValue = current === 'S' ? 'Sim' : 'Não'
        } else if (field === 'ativo') {
          originalValue = original === 'S' ? 'Ativo' : 'Inativo'
          currentValue = current === 'S' ? 'Ativo' : 'Inativo'
        } else if (field === 'senha') {
          originalValue = '****'
          currentValue = current ? 'Nova senha definida' : '****'
        }

        changes.push({
          field: fieldsToCheck[field],
          original: originalValue || 'Não informado',
          current: currentValue || 'Não informado',
        })
      }
    })

    return changes
  }

  // Modificar a função confirmarEdicao
  const confirmarEdicao = async () => {
    setShowConfirmModal(false)

    try {
      // Obter apenas os dados que foram alterados
      const dadosAlterados = getChangedFieldsForAPI()

      if (!dadosAlterados) {
        showCpfAlert('Nenhuma alteração foi detectada.', 'info')
        setTimeout(() => {
          setShowModal(false)
        }, 2000)
        return
      }


      // Enviar para a API de atualização
      const response = await gerenciarUsuarios.atualizarUsuario(dadosAlterados)

      // Verificar se a edição foi bem-sucedida
      if (response === true || response?.success === true || response?.status === true) {
        showCpfAlert('Usuário editado com sucesso!', 'success')

        // Fechar modal após mostrar sucesso
        setTimeout(() => {
          setShowModal(false)
        }, 2000)
      } else {
        throw new Error('Resposta da edição não indica sucesso')
      }
    } catch (error) {
      console.error('Erro ao editar usuário:', error)

      let mensagemErro = 'Erro ao editar usuário. Tente novamente.'

      // Tentar extrair mensagem de erro específica da API
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (error.message) {
        mensagemErro = error.message
      }

      showCpfAlert(mensagemErro, 'danger')
    }
  }

  // Armazenar dados originais quando começar a editar
  useEffect(() => {
    if (editingUser && showModal) {
      setOriginalData({ ...formData })
    }
  }, [editingUser, showModal])

  // Novo useEffect para carregar dados da API quando estiver editando
  useEffect(() => {
    if (showModal && editingUser && editingUser.cpf) {
      carregarDadosParaEdicao(editingUser.cpf)
    }
  }, [showModal, editingUser])

  // Função para carregar dados da API para edição
  const carregarDadosParaEdicao = async (cpf) => {
    setCarregandoDadosEdicao(true)

    try {
      // Limpar formatação do CPF
      const cpfLimpo = cpf.replace(/[^\d]/g, '')


      // Buscar dados na API de edição
      const dadosUsuario = await editarFuncionario(cpfLimpo)

      if (dadosUsuario && dadosUsuario.length > 0) {
        const usuario = dadosUsuario[0]


        // Processar telefone/celular
        let numeroCompleto = ''
        if (usuario.ddd && usuario.celular) {
          const ddd = usuario.ddd.toString().replace(/[^\d]/g, '').padStart(2, '0')
          let celularLimpo = usuario.celular.toString().replace(/[^\d]/g, '')

          // Se o celular tem 9 dígitos, remover o primeiro 9 para ficar com 8 dígitos
          if (celularLimpo.length === 9 && celularLimpo.startsWith('9')) {
            celularLimpo = celularLimpo.substring(1)
          }

          // Verificar se o celular tem 8 dígitos (formato desejado)
          if (celularLimpo.length === 8) {
            const numeroCompleto10 = ddd + celularLimpo
            if (numeroCompleto10.length === 10) {
              numeroCompleto = numeroCompleto10.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
            }
          }
        }

        // Se não conseguiu formar o número completo, tentar usar apenas o celular
        if (!numeroCompleto && usuario.celular) {
          let celularApenasNumeros = usuario.celular.toString().replace(/[^\d]/g, '')

          if (celularApenasNumeros.length === 11) {
            const ddd = celularApenasNumeros.substring(0, 2)
            let celular = celularApenasNumeros.substring(2)

            if (celular.length === 9 && celular.startsWith('9')) {
              celular = celular.substring(1)
            }

            celularApenasNumeros = ddd + celular
          }

          if (celularApenasNumeros.length === 10) {
            numeroCompleto = celularApenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          } else if (celularApenasNumeros.length === 8) {
            numeroCompleto = ('62' + celularApenasNumeros).replace(
              /(\d{2})(\d{4})(\d{4})/,
              '($1) $2-$3',
            )
          }
        }

        // Determinar tipo de usuário
        let tipoUsuario = ''
        if (usuario.tipoUsuario === 'C' || usuario.tipoUsuario === 'CLT') {
          tipoUsuario = 'CLT'
        } else if (usuario.tipoUsuario === 'P' || usuario.tipoUsuario === 'PJ') {
          tipoUsuario = 'PJ'
        }

        // Formatar o CPF para exibição (000.000.000-00)
        const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

        // Atualizar o formData com os dados da API
        setFormData((prev) => ({
          ...prev,
          cpf: cpfFormatado, // Usar CPF formatado ao invés do original
          nome: usuario.nome || prev.nome || '',
          matricula: usuario.matricula || prev.matricula || '',
          tipoUsuario: tipoUsuario || prev.tipoUsuario || '',
          celular: numeroCompleto || prev.celular || '',
          grupoCentralizador: usuario.grupoCentralizador || prev.grupoCentralizador || '',
          projetoPj: usuario.projetoPj || prev.projetoPj || '',
          supervisor: usuario.supervisor || prev.supervisor || 'N',
          numOperacional: usuario.numOperacional || prev.numOperacional || 'N',
          userIpal: usuario.userIpal || prev.userIpal || 'N',
          userSesmt: usuario.userSesmt || prev.userSesmt || 'N',
          ativo: usuario.ativo || prev.ativo || 'S',
          // Não incluir senha nos dados carregados
          senha: '',
          confirmarSenha: '',
        }))

        // Atualizar campos de busca se necessário
        if (usuario.grupoCentralizador) {
          setSearchGrupo(usuario.grupoCentralizador)
        }
        if (usuario.projetoPj) {
          setSearchProjetoPj(usuario.projetoPj)
        }

        showCpfAlert('Dados do usuário carregados com sucesso!', 'success')
      } else {
        console.warn('Nenhum dado encontrado na API para o CPF:', cpfLimpo)
        showCpfAlert('Dados do usuário não encontrados na API. Usando dados da tabela.', 'warning')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário para edição:', error)
      showCpfAlert('Erro ao carregar dados da API. Usando dados da tabela.', 'warning')
    } finally {
      setCarregandoDadosEdicao(false)
    }
  }

  return (
    <>
      <CModal alignment="center" visible={showModal} onClose={() => setShowModal(false)} size="xl">
        <CModalHeader>
          <CModalTitle>
            {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            {carregandoDadosEdicao && <CSpinner size="sm" className="ms-2" />}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {alertCpf.show && (
            <CAlert color={alertCpf.color} className="d-flex align-items-center mb-3">
              {(consultandoCpf || carregandoDadosEdicao) && <CSpinner size="sm" className="me-2" />}
              {alertCpf.message}
            </CAlert>
          )}

          {/* Mostrar indicador de carregamento para dados de edição */}
          {carregandoDadosEdicao && (
            <CAlert color="info" className="d-flex align-items-center mb-3">
              <CSpinner size="sm" className="me-2" />
              Carregando dados atualizados do usuário da API...
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
                  disabled={loading || carregandoDadosEdicao}
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
                  {(consultandoCpf || carregandoDadosEdicao) && (
                    <CSpinner size="sm" className="ms-2" />
                  )}
                </CFormLabel>
                <CFormInput
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  invalid={!!formErrors.cpf}
                  disabled={
                    loading ||
                    noTypeSelected ||
                    consultandoCpf ||
                    editingUser ||
                    carregandoDadosEdicao
                  }
                  required
                  placeholder={
                    editingUser
                      ? 'CPF não pode ser alterado'
                      : noTypeSelected
                        ? 'Selecione primeiro o tipo de usuário'
                        : consultandoCpf || carregandoDadosEdicao
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
                  disabled={
                    loading ||
                    noTypeSelected ||
                    consultandoCpf ||
                    carregandoDadosEdicao ||
                    (isCLT && !editingUser) ||
                    editingUser // Adicionar esta condição para desabilitar na edição
                  }
                  required={isPJ}
                  placeholder={
                    editingUser
                      ? 'Nome não pode ser alterado'
                      : carregandoDadosEdicao
                        ? 'Carregando dados...'
                        : noTypeSelected
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

                {isPJ ? (
                  // Campo de busca para Projeto PJ
                  <div className="position-relative">
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                      <CFormInput
                        id="projetoPj"
                        name="projetoPj"
                        value={searchProjetoPj}
                        onChange={handleProjetoPjSearch}
                        onFocus={() => setShowDropdownProjetoPj(true)}
                        invalid={!!formErrors.projetoPj}
                        disabled={loading || noTypeSelected || carregandoProjetosPj}
                        required
                        placeholder={
                          noTypeSelected
                            ? 'Selecione primeiro o tipo de usuário'
                            : carregandoProjetosPj
                              ? 'Carregando projetos...'
                              : 'Digite para buscar o projeto PJ'
                        }
                        autoComplete="off"
                      />
                    </CInputGroup>

                    {/* Dropdown com os projetos PJ filtrados */}
                    {showDropdownProjetoPj &&
                      !carregandoProjetosPj &&
                      projetosPjFiltrados.length > 0 && (
                        <div
                          data-dropdown="projeto-pj"
                          className="position-absolute w-100 bg-white border border-light-subtle rounded shadow-sm"
                          style={{
                            top: '100%',
                            zIndex: 1050,
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          {projetosPjFiltrados.map((projeto) => (
                            <div
                              key={projeto.codGrupo}
                              className="px-3 py-2 cursor-pointer border-bottom border-light"
                              style={{
                                cursor: 'pointer',
                                backgroundColor: 'white',
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                              onClick={() => handleProjetoPjSelect(projeto)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong className="text-primary">{projeto.codGrupo}</strong>
                                  <span className="ms-2 text-dark">{projeto.descricao.trim()}</span>
                                </div>
                                <small className="text-muted">Clique para selecionar</small>
                              </div>
                            </div>
                          ))}

                          {/* Mostrar mensagem se não encontrou resultados na busca */}
                          {searchProjetoPj.trim() !== '' && projetosPjFiltrados.length === 0 && (
                            <div className="px-3 py-2 text-muted text-center">
                              <small>Nenhum projeto encontrado para "{searchProjetoPj}"</small>
                            </div>
                          )}

                          {/* Botão para fechar o dropdown */}
                          <div className="px-3 py-2 border-top bg-light">
                            <small
                              className="text-muted cursor-pointer text-center d-block"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setShowDropdownProjetoPj(false)}
                            >
                              Clique aqui ou pressione ESC para fechar
                            </small>
                          </div>
                        </div>
                      )}

                    {/* Mostrar mensagem quando não há projetos carregados */}
                    {showDropdownProjetoPj && !carregandoProjetosPj && projetosPj.length === 0 && (
                      <div
                        className="position-absolute w-100 bg-white border border-light-subtle rounded shadow-sm"
                        style={{
                          top: '100%',
                          zIndex: 1050,
                        }}
                      >
                        <div className="px-3 py-2 text-muted text-center">
                          <small>Nenhum projeto PJ encontrado</small>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Campo simples para Matrícula (CLT)
                  <CFormInput
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    invalid={!!formErrors.matricula}
                    disabled={
                      loading ||
                      noTypeSelected ||
                      consultandoCpf ||
                      (isCLT && !editingUser) ||
                      editingUser
                    }
                    required={false}
                    placeholder={
                      editingUser
                        ? 'Matrícula não pode ser alterada'
                        : noTypeSelected
                          ? 'Selecione primeiro o tipo de usuário'
                          : isCLT && !editingUser
                            ? 'Matrícula será preenchida automaticamente.'
                            : 'Digite a matrícula'
                    }
                  />
                )}

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
                  disabled={
                    loading ||
                    noTypeSelected ||
                    consultandoCpf ||
                    carregandoDadosEdicao ||
                    (isCLT && !editingUser)
                  }
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

              {/* Campo para o grupo centralizador com autocomplete */}
              <CCol md={4} className="mb-4">
                <CFormLabel htmlFor="grupoCentralizador" className="mb-2">
                  Grupo:<span className="text-danger">*</span>
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

              {/* Campo para senha */}
              <CCol md={6} className="mb-4">
                <CFormLabel htmlFor="senha" className="mb-2">
                  {editingUser ? 'Nova senha (opcional):' : 'Crie uma senha:'}
                  {!editingUser && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormInput
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleInputChange}
                  invalid={!!formErrors.senha}
                  disabled={loading || noTypeSelected}
                  required={!editingUser}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={
                    editingUser
                      ? 'Digite 6 dígitos numéricos'
                      : noTypeSelected
                        ? 'Selecione primeiro o tipo de usuário'
                        : 'Somente 6 dígitos numéricos'
                  }
                />
                <CFormFeedback invalid>{formErrors.senha}</CFormFeedback>
                <small className="text-muted">
                  {editingUser
                    ? 'Deixe em branco se não quiser alterar. Use apenas 6 dígitos numéricos.'
                    : 'Use apenas 6 dígitos numéricos (ex: 123456)'}
                </small>
              </CCol>

              {/* Campo para confirmar senha */}
              <CCol md={6} className="mb-4">
                <CFormLabel htmlFor="confirmarSenha" className="mb-2">
                  {editingUser ? 'Confirmar nova senha:' : 'Confirmar senha:'}
                  {!editingUser && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormInput
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha || ''}
                  onChange={handleInputChange}
                  invalid={!!formErrors.confirmarSenha}
                  disabled={loading || noTypeSelected}
                  required={!editingUser}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={
                    editingUser
                      ? 'Confirme os 6 dígitos'
                      : noTypeSelected
                        ? 'Selecione primeiro o tipo de usuário'
                        : 'Somente 6 dígitos numéricos'
                  }
                />
                <CFormFeedback invalid>{formErrors.confirmarSenha}</CFormFeedback>
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
          <CButton
            color="primary"
            onClick={handleFormSubmit}
            disabled={loading || consultandoCpf || carregandoDadosEdicao}
          >
            {loading || carregandoDadosEdicao ? <CSpinner size="sm" className="me-1" /> : null}
            {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de Confirmação para Edição */}
      <CModal
        alignment="center"
        visible={showConfirmModal}
        onClose={cancelarConfirmacao}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2 text-warning" />
            Confirmar Alterações
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <p className="mb-3">
              <strong>Você está prestes a editar as informações do usuário:</strong>
            </p>
            <div className="bg-light p-3 rounded mb-3">
              <p className="mb-1">
                <strong>Nome:</strong> {formData.nome}
              </p>
              <p className="mb-1">
                <strong>CPF:</strong> {formData.cpf}
              </p>
              <p className="mb-0">
                <strong>Tipo:</strong> {formData.tipoUsuario}
              </p>
            </div>
          </div>

          {getChangedFields().length > 0 && (
            <>
              <h6 className="mb-3 text-primary">
                <CIcon icon={cilCheckCircle} className="me-2" />
                Alterações que serão salvas:
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr className="table-primary">
                      <th>Campo</th>
                      <th>Valor Atual</th>
                      <th>Novo Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChangedFields().map((change, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{change.field}</strong>
                        </td>
                        <td>
                          <span className="text-muted">{change.original}</span>
                        </td>
                        <td>
                          <span className="text-success fw-bold">{change.current}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <CAlert color="warning" className="mt-3 mb-0">
            <div className="d-flex align-items-center">
              <CIcon icon={cilWarning} className="me-2" />
              <div>
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. Certifique-se de que
                todas as informações estão corretas antes de confirmar.
              </div>
            </div>
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelarConfirmacao} disabled={loading}>
            <span className="me-1">✕</span>
            Cancelar
          </CButton>
          <CButton color="success" onClick={confirmarEdicao} disabled={loading}>
            {loading ? (
              <CSpinner size="sm" className="me-1" />
            ) : (
              <CIcon icon={cilCheckCircle} className="me-1" />
            )}
            Confirmar Alterações
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsuariosModal
