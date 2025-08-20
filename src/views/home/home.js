import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CButton,
  CWidgetStatsB,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilFolderOpen,
  cilSpeedometer,
  cilSettings,
  cilCloudUpload,
  cilSearch,
  cilCheckCircle,
  cilClock,
  cilBold,
  cilBolt,
  cilPhone,
  cibInstagram,
  cibLinkedin,
  cibWhatsapp,
} from '@coreui/icons'
import './home.css'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const handleEnviarAtestados = () => {
    navigate('/atestados')
  }

  const handleConsultarAtestados = () => {
    navigate('/consulta-atestados')
  }

  // Funções para abrir redes sociais
  const handleLinkedIn = () => {
    window.open('https://www.linkedin.com/company/elcop-engenharia', '_blank')
  }

  const handleInstagram = () => {
    window.open('https://www.instagram.com/elcopengenharia', '_blank')
  }

  const handleWhatsApp = () => {
    window.open(
      'https://api.whatsapp.com/send?phone=556235411791&text=Mensagem%20sendo%20enviada%20a%20partir%20do%20site%20da%20Elcop%20Engenharia',
      '_blank',
    )
  }

  return (
    <CContainer>
      {/* Sessão de Bem-Vindo */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Bem-Vindo ao Portal Elcop</h1>
              <p className="hero-subtitle">
                <CIcon icon={cilBolt} className="text-warning me-2" /> Potencializamos o presente,
                energizando o futuro. <CIcon icon={cilBolt} className="text-warning me-2" />
                <br />
                Envie, consulte e gerencie seus atestados médicos com facilidade e segurança.
              </p>

              {/* Botões principais com ícones */}
              <CRow className="justify-content-center mt-2">
                <CCol md={4} lg={4} className="mb-2">
                  <CButton
                    color="light"
                    size="md"
                    className="btn-custom btn-primary-action w-100"
                    onClick={handleEnviarAtestados}
                  >
                    <CIcon icon={cilCloudUpload} className="me-2" />
                    Enviar Atestados
                  </CButton>
                </CCol>
                <CCol md={4} lg={4} className="mb-3">
                  <CButton
                    color="light"
                    size="md"
                    className="btn-custom btn-secondary-action w-100"
                    onClick={handleConsultarAtestados}
                  >
                    <CIcon icon={cilSearch} className="me-2" />
                    Consultar Atestados
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </div>
        </CCol>

        {/* Seção de Redes Sociais */}
        <CCol xs={12}>
          <div className="hero-section-social">
            <div className="hero-content">
              <h5 className="hero-title">Conecte-se Conosco</h5>
              <p className="hero-subtitle">
                Siga-nos nas redes sociais para ficar por dentro das novidades.
              </p>

              {/* Botões de Redes Sociais */}
              <CRow className="justify-content-center">
                <CCol xs={12} sm={4} md={3} lg={2} className="mb-3 text-center">
                  <CButton
                    color="success"
                    className="social-btn whatsapp-btn w-100"
                    onClick={handleWhatsApp}
                  >
                    <CIcon icon={cibWhatsapp} className="me-2" />
                    WhatsApp
                  </CButton>
                </CCol>

                {/* Botão do Instagram */}
                <CCol xs={12} sm={4} md={3} lg={2} className="mb-3 text-center">
                  <CButton
                    color="danger"
                    className="social-btn instagram-btn w-100"
                    onClick={handleInstagram}
                  >
                    <i className="fab fa-instagram me-2"></i>
                    <CIcon icon={cibInstagram} className="me-2" />
                    Instagram
                  </CButton>
                </CCol>

                {/* Botão do LinkedIn */}
                <CCol xs={12} sm={4} md={3} lg={2} className="mb-3 text-center">
                  <CButton
                    color="info"
                    className="social-btn linkedin-btn w-100"
                    onClick={handleLinkedIn}
                  >
                    <i className="fab fa-linkedin-in me-2"></i>
                    <CIcon icon={cibLinkedin} className="me-2" />
                    LinkedIn
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Home
