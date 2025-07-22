import React, { useRef, useState } from 'react'
import './consulta-atestados/ConsultarAtestados.css'
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
import { cilCheckCircle } from '@coreui/icons' // Adicionar este import

const Atestados = () => {
  const [validated, setValidated] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  // Adicionar estado para controlar o alert de sucesso
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const fileInputRef = useRef()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Tipo de arquivo não permitido. Use apenas PDF, JPG, JPEG ou PNG.')
        setFile(null)
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('Arquivo excede 10MB.')
        setFile(null)
      } else {
        setFile(selectedFile)
        setFileError('')
      }
    } else {
      setFile(null)
      setFileError('')
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleViewFile = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }

  // Função para calcular a data final
  const calcularDataFinal = () => {
    const dataInicio = document.getElementById('dataInicioAtestado').value
    const dias = parseInt(document.getElementById('diasAtestado').value, 10)

    // Calcular informação sobre a data selecionada
    if (dataInicio) {
      const hoje = new Date()
      const dataSelecionada = new Date(dataInicio + 'T00:00:00') // Força horário local

      // Normalizar as datas para comparação (apenas a parte da data)
      const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
      const dataSelecionadaNormalizada = new Date(
        dataSelecionada.getFullYear(),
        dataSelecionada.getMonth(),
        dataSelecionada.getDate(),
      )

      const diferenca = Math.floor(
        (hojeNormalizado - dataSelecionadaNormalizada) / (1000 * 60 * 60 * 24),
      )

      let mensagem = ''
      if (diferenca === 0) {
        mensagem = '📅 Data de hoje selecionada'
      } else if (diferenca > 0) {
        mensagem = `📅 Data selecionada: ${diferenca} dia${diferenca === 1 ? '' : 's'} atrás`
      } else {
        mensagem = `📅 ⚠️ Data não pode ser no futuro!`
        // Limpar o campo se a data for no futuro
        document.getElementById('dataInicioAtestado').value = ''
        document.getElementById('dataFinalAtestado').value = ''
        document.getElementById('diasAtras').textContent = mensagem
        return
      }

      document.getElementById('diasAtras').textContent = mensagem
    } else {
      document.getElementById('diasAtras').textContent = ''
    }

    // Calcular informação sobre os dias de atestado
    if (dias && dias > 0) {
      let mensagemDias = ''
      let cor = ''

      if (dias >= 1 && dias <= 15) {
        mensagemDias = `⏱️ Tempo Regular (${dias} dia${dias === 1 ? '' : 's'})`
        cor = 'text-success'
      } else if (dias >= 16 && dias <= 30) {
        mensagemDias = `⏰ Tempo Intermediário (${dias} dias)`
        cor = 'text-warning'
      } else if (dias > 30) {
        mensagemDias = `🕐 Tempo Longo (${dias} dias)`
        cor = 'text-danger'
      }

      // Calcular finais de semana se também tiver data de início
      if (dataInicio) {
        const dataInicioCalc = new Date(dataInicio + 'T00:00:00')
        const dataFinalCalc = new Date(dataInicioCalc)
        dataFinalCalc.setDate(dataFinalCalc.getDate() + dias - 1)

        let finaisDeSemana = 0
        let dataAtual = new Date(dataInicioCalc)

        // Contar finais de semana completos no período
        while (dataAtual <= dataFinalCalc) {
          const diaSemana = dataAtual.getDay()

          // Se for sábado, verificar se domingo também está no período
          if (diaSemana === 6) {
            const domingo = new Date(dataAtual)
            domingo.setDate(domingo.getDate() + 1)

            if (domingo <= dataFinalCalc) {
              finaisDeSemana++
              // Pular para segunda-feira para não contar novamente
              dataAtual.setDate(dataAtual.getDate() + 2)
            } else {
              dataAtual.setDate(dataAtual.getDate() + 1)
            }
          } else {
            dataAtual.setDate(dataAtual.getDate() + 1)
          }
        }

        if (finaisDeSemana > 0) {
          mensagemDias += ` • 📅 ${finaisDeSemana} final${finaisDeSemana === 1 ? '' : 'is'} de semana`
        } else {
          mensagemDias += ` • 💼 Nenhum final de semana`
        }
      }

      const spanDias = document.getElementById('informacaoDias')
      spanDias.textContent = mensagemDias
      spanDias.className = `form-text ${cor}`
    } else {
      const spanDias = document.getElementById('informacaoDias')
      spanDias.textContent = ''
      spanDias.className = 'form-text text-muted'
    }

    // Calcular data final se tiver dias
    if (dataInicio && dias && dias > 0) {
      const data = new Date(dataInicio + 'T00:00:00')
      data.setDate(data.getDate() + dias - 1)
      const dataFinal = data.toISOString().split('T')[0]
      document.getElementById('dataFinalAtestado').value = dataFinal

      // Adicionar informação sobre a data de retorno (dia seguinte) com dia da semana
      const dataRetorno = new Date(data)
      dataRetorno.setDate(dataRetorno.getDate() + 1)
      const dataRetornoFormatada = dataRetorno.toLocaleDateString('pt-BR')

      // Obter o dia da semana
      const diasSemana = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
      ]
      const diaSemana = diasSemana[dataRetorno.getDay()]

      const spanDataFinal = document.getElementById('informacaoDataFinal')
      spanDataFinal.textContent = `📆 Retorno previsto: ${dataRetornoFormatada} (${diaSemana})`
      spanDataFinal.className = 'form-text text-info'
    } else {
      document.getElementById('dataFinalAtestado').value = ''
      const spanDataFinal = document.getElementById('informacaoDataFinal')
      spanDataFinal.textContent = ''
      spanDataFinal.className = 'form-text text-muted'
    }
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()

    // Validar se o arquivo foi anexado
    if (!file) {
      setFileError('Anexo obrigatório.')
    }

    // Verificar se o formulário é válido e se tem arquivo
    if (form.checkValidity() === false || !file) {
      setValidated(true)
      return
    }

    // Simular envio (aqui você pode adicionar a lógica de envio real)
    try {
      // Aqui seria a chamada da API para enviar o atestado
      // await enviarAtestado(formData)

      // Mostrar alert de sucesso
      setShowSuccessAlert(true)

      // Limpar todos os campos do formulário
      limparFormulario()

      // Auto-hide do alert após 5 segundos
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)
    } catch (error) {
      alert('❌ Erro ao enviar atestado. Tente novamente.')
      console.error('Erro:', error)
    }
  }

  // Função para limpar todo o formulário
  const limparFormulario = () => {
    // Resetar states
    setValidated(false)
    setFile(null)
    setFileError('')

    // Limpar campos do formulário usando uma abordagem mais robusta
    const form = document.querySelector('form')
    if (form) {
      form.reset() // Reset completo do formulário
    }

    // Limpar campos específicos que podem não ser resetados pelo form.reset()
    const campos = [
      'tipificacaoAtestado',
      'especificacaoAtestado',
      'dataInicioAtestado',
      'diasAtestado',
      'dataFinalAtestado',
      'justificativaAtestado',
    ]

    campos.forEach((campoId) => {
      const campo = document.getElementById(campoId)
      if (campo) {
        if (campo.type === 'select-one') {
          campo.selectedIndex = 0 // Reset para primeira opção (disabled)
        } else {
          campo.value = ''
        }
      }
    })

    // Limpar input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Limpar spans informativos
    const spans = ['diasAtras', 'informacaoDias', 'informacaoDataFinal']
    spans.forEach((spanId) => {
      const span = document.getElementById(spanId)
      if (span) {
        span.textContent = ''
        span.className = 'form-text text-muted'
      }
    })

    // Remover classes de validação com um pequeno delay
   setTimeout(() => {
     const formElements = document.querySelectorAll('.is-valid, .is-invalid')
     formElements.forEach((element) => {
       element.classList.remove('is-valid', 'is-invalid')
     })
   }, 100)

   console.log('📋 Formulário limpo e pronto para novo envio')
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Enviar Atestados</h1>
      </div>

      {/* Alert de Sucesso com Ícone */}
      {showSuccessAlert && (
        <CAlert
          color="success"
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
            <strong>Concluído!</strong> Atestado enviado com sucesso.
          </div>
        </CAlert>
      )}

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Incluir Atestado Médico:</h6>
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
                      <option value="1">Atestado de Saúde.</option>
                      <option value="2">Atestado Odontológico.</option>
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
                        max={new Date().toISOString().split('T')[0]}
                        onChange={calcularDataFinal}
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0]
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
                        onChange={handleFileChange}
                      />

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
                            const droppedFile = e.dataTransfer.files[0]
                            if (droppedFile) {
                              const allowedTypes = [
                                'application/pdf',
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                              ]
                              if (!allowedTypes.includes(droppedFile.type)) {
                                setFileError(
                                  'Tipo de arquivo não permitido. Use apenas PDF, JPG, JPEG ou PNG.',
                                )
                                setFile(null)
                                return
                              }
                              if (droppedFile.size > 10 * 1024 * 1024) {
                                setFileError('Arquivo excede 10MB.')
                                setFile(null)
                              } else {
                                setFile(droppedFile)
                                setFileError('')
                              }
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
                                    <span
                                      className="badge bg-success"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      Carregado
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                      {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                      {file.type.split('/')[1].toUpperCase()}
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
                                    onClick={handleRemoveFile}
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
                    </div>
                  </CCol>

                  <CCol lg={12} className="text-end">
                    <CButton size="md" type="submit" color="primary" className="w-100">
                      Enviar Atestado
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
