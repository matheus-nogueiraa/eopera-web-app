import React, { useState, useEffect, useRef } from 'react';
import {
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { cilPlus, cilCloudDownload, cilCheckCircle, cilX } from '@coreui/icons'
import ServicosModal from './servicosModal';
import ServicosTabela from './servicosTabela';

// Adicionando estilos CSS para animação
const styles = `
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const criarConteudos = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    color: 'success'
  });

  // Referência para a tabela de serviços
  const tabelaRef = useRef(null);

  // Adicionar estilos CSS ao montar o componente
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Função para mostrar alerta
  const showAlert = (message, color = 'success') => {
    setAlert({
      visible: true,
      message,
      color
    });

    // Esconder alerta após 5 segundos
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleCadastroSucesso = () => {
    // Recarregar dados da tabela
    if (tabelaRef.current && tabelaRef.current.recarregarDados) {
      tabelaRef.current.recarregarDados();
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Lançamento de Serviços</h1>
      </div>
      
      {/* Alertas */}
      {alert.visible && (
        <CAlert 
          color={alert.color}
          dismissible
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
          className="mb-4 animate-alert"
          style={{ 
            animation: 'fadeSlideDown 0.5s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {alert.color === 'success' ? (
            <CIcon icon={cilCheckCircle} className="me-2" />
          ) : (
            <CIcon icon={cilX} className="me-2" />
          )}
          {alert.message}
        </CAlert>
      )}
      
      <CRow className="mb-4">
        <CCol lg={12} className="d-flex align-items-center gap-2 mb-4">
          <CButton 
            color="primary" 
            style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} 
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processando...
              </>
            ) : (
              <>
                <CIcon icon={cilPlus} className="text-white" /> Adicionar OS
              </>
            )}
          </CButton>
        </CCol>
        <ServicosTabela ref={tabelaRef} />
      </CRow>
      
      <ServicosModal 
        visible={showModal} 
        setVisible={setShowModal} 
        setLoadingParent={setLoading}
        showAlertParent={showAlert}
        onSuccess={handleCadastroSucesso}
      />
      
    </div>
  );
};

export default criarConteudos;

