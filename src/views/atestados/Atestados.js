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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilXCircle, cilCalendar } from '@coreui/icons'

const Atestados = () => {
  const [validated, setValidated] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
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
    if (fileInputRef.current) fileInputRef.current.value = ''
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

    // Calcular data final se tiver dias
    if (dataInicio && dias && dias > 0) {
      const data = new Date(dataInicio + 'T00:00:00')
      data.setDate(data.getDate() + dias - 1)
      const dataFinal = data.toISOString().split('T')[0]
      document.getElementById('dataFinalAtestado').value = dataFinal
    } else {
      document.getElementById('dataFinalAtestado').value = ''
    }
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()
    if (!file) {
      setFileError('Anexo obrigatório.')
    }
    if (form.checkValidity() === false || !file) {
      setValidated(true)
      return
    }
    // Aqui você pode adicionar a lógica de envio do formulário
    alert('Atestado enviado com sucesso!')
    setValidated(false)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Envio de atestados</h1>
      </div>
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
                  <CCol md={4}>
                    <CFormLabel htmlFor="especificacaoAtestado">
                      Especificação:<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="especificacaoAtestado" required defaultValue="">
                      <option value="" disabled>
                        Selecione ou digite a especificação:
                      </option>
                      <option value="1">Doença.</option>
                      <option value="2">Acidente de trabalho.</option>
                      <option value="3">Licença maternidade.</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="cidAtestado">CID:</CFormLabel>
                    <CFormSelect id="cidAtestado" required defaultValue="">
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
                      />
                      <CButton
                        type="button"
                        color="secondary"
                        title="Data de hoje"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0]
                          document.getElementById('dataInicioAtestado').value = today
                          calcularDataFinal()
                        }}
                      >
                        <CIcon icon={cilCalendar} size="md" />
                      </CButton>
                      <CFormFeedback invalid>Campo obrigatório.</CFormFeedback>
                    </CInputGroup>
                    <small className="form-text text-muted">
                      <span id="diasAtras"></span>
                    </small>
                  </CCol>
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
                  <CCol md={4}>
                    <CFormLabel htmlFor="medicoAtestado">Médico responsável:</CFormLabel>
                    <CFormInput
                      type="text"
                      id="medicoAtestado"
                      placeholder="Nome do médico:"
                      required
                    />
                  </CCol>
                  <CCol md={8}>
                    <CFormLabel htmlFor="justificativaAtestado">Justificativa:</CFormLabel>
                    <CFormTextarea
                      id="justificativaAtestado"
                      placeholder="Justificativa:"
                      rows={1}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="anexoAtestado">
                      Anexo do Atestado: <span className="text-danger">*</span>
                    </CFormLabel>
                    <div
                      className="upload-area border rounded p-3 mb-2"
                      style={{ background: '#f8f9fa' }}
                    >
                      <input
                        type="file"
                        className="form-control"
                        id="anexoAtestado"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'block' }}
                      />
                      {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
                      {!file && (
                        <div className="upload-text text-center mt-2">
                          <h5>
                            Arraste o arquivo aqui ou{' '}
                            <span className="upload-browse">clique para procurar</span>
                          </h5>
                          <p className="upload-formats">PDF, JPG, JPEG, PNG • Máximo 10MB</p>
                        </div>
                      )}
                      {file && (
                        <div id="filePreview" className="file-preview mt-2">
                          <div className="file-item d-flex align-items-center">
                            <div className="file-icon me-2">
                              <i className="fas fa-file"></i>
                            </div>
                            <div className="file-info me-2">
                              <div className="file-name">{file.name}</div>
                              <div className="file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                              <div className="upload-success">
                                <i className="fas fa-check-circle text-success"></i> Arquivo
                                carregado com sucesso
                              </div>
                            </div>
                            <div className="file-actions ms-auto">
                              <CButton
                                type="button"
                                color="info"
                                size="sm"
                                className="me-1"
                                onClick={() => window.open(URL.createObjectURL(file))}
                              >
                                <CIcon icon={cilSearch} size="lg" />
                              </CButton>
                              <CButton
                                type="button"
                                color="danger"
                                size="sm"
                                onClick={handleRemoveFile}
                              >
                                <CIcon icon={cilXCircle} size="lg" />
                              </CButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div id="infoAnexo" className="mt-2"></div>
                  </CCol>
                  <CCol lg={12} className="text-end">
                    <CButton type="submit" color="primary" className="btn-block">
                      <i className="fas fa-save"></i> Enviar Atestado
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
