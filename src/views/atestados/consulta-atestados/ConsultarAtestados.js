import React, { useRef, useState } from 'react'

import './ConsultarAtestados.css'
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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCheckCircle, cilClock, cilXCircle, cilZoomIn } from '@coreui/icons'
const ConsultaAtestados = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    status: '',
    tipificacao: '',
  })

  const dataInicioRef = useRef(null)
  const dataFimRef = useRef(null)

  const [atestados, setAtestados] = useState([
    // Dados de exemplo - substitua por dados reais da API
    {
      id: 1,
      tipificacao: 'Atestado de Saúde',
      dataInicio: '2025-07-15',
      dataFim: '2025-07-17',
      dias: 3,
      medico: 'Dr. João Silva',
      status: 'Aprovado',
      dataEnvio: '2025-07-15',
    },
    {
      id: 2,
      tipificacao: 'Atestado Odontológico',
      dataInicio: '2025-07-10',
      dataFim: '2025-07-10',
      dias: 1,
      medico: 'Dra. Maria Santos',
      status: 'Pendente',
      dataEnvio: '2025-07-10',
    },
  ])

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const buscarAtestados = () => {
    // Aqui você implementaria a lógica de busca
    console.log('Buscando atestados com filtros:', filtros)
  }

  const expandirCalendario = (ref) => {
    if (ref.current) {
      ref.current.showPicker()
    }
  }

  const getStatusConfig = (status) => {
    const statusConfig = {
      Aprovado: {
        color: 'success',
        icon: cilCheckCircle,
        text: 'Aprovado',
      },
      Pendente: {
        color: 'warning',
        icon: cilClock,
        text: 'Pendente',
      },
      Rejeitado: {
        color: 'danger',
        icon: cilXCircle,
        text: 'Rejeitado',
      },
    }
    return statusConfig[status] || { color: 'secondary', icon: null, text: status }
  }

  const renderStatus = (status) => {
    const config = getStatusConfig(status)
    return (
      <CBadge
        color={config.color}
        className="d-flex align-items-center gap-1 justify-content-center"
      >
        {config.icon && <CIcon icon={config.icon} size="sm" />}
        {config.text}
      </CBadge>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Consultar Atestados Enviados</h1>
      </div>

      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Atestados Encontrados</h6>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={3}>
                  <CFormLabel htmlFor="status">Status:</CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    id="status"
                    value={filtros.status}
                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="tipificacao">Tipificação:</CFormLabel>
                  <CFormSelect
                    id="tipificacao"
                    value={filtros.tipificacao}
                    onChange={(e) => handleFiltroChange('tipificacao', e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="Atestado de Saúde">Atestado de Saúde</option>
                    <option value="Atestado Odontológico">Atestado Odontológico</option>
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="dataInicio">Data Início:</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="date"
                      id="dataInicio"
                      ref={dataInicioRef}
                      value={filtros.dataInicio}
                      onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                      onClick={() => expandirCalendario(dataInicioRef)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="dataFim">Data Fim:</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      type="date"
                      id="dataFim"
                      ref={dataFimRef}
                      value={filtros.dataFim}
                      onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                      onClick={() => expandirCalendario(dataFimRef)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="text-center">
                  <CButton
                    type="button"
                    color="primary"
                    className="w-100"
                    onClick={buscarAtestados}
                  >
                    <CIcon icon={cilSearch} className="me-1" />
                    Buscar
                  </CButton>
                </CCol>
              </CRow>
              <hr />
              {atestados.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Nenhum atestado encontrado.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>Numeração:</th>
                        <th>Tipificação:</th>
                        <th>Especificação:</th>
                        <th>Data Início:</th>
                        <th>Data Fim:</th>
                        <th>Dias:</th>
                        <th>Anexo:</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atestados.map((atestado) => (
                        <tr key={atestado.id}>
                          <td className="text-center">{atestado.numero}</td>
                          <td>{atestado.tipificacao}</td>
                          <td>{atestado.especificacao}</td>
                          <td>{new Date(atestado.dataInicio).toLocaleDateString('pt-BR')}</td>
                          <td>{new Date(atestado.dataFim).toLocaleDateString('pt-BR')}</td>
                          <td className="text-center">{atestado.dias}</td>
                          <td className="text-center">
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              className="mx-auto"
                              title="Visualizar detalhes do atestado"
                              onClick={() => visualizarAtestado(atestado)}
                            >
                              <CIcon icon={cilZoomIn} size="sm" />
                              Visualizar
                            </CButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default ConsultaAtestados
