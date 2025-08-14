import React, { useState, useEffect, useRef } from 'react';
import {
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { cilPlus, cilCloudDownload, cilCheckCircle, cilX, cilInfo } from '@coreui/icons'
import ServicosModal from './servicosModal';
import ServicosTabela from './servicosTabela';
import { usePermissoesCRUD } from '../../contexts/PermissoesContext';

// Adicionando estilos CSS para animação
const styles = `
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .alert-danger {
    border-left: 4px solid #dc3545 !important;
  }
  
  .alert-danger ul {
    margin: 0;
    padding-left: 1rem;
    line-height: 1.6;
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

  // Hook para verificar permissões da rota /servicos
  const { podeAdicionar, podeEditar, podeDeletar } = usePermissoesCRUD('/servicos');

  // Debug - pode ser removido depois
  useEffect(() => {
    const isAdmin = localStorage.getItem('admin') === 'T'
    console.log('Permissões para /servicos:', {
      isAdmin,
      podeAdicionar,
      podeEditar,
      podeDeletar
    });
  }, [podeAdicionar, podeEditar, podeDeletar]);

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

    // Esconder alerta após tempo variável dependendo do tipo
    const timeoutDuration = color === 'danger' ? 10000 : 5000; // 10 segundos para erros, 5 para sucesso
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, timeoutDuration);
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
      {/* {alert.visible && alert.color === 'success' && (
        <CAlert 
          color={alert.color}
          dismissible
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
          className={`mb-4 animate-alert d-flex align-items-start`}
          style={{ 
            animation: 'fadeSlideDown 0.5s ease-out',
            boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)',
            position: 'relative',
            zIndex: 1050
          }}
        >
          <div className="flex-shrink-0 me-2 mt-1">
            <CIcon icon={cilCheckCircle} />
          </div>
          <div 
            className="flex-grow-1" 
            dangerouslySetInnerHTML={{ __html: alert.message }}
          />
        </CAlert>
      )} */}
      
      <CRow className="mb-4">
        <CCol lg={12} className="d-flex align-items-center gap-2 mb-4">
          {podeAdicionar ? (
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
          ) : (
            <div className="text-muted">
              <small>
                <CIcon icon={cilInfo} className="me-1" />
                Você não tem permissão para adicionar serviços
              </small>
            </div>
          )}
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

