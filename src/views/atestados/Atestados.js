import '../consulta-atestados/ConsultarAtestados.css'
import React, { useRef, useState, useEffect } from 'react'
import Select from 'react-select'

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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import { atestadosService } from '../../services/atestadosService'
import { cidService } from '../../services/consultarCidService'
import { calcularDataFinal, limparFormulario } from './utils/atestadosUtils'
import { useFileHandler } from './hooks/useFileHandler'

const Atestados = () => {
  const [ processInfo, setProcessInfo ] = useState(null)
  const [ validated, setValidated ] = useState(false)
  const [ alertType, setAlertType ] = useState('success')
  const [ showSuccessAlert, setShowSuccessAlert ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ selectedCid, setSelectedCid ] = useState(null)
  const [ dadosUsuarioValidos, setDadosUsuarioValidos ] = useState(true)

  // Estados para gerenciar os CIDs da API
  const [ cidOptions, setCidOptions ] = useState([
    // Opções de teste temporárias
    { value: 'A00', label: 'A00 - Cólera', originalData: {} },
    { value: 'A01', label: 'A01 - Febres tifóide e paratifóide', originalData: {} },
    { value: 'A02', label: 'A02 - Outras infecções por Salmonella', originalData: {} },
  ])
  const [ isLoadingCids, setIsLoadingCids ] = useState(false)
  const [ cidError, setCidError ] = useState(null)
  const [ inputValue, setInputValue ] = useState('')

  // Hooks necessários
  const fileInputRef = useRef(null)
  const { file, fileError, handleFileChange, handleViewFile, handleRemoveFile } = useFileHandler()

  // Verificar dados do localStorage ao montar o componente
  useEffect(() => {
    const verificarDadosUsuario = () => {
      const matricula = localStorage.getItem('matricula')
      const cpf = localStorage.getItem('cpf')
      const nomeUsuario = localStorage.getItem('nomeUsuario') || localStorage.getItem('nome')
      
      if (!matricula || !cpf || !nomeUsuario) {
        setDadosUsuarioValidos(false)
        setProcessInfo({
          idProcess: null,
          mensagem: 'Dados do usuário não encontrados no sistema. Por favor, faça login novamente para acessar esta funcionalidade.',
        })
        setAlertType('danger')
        setShowSuccessAlert(true)
        return false
      }
      return true
    }
    
    verificarDadosUsuario()
  }, [])

  // Função para buscar CIDs da API
  const buscarCidsComFiltro = async (termoBusca = '') => {
    // Só busca se tiver pelo menos 2 caracteres ou se for uma busca inicial
    if (termoBusca.length < 2 && termoBusca.length > 0) {
      setCidOptions([])
      return
    }

    setIsLoadingCids(true)
    setCidError(null)

    try {
      const response = await cidService.consultarCids(termoBusca)
      if (response.data.CID && response.data.CID.length > 0) {
        // Filtrar localmente se o service não suportar filtro no backend
        let cidsFiltrados = response.data.CID

        if (termoBusca && termoBusca.length >= 2) {
          cidsFiltrados = response.data.CID.filter((cid) => {
            // Vamos pegar TODAS as propriedades do objeto e procurar por strings
            const todasPropriedades = Object.values(cid).join(' ').toLowerCase()
            const termo = termoBusca.toLowerCase()
            return todasPropriedades.includes(termo)
          })
        }

        // Limitar a 50 resultados para performance
        const cidsLimitados = cidsFiltrados.slice(0, 50)

        // Mapear os dados da API para o formato do react-select
        const cidsFormatados = cidsLimitados
          .map((cid, index) => {
            // Vamos tentar pegar as propriedades mais comuns primeiro
            const propriedades = Object.keys(cid)

            // Tentar encontrar o código (geralmente a primeira propriedade ou algo com 'cod', 'id', etc.)
            let codigo = 'N/A'
            let descricao = 'Sem descrição'

            // Buscar código
            for (const prop of propriedades) {
              if (
                prop.toLowerCase().includes('cod') ||
                prop.toLowerCase().includes('id') ||
                prop.toLowerCase().includes('cid')
              ) {
                codigo = cid[ prop ] || 'N/A'
                break
              }
            }

            // Buscar descrição
            for (const prop of propriedades) {
              if (
                prop.toLowerCase().includes('desc') ||
                prop.toLowerCase().includes('nome') ||
                prop.toLowerCase().includes('name')
              ) {
                descricao = cid[ prop ] || 'Sem descrição'
                break
              }
            }

            // Se não encontrou, usar as primeiras propriedades
            if (codigo === 'N/A' && propriedades.length > 0) {
              codigo = cid[ propriedades[ 0 ] ] || 'N/A'
            }
            if (descricao === 'Sem descrição' && propriedades.length > 1) {
              descricao = cid[ propriedades[ 1 ] ] || 'Sem descrição'
            }

            const item = {
              value: String(codigo),
              label: `${codigo} - ${descricao}`,
              originalData: cid,
            }

            // Verificar se o item é válido
            if (
              !item.value ||
              item.value === 'N/A' ||
              !item.label ||
              item.label === 'N/A - Sem descrição'
            ) {
              console.warn('Item inválido detectado:', item)
              return null
            }

            return item
          })
          .filter(Boolean) // Remove itens nulos

        setCidOptions(cidsFormatados)
      } else {
        setCidOptions([])
      }
    } catch (error) {
      console.error('Erro ao buscar CIDs:', error)
      setCidError('Erro ao carregar lista de CIDs. Tente novamente.')
      setCidOptions([])
    } finally {
      setIsLoadingCids(false)
    }
  }

  // Debounce melhorado
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.length >= 2 || inputValue.length === 0) {
        buscarCidsComFiltro(inputValue)
      }
    }, 500) // Aumentei para 500ms para dar mais tempo

    return () => clearTimeout(timeoutId)
  }, [ inputValue ])

  // Remover o carregamento inicial automático - só carregar quando o usuário digitar
  // useEffect(() => {
  //   buscarCidsComFiltro() // Comentei esta linha
  // }, [])

  // Função para enviar atestado
  const enviarAtestado = async (dadosAtestado) => {
    try {
      const resposta = await atestadosService.enviarAtestado(dadosAtestado)
      if (resposta && resposta.data && resposta.data.idProcess) {
        setProcessInfo({
          idProcess: resposta.idProcess,
          mensagem: resposta.mensagem || 'Atestado enviado com sucesso',
        })
        setAlertType('success')
        setShowSuccessAlert(true)
      } else {
        setProcessInfo({
          idProcess: null,
          mensagem: resposta.mensagem || 'Erro ao enviar atestado',
        })
        setAlertType('danger')
        setShowSuccessAlert(true)
      }
      return resposta
    } catch (erro) {
      console.error('Erro ao enviar atestado:', erro)
      throw erro
    }
  }

  // Função para validar todos os campos obrigatórios
  const validarFormulario = () => {
    const erros = []
    
    // Validar dados do localStorage (principais)
    const matricula = localStorage.getItem('matricula')
    const cpf = localStorage.getItem('cpf')
    const nomeUsuario = localStorage.getItem('nomeUsuario') || localStorage.getItem('nome')
    
    if (!matricula || matricula.trim() === '') {
      erros.push('Matrícula não encontrada no sistema. Faça login novamente.')
    }
    
    if (!cpf || cpf.trim() === '') {
      erros.push('CPF não encontrado no sistema. Faça login novamente.')
    }
    
    if (!nomeUsuario || nomeUsuario.trim() === '') {
      erros.push('Nome do usuário não encontrado no sistema. Faça login novamente.')
    }

    // Validar campos do formulário
    const tipificacao = document.getElementById('tipificacaoAtestado')?.value
    if (!tipificacao || tipificacao === '') {
      erros.push('Tipificação é obrigatória.')
    }

    const especificacao = document.getElementById('especificacaoAtestado')?.value
    if (!especificacao || especificacao === '') {
      erros.push('Especificação é obrigatória.')
    }

    const dataInicio = document.getElementById('dataInicioAtestado')?.value
    if (!dataInicio || dataInicio === '') {
      erros.push('Data de início é obrigatória.')
    }

    const diasAtestado = document.getElementById('diasAtestado')?.value
    if (!diasAtestado || diasAtestado === '' || parseInt(diasAtestado) < 1) {
      erros.push('Dias de atestado é obrigatório e deve ser maior que 0.')
    }

    const nomeMedico = document.getElementById('medicoAtestado')?.value
    if (!nomeMedico || nomeMedico.trim() === '') {
      erros.push('Nome do médico responsável é obrigatório.')
    }

    // CID não é obrigatório - comentado
    // if (!selectedCid || !selectedCid.value) {
    //   erros.push('CID é obrigatório.')
    // }

    // Validar anexo
    if (!file && (!fileInputRef.current?.files || fileInputRef.current.files.length === 0)) {
      erros.push('Anexo do atestado é obrigatório.')
    }

    return erros
  }

  // Função para lidar com o submit do formulário
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    // Executar validação personalizada
    const errosValidacao = validarFormulario()
    
    if (errosValidacao.length > 0) {
      // Mostrar todos os erros
      const mensagemErro = errosValidacao.join('\n')
      setProcessInfo({
        idProcess: null,
        mensagem: `Erro de validação:\n${mensagemErro}`,
      })
      setAlertType('danger')
      setShowSuccessAlert(true)
      setValidated(true)
      return
    }

    setIsLoading(true)

    try {
      const anexoBase64 = fileInputRef.current?.files[ 0 ] ? await getFileBase64(fileInputRef.current.files[ 0 ]) : ''
      
      // Obter dados do localStorage com verificação
      const matricula = localStorage.getItem('matricula') || ''
      const cpf = localStorage.getItem('cpf') || ''
      const userNome = localStorage.getItem('nomeUsuario') || localStorage.getItem('nome') || ''
      
      // Verificar novamente se os dados principais estão presentes
      if (!matricula || !cpf || !userNome) {
        throw new Error('Dados do usuário não encontrados. Faça login novamente.')
      }

      const dadosFormulario = {
        matricula,
        cpf,
        userNome,
        atestado: document.getElementById('tipificacaoAtestado')?.options[ document.getElementById('tipificacaoAtestado')?.selectedIndex ]?.text || '',
        motivoAfastamento: document.getElementById('especificacaoAtestado')?.options[ document.getElementById('especificacaoAtestado')?.selectedIndex ]?.text || '',
        dataInicio: document.getElementById('dataInicioAtestado')?.value || '',
        qtdDias: document.getElementById('diasAtestado')?.value || '',
        cid: selectedCid?.label || '',
        nomeMedico: document.getElementById('medicoAtestado')?.value || '',
        justificativa: document.getElementById('justificativaAtestado')?.value || '',
        anexoBase64,
        nomeAnexo: file?.name || (fileInputRef.current?.files[ 0 ]?.name ?? ''),
      }

      // Verificar se todos os campos obrigatórios estão preenchidos
      const camposObrigatoriosVazios = []
      if (!dadosFormulario.matricula) camposObrigatoriosVazios.push('Matrícula')
      if (!dadosFormulario.cpf) camposObrigatoriosVazios.push('CPF')
      if (!dadosFormulario.userNome) camposObrigatoriosVazios.push('Nome do usuário')
      if (!dadosFormulario.atestado) camposObrigatoriosVazios.push('Tipificação')
      if (!dadosFormulario.motivoAfastamento) camposObrigatoriosVazios.push('Especificação')
      if (!dadosFormulario.dataInicio) camposObrigatoriosVazios.push('Data de início')
      if (!dadosFormulario.qtdDias) camposObrigatoriosVazios.push('Dias de atestado')
      // CID não é obrigatório - comentado
      // if (!dadosFormulario.cid) camposObrigatoriosVazios.push('CID')
      if (!dadosFormulario.nomeMedico) camposObrigatoriosVazios.push('Nome do médico')
      if (!dadosFormulario.anexoBase64) camposObrigatoriosVazios.push('Anexo do atestado')

      if (camposObrigatoriosVazios.length > 0) {
        throw new Error(`Os seguintes campos obrigatórios não foram preenchidos: ${camposObrigatoriosVazios.join(', ')}`)
      }

      await enviarAtestado(dadosFormulario)
      limparFormulario(setValidated, fileInputRef)
      setShowSuccessAlert(true)
      setSelectedCid(null) // Limpar seleção do CID
      setInputValue('') // Limpar input do CID

      //Limpar o formulário
      document.getElementById('tipificacaoAtestado').value = ''
      document.getElementById('especificacaoAtestado').value = ''
      document.getElementById('dataInicioAtestado').value = ''
      document.getElementById('diasAtestado').value = ''
      document.getElementById('dataFinalAtestado').value = ''
      document.getElementById('medicoAtestado').value = ''
      document.getElementById('justificativaAtestado').value = ''
      document.getElementById('cidAtestado').value = ''

      //limpar data
      document.getElementById('diasAtras').textContent = ''
      document.getElementById('informacaoDias').textContent = ''
      document.getElementById('informacaoDataFinal').textContent = ''

      //limpar o arquivo
      handleRemoveFile(fileInputRef)

      // Resetar o estado do formulário
      // formElement.reset()
      setValidated(false)

      // Esconder alerta após 5 segundos
      setTimeout(() => setShowSuccessAlert(false), 5000)
    } catch (error) {
      console.error('Erro ao enviar atestado:', error)
      
      // Tratar diferentes tipos de erro
      let mensagemErro = 'Erro inesperado ao enviar atestado.'
      if (error.message) {
        mensagemErro = error.message
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (typeof error === 'string') {
        mensagemErro = error
      }
      
      setProcessInfo({
        idProcess: null,
        mensagem: mensagemErro,
      })
      setAlertType('danger')
      setShowSuccessAlert(true)
      
      // Esconder alerta de erro após 8 segundos
      setTimeout(() => setShowSuccessAlert(false), 8000)
    } finally {
      setIsLoading(false)
    }
  }

  function getFileBase64(file) {
    if (!file) return Promise.resolve('')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string' && result.includes(',')) {
          resolve(result.split(',')[ 1 ])
        } else {
          resolve('')
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Enviar Atestados</h1>
          <small className="text-muted">
            {localStorage.getItem('matricula') ? (
              <>
                Matrícula: {localStorage.getItem('matricula') || ''} | Nome:{' '}
                {
                  localStorage.getItem('nomeUsuario') ||
                  localStorage.getItem('nome') ||
                  'NÃO ENCONTRADO'
                }
              </>
            ) : (
              <span>Nome:{' '}
                {
                  localStorage.getItem('nomeUsuario') ||
                  localStorage.getItem('nome') ||
                  'NÃO ENCONTRADO'
                }</span>
            )}
          </small>
        </div>
      </div>

      {/* Alert de Sucesso/Erro com Ícone */}
      {showSuccessAlert && processInfo && (
        <CAlert
          color={alertType}
          dismissible
          onClose={() => setShowSuccessAlert(false)}
          className="d-flex align-items-start shadow-sm"
          style={{
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          <CIcon icon={cilCheckCircle} className="flex-shrink-0 me-2 mt-1" width={24} height={24} />
          <div style={{ whiteSpace: 'pre-line' }}>
            {alertType === 'success' ? (
              <>
                <strong>Concluído!</strong> {processInfo.mensagem}<br />
                <span>Protocolo: <strong>{processInfo.idProcess}</strong></span>
              </>
            ) : (
              <>
                <strong>Erro!</strong><br />
                {processInfo.mensagem}
              </>
            )}
          </div>
        </CAlert>
      )}

      {/* Alert de erro para CIDs */}
      {cidError && (
        <CAlert color="danger" dismissible onClose={() => setCidError(null)}>
          <strong>Erro:</strong> {cidError}
          <CButton
            color="danger"
            variant="outline"
            size="sm"
            className="ms-2"
            onClick={() => buscarCidsComFiltro(inputValue)}
            disabled={isLoadingCids}
          >
            {isLoadingCids ? 'Carregando...' : 'Tentar novamente'}
          </CButton>
        </CAlert>
      )}

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Incluir Atestado Médico</h6>
            </CCardHeader>
            <CCardBody>
              {!dadosUsuarioValidos ? (
                <div className="text-center py-5">
                  <div className="alert alert-warning">
                    <h5>Acesso Restrito</h5>
                    <p>Para acessar esta funcionalidade, é necessário estar logado com dados válidos (matrícula, CPF e nome).</p>
                    <p>Por favor, faça login novamente.</p>
                  </div>
                </div>
              ) : (
                <CForm
                  className="needs-validation"
                  noValidate
                  onSubmit={handleSubmit}
                >
                <CRow className="g-3">
                  {/* Seletor de Tipificação */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="tipificacaoAtestado">
                      Tipificação:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="tipificacaoAtestado" defaultValue="">
                      <option value="" disabled>
                        Selecione a tipificação:
                      </option>
                      <option value="1">Médico.</option>
                      <option value="2">Odontológico.</option>
                    </CFormSelect>
                  </CCol>

                  {/* Seletor de Especificação */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="especificacaoAtestado">
                      Especificação:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="especificacaoAtestado" defaultValue="">
                      <option value="" disabled>
                        Selecione a especificação:
                      </option>
                      <option value="1">Doença.</option>
                      <option value="2">Acidente de trabalho.</option>
                      <option value="3">Licença maternidade.</option>
                    </CFormSelect>
                  </CCol>

                  {/* Seletor de CID com React Select */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="cidAtestado">
                      CID:
                      {isLoadingCids && <small className="text-muted ms-2">(Buscando...)</small>}
                      {cidOptions.length > 0 && !isLoadingCids && (
                        <small className="text-info ms-2">({cidOptions.length} encontrados)</small>
                      )}
                      {inputValue.length > 0 && inputValue.length < 2 && (
                        <small className="text-warning ms-2">
                          (Digite pelo menos 2 caracteres)
                        </small>
                      )}
                    </CFormLabel>
                    <Select
                      id="cidAtestado"
                      options={cidOptions}
                      value={selectedCid}
                      onChange={(selected) => {
                        setSelectedCid(selected)
                        // Limpar o input após seleção para melhor UX
                        if (selected) {
                          setInputValue('')
                        }
                      }}
                      onInputChange={(newValue, { action }) => {
                        if (action === 'input-change') {
                          setInputValue(newValue)
                        } else if (action === 'menu-close' && !selectedCid) {
                          // Manter o valor de input se não há seleção
                          setInputValue(newValue || '')
                        }
                      }}
                      inputValue={selectedCid ? '' : inputValue}
                      placeholder={
                        selectedCid
                          ? selectedCid.label
                          : isLoadingCids
                            ? 'Buscando CIDs...'
                            : inputValue.length > 0 && inputValue.length < 2
                              ? 'Digite pelo menos 2 caracteres...'
                              : cidOptions.length === 0 && inputValue.length >= 2
                                ? 'Nenhum CID encontrado'
                                : 'Digite pelo menos 2 caracteres para buscar...'
                      }
                      isSearchable={true}
                      isClearable={true}
                      isLoading={isLoadingCids}
                      noOptionsMessage={({ inputValue }) => {
                        if (!inputValue || inputValue.length < 2) {
                          return 'Digite pelo menos 2 caracteres para buscar'
                        }
                        return 'Nenhum CID encontrado'
                      }}
                      loadingMessage={() => 'Buscando CIDs...'}
                      // Configurações para otimização
                      filterOption={null} // Desabilita o filtro interno do react-select
                      // Configurações de comportamento do menu
                      closeMenuOnSelect={true}
                      blurInputOnSelect={true}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: state.isFocused ? '#8f0715' : '#dee2e6',
                          boxShadow: state.isFocused
                            ? '0 0 0 0.2rem rgba(143, 7, 21, 0.25)'
                            : 'none',
                          '&:hover': {
                            borderColor: '#8f0715',
                          },
                          minHeight: '38px',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? '#8f0715'
                            : state.isFocused
                              ? '#f8f9fa'
                              : 'white',
                          color: state.isSelected ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: state.isSelected ? '#8f0715' : '#f8f9fa',
                          },
                          cursor: 'pointer',
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#6c757d',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          maxHeight: 200, // Limita altura do menu
                        }),
                      }}
                    />
                    {cidError && (
                      <small className="text-danger">
                        Erro ao carregar CIDs. Tente digitar novamente.
                      </small>
                    )}
                  </CCol>

                  {/* Campos de Data e Dias */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="dataInicioAtestado">
                      Data de Início: <span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        type="date"
                        id="dataInicioAtestado"
                        max={new Date().toISOString().split('T')[ 0 ]}
                        onChange={calcularDataFinal}
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[ 0 ]
                          document.getElementById('dataInicioAtestado').value = today
                          calcularDataFinal()
                        }}
                      />
                    </CInputGroup>
                    <small className="form-text text-muted">
                      <span id="diasAtras"></span>
                    </small>
                  </CCol>

                  {/* Campo de Dias de Atestado */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="diasAtestado">
                      Dias de atestado: <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="diasAtestado"
                      min="1"
                      max="365"
                      placeholder="Ex: 3"
                      onChange={calcularDataFinal}
                    />
                    <small className="form-text text-muted">
                      <span id="informacaoDias"></span>
                    </small>
                  </CCol>

                  {/* Campo de Data Final */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="dataFinalAtestado">
                      Data final:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      id="dataFinalAtestado"
                      readOnly
                      style={{ backgroundColor: '#e5e7ebb7' }}
                    />
                    <small className="form-text text-muted">
                      <span id="informacaoDataFinal"></span>
                    </small>
                  </CCol>

                  {/* Campos de Médico */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="medicoAtestado">
                      Médico responsável:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      type="text" 
                      id="medicoAtestado" 
                      placeholder="Nome do médico:" 
                    />
                  </CCol>

                  {/* Campo de justificativa */}
                  <CCol md={8}>
                    <CFormLabel htmlFor="justificativaAtestado">Justificativa:</CFormLabel>
                    <CFormTextarea
                      id="justificativaAtestado"
                      placeholder="Justificativa:"
                      rows={1}
                    />
                  </CCol>

                  {/* Botões de Ação */}
                  <CCol md={12}>
                    <CFormLabel htmlFor="anexoAtestado">
                      Anexo do Atestado: <span className="text-danger">*</span>
                    </CFormLabel>
                    {/* Área de anexo do atestado*/}
                    <div className="upload-container mb-3">
                      <input
                        type="file"
                        className="d-none"
                        id="anexoAtestado"
                        accept=".pdf,.jpg,.jpeg,.png"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files[ 0 ])}
                      />
                    </div>
                  </CCol>

                  <CCol lg={12}>
                    {!file ? (
                      <div
                        className="upload-button-area"
                        style={{
                          border: '2px dashed #dee2e6',
                          borderRadius: '12px',
                          padding: '20px 20px',
                          textAlign: 'center',
                          backgroundColor: '#f8f9fa',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = '#7a0202a6'
                          e.currentTarget.style.backgroundColor = '#e3f2fd'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = '#dee2e6'
                          e.currentTarget.style.backgroundColor = '#f8f9fa'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = '#dee2e6'
                          e.currentTarget.style.backgroundColor = '#f8f9fa'
                          e.currentTarget.style.transform = 'scale(1)'
                          const droppedFile = e.dataTransfer.files[ 0 ]
                          if (droppedFile) {
                            handleFileChange(droppedFile)
                          }
                        }}
                      >
                        {/* Texto principal */}
                        <div>
                          <h5 className="mb-3 text-primary fw-bold">Clique ou arraste aqui</h5>

                          {/* Botão estilizado */}
                          <CButton
                            color="primary"
                            variant="outline"
                            size="md"
                            className="mb-3 px-4 py-2"
                            style={{
                              borderRadius: '10px',
                              fontWeight: 'bold',
                              transition: 'all 0.3s ease',
                              border: '2px solid #8f0715',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)'
                              e.target.style.boxShadow = '0 6px 20px rgba(148, 1, 1, 0.32)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)'
                              e.target.style.boxShadow = 'none'
                            }}
                          >
                            Procurar arquivo
                          </CButton>

                          {/* Informações dos tipos aceitos */}
                          <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              PDF
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              JPG
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              JPEG
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              PNG
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              • Até 10MB
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Arquivo selecionado  */
                      <div className="selected-file-container">
                        <div
                          className="card border-0 shadow-sm"
                          style={{
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            overflow: 'hidden',
                          }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between">
                              {/* Informações do arquivo */}
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                  <h6 className="mb-0 text-dark fw-bold me-2">{file.name}</h6>
                                  <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                                    Carregado
                                  </span>
                                </div>

                                <div>
                                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                    {file.type.split('/')[ 1 ].toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Botões de ação */}
                              <div className="d-flex gap-2">
                                <CButton
                                  type="button"
                                  color="info"
                                  variant="outline"
                                  size="md"
                                  onClick={handleViewFile}
                                  style={{
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  Visualizar
                                </CButton>
                                <CButton
                                  type="button"
                                  color="danger"
                                  variant="outline"
                                  size="md"
                                  onClick={() => handleRemoveFile(fileInputRef)}
                                  style={{
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  Remover
                                </CButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensagem de erro */}
                    {fileError && (
                      <div
                        className="alert alert-danger mt-3"
                        style={{
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        <strong>{fileError}</strong>
                      </div>
                    )}
                  </CCol>

                  <CCol lg={12} className="text-end">
                    <CButton
                      size="md"
                      type="submit"
                      color="primary"
                      className="w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Enviando...' : 'Enviar Atestado'}
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Atestados
