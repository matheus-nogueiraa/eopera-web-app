import React, { useRef, useState } from 'react'
import '../consulta-atestados/ConsultarAtestados.css'
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
import { calcularDataFinal, limparFormulario } from './utils/atestadosUtils'
import { useFileHandler } from './hooks/useFileHandler'

const Atestados = () => {
  const [ processInfo, setProcessInfo ] = useState(null)
  const [ validated, setValidated ] = useState(false)
  const [ showSuccessAlert, setShowSuccessAlert ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ alertType, setAlertType ] = useState('success')


  // Hooks necessários
  const fileInputRef = useRef(null)
  const { file, fileError, handleFileChange, handleViewFile, handleRemoveFile } = useFileHandler()

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

  // Função para lidar com o submit do formulário
  const handleSubmit = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const anexoBase64 = fileInputRef.current?.files[ 0 ] ? await getFileBase64(fileInputRef.current.files[ 0 ]) : ''
    console.log('Anexo Base64:', anexoBase64)

    if (formElement.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }

    setIsLoading(true)

    try {
      const dadosFormulario = {
        matricula: localStorage.getItem('matricula') || '',
        cpf: localStorage.getItem('cpf') || '',
        userNome: localStorage.getItem('nomeUsuario') || '',
        atestado: document.getElementById('tipificacaoAtestado')?.options[document.getElementById('tipificacaoAtestado')?.selectedIndex]?.text || '',
        motivoAfastamento: document.getElementById('especificacaoAtestado')?.options[document.getElementById('especificacaoAtestado')?.selectedIndex]?.text || '',
        dataInicio: document.getElementById('dataInicioAtestado')?.value || '',
        qtdDias: document.getElementById('diasAtestado')?.value || '',
        cid: document.getElementById('cidAtestado')?.options[document.getElementById('cidAtestado')?.selectedIndex]?.text || '',
        nomeMedico: document.getElementById('medicoAtestado')?.value || '',
        justificativa: document.getElementById('justificativaAtestado')?.value || '',
        anexoBase64,
        nomeAnexo: file?.name || (fileInputRef.current?.files[0]?.name ?? ''),
      }

      console.log('Dados do formulário:', dadosFormulario)

      await enviarAtestado(dadosFormulario)
      limparFormulario(setValidated, fileInputRef)

      // Esconder alerta após 5 segundos
      setTimeout(() => setShowSuccessAlert(false), 5000)
    } catch (error) {
      console.error('Erro ao enviar atestado:', error)
      // Aqui você pode adicionar tratamento de erro (toast, modal, etc.)
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
        <h1 className="h3 mb-0 text-gray-800">Enviar Atestados</h1>
      </div>

      {/* Alert de Sucesso com Ícone */}
      {showSuccessAlert && processInfo && (
        <CAlert
          color={alertType}
          dismissible
          onClose={() => setShowSuccessAlert(false)}
          className="d-flex align-items-center shadow-sm"
          style={{
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          <CIcon icon={cilCheckCircle} className="flex-shrink-0 me-2" width={24} height={24} />
          <div>
            <strong>Concluído!</strong> {processInfo.mensagem}<br />
            <span>Protocolo: <strong>{processInfo.idProcess}</strong></span>
          </div>
        </CAlert>
      )}

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Incluir Atestado Médico</h6>
            </CCardHeader>
            <CCardBody>
              <CForm
                className="needs-validation"
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
              >
                <CRow className="g-3">
                  {/* Seletor de Tipificação */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="tipificacaoAtestado">
                      Tipificação:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="tipificacaoAtestado" required defaultValue="">
                      <option value="" disabled>
                        Selecione a tipificação:
                      </option>
                      <option value="1">Médico.</option>
                      <option value="2">Odontológico.</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
                  </CCol>

                  {/* Seletor de Especificação */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="especificacaoAtestado">
                      Especificação:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="especificacaoAtestado" required defaultValue="">
                      <option value="" disabled>
                        Selecione a especificação:
                      </option>
                      <option value="1">Doença.</option>
                      <option value="2">Acidente de trabalho.</option>
                      <option value="3">Licença maternidade.</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
                  </CCol>

                  {/* Seletor de CID */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="cidAtestado">CID:</CFormLabel>
                    <CFormSelect id="cidAtestado" defaultValue="">
                      <option value="" disabled>
                        Selecione o CID:
                      </option>
                      <option value="1">F00 - Transtornos mentais e comportamentais.</option>
                      <option value="2">F01 - Demência.</option>
                      <option value="3">
                        F02 - Demência em doenças não classificadas em outra parte.
                      </option>
                    </CFormSelect>
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
                        required
                        max={new Date().toISOString().split('T')[ 0 ]}
                        onChange={calcularDataFinal}
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[ 0 ]
                          document.getElementById('dataInicioAtestado').value = today
                          calcularDataFinal()
                        }}
                      />
                      <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
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
                      required
                      onChange={calcularDataFinal}
                    />
                    <small className="form-text text-muted">
                      <span id="informacaoDias"></span>
                    </small>
                    <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
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
                    <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
                    <small className="form-text text-muted">
                      <span id="informacaoDataFinal"></span>
                    </small>
                  </CCol>

                  {/* Campos de Médico */}
                  <CCol md={4}>
                    <CFormLabel htmlFor="medicoAtestado">Médico responsável:</CFormLabel>
                    <CFormInput type="text" id="medicoAtestado" placeholder="Nome do médico:" />
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
                        required
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
                          e.currentTarget.style.borderColor = '#ff0000a6'
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Atestados
