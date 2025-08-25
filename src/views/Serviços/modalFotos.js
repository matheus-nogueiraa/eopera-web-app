import React, { useState, useEffect, useRef } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
  CSpinner,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilTrash, 
  cilCamera, 
  cilPlus, 
  cilCheckAlt, 
  cilX,
  cilWarning,
  cilImageBroken,
  cilZoom
} from '@coreui/icons';
import fotosService from '../../services/fotosService';

// Estilos CSS para o modal de fotos
const modalFotosStyles = `
  .foto-thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #dee2e6;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .foto-thumbnail:hover {
    border-color: #0d6efd;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  }
  
  .foto-preview-large {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .upload-area {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: #f8f9fa;
  }
  
  .upload-area:hover {
    border-color: #0d6efd;
    background-color: #e7f1ff;
  }
  
  .upload-area.drag-over {
    border-color: #0d6efd;
    background-color: #e7f1ff;
    transform: scale(1.02);
  }
  
  .foto-item {
    transition: all 0.3s ease;
  }
  
  .foto-item:hover {
    background-color: #f8f9fa;
  }
  
  .btn-foto-action {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    cursor: pointer;
  }
  
  .modal-preview-content {
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
  }
`;

// Adicionar estilos ao documento
if (!document.getElementById('modal-fotos-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'modal-fotos-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = modalFotosStyles;
  document.head.appendChild(styleSheet);
}

const ModalFotos = ({ 
  visible, 
  setVisible, 
  idOcorrencia, 
  itemServico, 
  servicoDescricao = '',
  fotos: fotosExternas = [], // Fotos vindas do estado do modal pai
  onFotosChange, // Callback para atualizar fotos no modal pai
  modoVisualizacao = false 
}) => {
  const [fotos, setFotos] = useState([]);
  const [fotosOriginais, setFotosOriginais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertColor, setAlertColor] = useState('success');
  const [previewFoto, setPreviewFoto] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  // Carregar fotos quando o modal abrir
  useEffect(() => {
    
    if (visible) {
      if (idOcorrencia && itemServico) {
        // SEMPRE carregar fotos da API quando há idOcorrencia e itemServico
        // Isso garante que temos os dados corretos com itemFoto para edição
        carregarFotosDoServidor();
      } else if (fotosExternas && fotosExternas.length > 0) {
        // Usar fotos do estado externo apenas quando não há dados da API
        // (modo criação de nova ocorrência)
        setFotos([...fotosExternas]);
        setFotosOriginais([...fotosExternas]);
      } else {
        // Modal limpo - novo serviço sem fotos
        setFotos([]);
        setFotosOriginais([]);
      }
    }
  }, [visible, idOcorrencia, itemServico]);

  // Função para carregar fotos do servidor
  const carregarFotosDoServidor = async () => {
    if (!idOcorrencia || !itemServico) {
      setFotos([]);
      setFotosOriginais([]);
      return;
    }

    setLoading(true);
    
    try {
      const fotosServidor = await fotosService.consultarFotosServicoOcorrencia(idOcorrencia, itemServico);
      
      // Garantir que fotosServidor é um array
      const fotosArray = Array.isArray(fotosServidor) ? fotosServidor : [];
      
      setFotos(fotosArray);
      setFotosOriginais([...fotosArray]);
      
      if (fotosArray.length === 0) {
      } else {
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setFotos([]);
      setFotosOriginais([]);
      
      // Mostrar erro apenas se não for 404
      if (!error.message.includes('404') && !error.message.includes('Not Found')) {
        mostrarAlert(`Erro ao carregar fotos: ${error.message}`, 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para mostrar alertas
  const mostrarAlert = (message, color = 'success') => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlertVisible(true);
    
    // Auto-hide para alertas de sucesso
    if (color === 'success') {
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    }
  };

  // Função para processar upload de fotos
  const processarUploadFotos = async (files) => {
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    try {
      const novasFotos = await fotosService.processarMultiplasImagens(files);
      
      // Adicionar as novas fotos ao estado local
      const fotosAtualizadas = [...fotos, ...novasFotos];
      setFotos(fotosAtualizadas);
      
      // Notificar o modal pai sobre as mudanças (se estiver em modo edição)
      if (onFotosChange) {
        onFotosChange(fotosAtualizadas);
      }

      mostrarAlert(
        `${novasFotos.length} foto${novasFotos.length > 1 ? 's' : ''} adicionada${novasFotos.length > 1 ? 's' : ''} com sucesso!`, 
        'success'
      );
    } catch (error) {
      console.error('Erro ao processar fotos:', error);
      mostrarAlert(`Erro ao processar fotos: ${error.message}`, 'danger');
    } finally {
      setUploadLoading(false);
    }
  };

  // Função para remover foto
  const removerFoto = (index) => {
    const fotosAtualizadas = fotos.filter((_, i) => i !== index);
    setFotos(fotosAtualizadas);
    
    // Notificar o modal pai sobre as mudanças
    if (onFotosChange) {
      onFotosChange(fotosAtualizadas);
    }

    mostrarAlert('Foto removida com sucesso!', 'success');
  };

  // Handlers para drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (modoVisualizacao) return;
    
    const files = e.dataTransfer.files;
    processarUploadFotos(files);
  };

  // Handler para input de arquivo
  const handleFileInputChange = (e) => {
    processarUploadFotos(e.target.files);
    // Limpar o input para permitir seleção do mesmo arquivo
    e.target.value = '';
  };

  // Função para abrir preview da foto
  const abrirPreviewFoto = (foto) => {
    setPreviewFoto(foto);
  };

  // Função para fechar preview
  const fecharPreview = () => {
    setPreviewFoto(null);
  };

  // Função para resetar o modal
  const resetarModal = () => {
    setFotos([]);
    setFotosOriginais([]);
    setAlertVisible(false);
    setPreviewFoto(null);
  };

  // Função para fechar modal sem salvar (limpa fotos temporárias)
  const fecharSemSalvar = () => {
    // Apenas fecha o modal sem alterar as fotos
    // As fotos já foram sincronizadas conforme o usuário adicionou/removeu
    resetarModal();
    setVisible(false);
  };

  return (
    <>
      <CModal
        visible={visible}
        onClose={fecharSemSalvar}
        size="xl"
        backdrop="static"
        keyboard={false}
        scrollable
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilCamera} className="me-2" />
            Gerenciar Fotos do Serviço
            {servicoDescricao && (
              <div className="text-muted small mt-1">{servicoDescricao}</div>
            )}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {/* Alert de sucesso/erro */}
          {alertVisible && (
            <CAlert
              color={alertColor}
              dismissible
              onClose={() => setAlertVisible(false)}
              className="mb-3"
            >
              <div className="d-flex align-items-center">
                <CIcon icon={alertColor === 'success' ? cilCheckAlt : cilX} className="me-2" />
                {alertMessage}
              </div>
            </CAlert>
          )}

          {/* Loading inicial */}
          {loading && (
            <div className="text-center py-4">
              <CSpinner color="primary" />
              <div className="mt-2 text-muted">Carregando fotos...</div>
            </div>
          )}

          {/* Área de upload (apenas se não for modo visualização) */}
          {!modoVisualizacao && !loading && (
            <CCard className="mb-4">
              <CCardHeader className="bg-light">
                <h6 className="mb-0">
                  <CIcon icon={cilPlus} className="me-2" />
                  Adicionar Fotos
                </h6>
              </CCardHeader>
              <CCardBody>
                <div
                  className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  
                  {uploadLoading ? (
                    <div>
                      <CSpinner color="primary" className="mb-2" />
                      <div className="text-muted">Processando fotos...</div>
                    </div>
                  ) : (
                    <div>
                      <CIcon icon={cilCamera} size="3xl" className="text-muted mb-3" />
                      <div className="mb-2">
                        <strong>Clique aqui ou arraste fotos para adicionar</strong>
                      </div>
                      <div className="text-muted small">
                        Formatos aceitos: JPEG, PNG, GIF, WebP (máx. 10MB por foto)
                      </div>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          )}

          {/* Lista de fotos */}
          {!loading && (
            <CCard>
              <CCardHeader className="bg-light">
                <CRow className="align-items-center">
                  <CCol>
                    <h6 className="mb-0">
                      Fotos ({fotos.filter(foto => foto.acao !== 'DELETE').length})
                    </h6>
                  </CCol>
                  {fotos.filter(foto => foto.acao !== 'DELETE').length > 0 && (
                    <CCol xs="auto">
                      <small className="text-muted">
                        Clique na foto para visualizar em tamanho maior
                      </small>
                    </CCol>
                  )}
                </CRow>
              </CCardHeader>
              <CCardBody>
                {fotos.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <CIcon icon={cilImageBroken} size="2xl" className="mb-3" />
                    <div>Nenhuma foto adicionada ainda</div>
                    {!modoVisualizacao && (
                      <div className="small mt-1">Use a área acima para adicionar fotos</div>
                    )}
                  </div>
                ) : (
                  <CTable hover responsive className="mb-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell width="100px">Preview</CTableHeaderCell>
                        <CTableHeaderCell>Arquivo</CTableHeaderCell>
                        <CTableHeaderCell width="100px" className="text-center">Ações</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {fotos
                        .filter(foto => foto.acao !== 'DELETE') // Não mostrar fotos marcadas para exclusão
                        .map((foto, index) => {
                          // Encontrar o índice original da foto para usar na função removerFoto
                          const originalIndex = fotos.findIndex(f => f === foto);
                          
                          return (
                            <CTableRow key={foto.id || originalIndex} className="foto-item">
                              <CTableDataCell>
                                <img
                                  src={`data:image/jpeg;base64,${foto.base64}`}
                                  alt={`Foto ${index + 1}`}
                                  className="foto-thumbnail"
                                  onClick={() => abrirPreviewFoto(foto)}
                                  title="Clique para ampliar"
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="fw-semibold">
                                  {foto.nome || `Foto ${index + 1}`}
                                  {foto.itemFoto && (
                                    <small className="text-muted ms-2">ID: {foto.itemFoto}</small>
                                  )}
                                </div>
                                {foto.tipo && (
                                  <small className="text-muted">{foto.tipo}</small>
                                )}
                              </CTableDataCell>
                            
                              <CTableDataCell className="text-center">
                                <div className="d-flex gap-1 justify-content-center">
                                  {!modoVisualizacao && (
                                    <CButton
                                      color="danger"
                                      variant="outline"
                                      size="sm"
                                      className="btn-foto-action"
                                      onClick={() => removerFoto(originalIndex)}
                                      title="Remover"
                                    >
                                      <CIcon icon={cilTrash} size="sm" />
                                    </CButton>
                                  )}
                                </div>
                              </CTableDataCell>
                            </CTableRow>
                          );
                        })}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          )}
        </CModalBody>

        <CModalFooter className="bg-light border-top">
          <CButton
            color="secondary"
            onClick={fecharSemSalvar}
            className="me-2"
          >
            Fechar
          </CButton>
          {!modoVisualizacao && fotos.filter(foto => foto.acao !== 'DELETE').length > 0 && (
            <CButton
              color="primary"
              onClick={() => {
                // Sincronizar fotos com o modal pai antes de fechar
                if (onFotosChange) {
                  onFotosChange(fotos);
                }
                
                mostrarAlert('Fotos salvas com sucesso!', 'success');
                setTimeout(() => {
                  resetarModal();
                  setVisible(false);
                }, 1000);
              }}
            >
              <CIcon icon={cilCheckAlt} className="me-1" />
              Salvar ({fotos.filter(foto => foto.acao !== 'DELETE').length} foto{fotos.filter(foto => foto.acao !== 'DELETE').length !== 1 ? 's' : ''})
            </CButton>
          )}
        </CModalFooter>
      </CModal>

      {/* Modal de preview da foto */}
      {previewFoto && (
        <div className="modal-preview-overlay" onClick={fecharPreview}>
          <div className="modal-preview-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`data:image/jpeg;base64,${previewFoto.base64}`}
              alt="Preview"
              className="foto-preview-large"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalFotos;
