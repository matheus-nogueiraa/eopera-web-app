// Refactored ServicosModal component using hooks and smaller components

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX, cilCheckAlt, cilWarning } from '@coreui/icons';

// Import hooks
import { useModalState } from './hooks/useModalState';
import { useFormularioServicos } from './hooks/useFormularioServicos';

// Import components
import TabsContainer from './components/TabsContainer';

// Import utilities
import { validateForm, hasValidationErrors } from './utils/validations';
import { formatFormDataForSubmission } from './utils/formatters';
import { HIDE_FIELD_ERROR_DELAY } from './utils/constants';

// Import services
import { consultarCentroCusto } from '../../services/centroCustoService';
import { consultarServicosProtheus } from '../../services/servicosService';
import { consultarEquipes } from '../../services/equipesService';
import { consultarUsuariosEoperaX } from '../../services/usuariosService';
import httpRequest from '../../utils/httpRequests';

// Import styles
import './styles/ServicosModal.css';

/**
 * Refactored ServicosModal Component
 * @param {Object} props - Component props
 */
const ServicosModalRefactored = ({ 
  visible, 
  setVisible, 
  setLoadingParent, 
  showAlertParent, 
  onSuccess 
}) => {
  // Custom hooks
  const modalState = useModalState(showAlertParent);
  const formState = useFormularioServicos();

  // Additional state for data loading
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [todosServicos, setTodosServicos] = useState([]);
  const [todosMunicipios, setTodosMunicipios] = useState([]);
  const [equipesData, setEquipesData] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState({ matricula: '', nome: '', cpf: '' });

  // Load all cost centers
  const carregarTodosCentrosCusto = useCallback(async () => {
    formState.setLoadingCentroCusto(true);
    try {
      const response = await consultarCentroCusto({
        retornaInativos: 'N'
      });
      const dados = response?.data && Array.isArray(response.data) ? response.data : [];
      formState.setCentroCustoOpcoes(dados);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      formState.setCentroCustoOpcoes([]);
      modalState.mostrarAlert('Erro ao carregar centros de custo', 'danger');
    } finally {
      formState.setLoadingCentroCusto(false);
    }
  }, [formState, modalState]);

  // Load all users
  const carregarTodosUsuarios = useCallback(async () => {
    try {
      const dados = await consultarUsuariosEoperaX();
      setTodosUsuarios(dados || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setTodosUsuarios([]);
    }
  }, []);

  // Load all municipalities
  const carregarTodosMunicipios = useCallback(async () => {
    try {
      const resp = await httpRequest('/consultarMunicipiosIBGE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
      });
      const json = await resp.json();
      if (json.status && Array.isArray(json.data)) {
        setTodosMunicipios(json.data);
      }
    } catch (e) {
      console.error('Erro ao carregar municípios:', e);
      setTodosMunicipios([]);
    }
  }, []);

  // Load all teams
  const carregarTodasEquipes = useCallback(async () => {
    try {
      const dados = await consultarEquipes();
      setEquipesData(dados || []);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      setEquipesData([]);
    }
  }, []);

  // Load services by cost center
  const carregarServicosPorCentroCusto = useCallback(async (centroCusto) => {
    try {
      const dados = await consultarServicosProtheus({ centroCusto });
      setTodosServicos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error('Erro ao carregar serviços por centro de custo:', error);
      setTodosServicos([]);
      modalState.mostrarAlert('Erro ao carregar serviços do centro de custo', 'danger');
    }
  }, [modalState]);

  // Handle cost center change
  const handleCentroCustoChange = useCallback((e) => {
    const novoValor = e.target.value;
    
    if (formState.servicos.length > 0 && formState.centroCustoSelecionado !== novoValor) {
      // Show confirmation modal
      modalState.setNovoCentroCustoTemp(novoValor);
      modalState.setSelectElementTemp(e.target);
      modalState.setModalConfirmacaoVisible(true);
    } else {
      formState.setCentroCustoSelecionado(novoValor);
      if (novoValor) {
        carregarServicosPorCentroCusto(novoValor);
      }
    }
  }, [formState, modalState, carregarServicosPorCentroCusto]);

  // Confirm cost center change
  const confirmarTrocaCentroCusto = useCallback(() => {
    formState.setCentroCustoSelecionado(modalState.novoCentroCustoTemp);
    formState.setServicos([]); // Clear services
    setTodosServicos([]); // Clear services cache
    
    if (modalState.novoCentroCustoTemp) {
      carregarServicosPorCentroCusto(modalState.novoCentroCustoTemp);
    }
    
    modalState.setModalConfirmacaoVisible(false);
    modalState.setNovoCentroCustoTemp('');
    modalState.setSelectElementTemp(null);
  }, [formState, modalState, carregarServicosPorCentroCusto]);

  // Cancel cost center change
  const cancelarTrocaCentroCusto = useCallback(() => {
    if (modalState.selectElementTemp) {
      modalState.selectElementTemp.value = formState.centroCustoSelecionado;
    }
    modalState.setModalConfirmacaoVisible(false);
    modalState.setNovoCentroCustoTemp('');
    modalState.setSelectElementTemp(null);
  }, [formState, modalState]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (modalState.isSubmitting) return;

    modalState.setIsSubmitting(true);
    if (setLoadingParent) setLoadingParent(true);

    try {
      // Get form data
      const formData = formState.getFormData();
      
      // Validate form
      const errors = validateForm({
        ...formData,
        centroCustoSelecionado: formState.centroCustoSelecionado
      });

      if (hasValidationErrors(errors)) {
        modalState.setCamposComErro(errors);
        modalState.mostrarAlert('Por favor, corrija os campos destacados em vermelho.', 'danger');
        return;
      }

      // Format data for submission
      const submissionData = formatFormDataForSubmission({
        ...formData,
        centroCusto: formState.centroCustoSelecionado
      });

      // Submit to API
      const response = await httpRequest('/registrarServico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (result.status) {
        modalState.mostrarAlert('Serviço registrado com sucesso!', 'success');
        formState.limparCampos();
        modalState.resetModalState();
        setVisible(false);
        if (onSuccess) onSuccess();
      } else {
        modalState.mostrarAlert(result.message || 'Erro ao registrar serviço', 'danger');
      }
    } catch (error) {
      console.error('Erro ao registrar serviço:', error);
      modalState.mostrarAlert('Erro ao registrar serviço. Tente novamente.', 'danger');
    } finally {
      modalState.setIsSubmitting(false);
      if (setLoadingParent) setLoadingParent(false);
    }
  }, [modalState, formState, setLoadingParent, setVisible, onSuccess]);

  // Enhanced image upload with error handling
  const handleImageUpload = useCallback(async (event, servicoIndex) => {
    await formState.handleImageUpload(event, servicoIndex, modalState.mostrarAlert);
  }, [formState, modalState]);

  // Enhanced remove photo with feedback
  const handleRemoverFoto = useCallback((servicoIndex, fotoIndex) => {
    formState.removerFoto(servicoIndex, fotoIndex, modalState.mostrarAlert);
  }, [formState, modalState]);

  // Initialize modal when visible
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        formState.limparCampos();
        modalState.resetModalState();
        carregarTodosCentrosCusto();
        carregarTodosUsuarios();
        carregarTodosMunicipios();
        carregarTodasEquipes();
      }, 100);
    }
  }, [visible, formState, modalState, carregarTodosCentrosCusto, carregarTodosUsuarios, carregarTodosMunicipios, carregarTodasEquipes]);

  // Auto-hide field errors
  useEffect(() => {
    if (Object.keys(modalState.camposComErro).length > 0) {
      const timeout = setTimeout(() => {
        modalState.setCamposComErro({});
      }, HIDE_FIELD_ERROR_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [modalState.camposComErro, modalState]);

  // Memoized event handlers
  const eventHandlers = useMemo(() => ({
    onCentroCustoChange: handleCentroCustoChange,
    onOcorrenciaSemEnderecoChange: (e) => formState.setOcorrenciaSemEndereco(e.target.checked),
    onMunicipioSelect: () => {}, // Handled by component
    onEquipeSelect: () => {}, // Handled by component
    onUsuarioSelect: () => {}, // Handled by component
    onAdicionarUsuario: (usuarioInfo, isLider) => formState.adicionarUsuario(usuarioInfo, isLider),
    onRemoverUsuario: formState.removerUsuario,
    onAdicionarServico: formState.adicionarServico,
    onRemoverServico: formState.removerServico,
    onAtualizarServico: formState.atualizarServico,
    onImageUpload: handleImageUpload,
    onRemoverFoto: handleRemoverFoto,
    onLiderChange: formState.setIsLider
  }), [
    handleCentroCustoChange,
    formState,
    handleImageUpload,
    handleRemoverFoto
  ]);

  return (
    <>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
        backdrop="static"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>Registrar Serviço</CModalTitle>
        </CModalHeader>
        
        <CModalBody>
          {modalState.alertVisible && (
            <CAlert color={modalState.alertColor} className="mb-3">
              {modalState.alertMessage}
            </CAlert>
          )}

          <TabsContainer
            // Modal state
            camposComErro={modalState.camposComErro}
            
            // Form state
            usuarios={formState.usuarios}
            servicos={formState.servicos}
            isLider={formState.isLider}
            ocorrenciaSemEndereco={formState.ocorrenciaSemEndereco}
            centroCustoOpcoes={formState.centroCustoOpcoes}
            centroCustoSelecionado={formState.centroCustoSelecionado}
            loadingCentroCusto={formState.loadingCentroCusto}
            
            // Data
            todosUsuarios={todosUsuarios}
            todosServicos={todosServicos}
            todosMunicipios={todosMunicipios}
            equipesData={equipesData}
            
            // Event handlers
            {...eventHandlers}
            setUsuarioSelecionado={setUsuarioSelecionado}
            setUsuarioInfo={setUsuarioInfo}
          />
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setVisible(false)}
            disabled={modalState.isSubmitting}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={handleSubmit}
            disabled={modalState.isSubmitting}
          >
            {modalState.isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Registrando...
              </>
            ) : (
              'Registrar'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Confirmation Modal for Cost Center Change */}
      <CModal
        visible={modalState.modalConfirmacaoVisible}
        onClose={cancelarTrocaCentroCusto}
        size="md"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Confirmar Troca de Centro de Custo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex align-items-start">
            <div className="flex-shrink-0 me-3">
              <div 
                className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
              >
                <CIcon icon={cilWarning} size="lg" className="text-white" />
              </div>
            </div>
            <div>
              <h6 className="mb-2 text-warning">Atenção!</h6>
              <p className="mb-3">
                Você já possui <strong>{formState.servicos.length} serviço{formState.servicos.length > 1 ? 's' : ''}</strong> adicionado{formState.servicos.length > 1 ? 's' : ''}.
              </p>
              <p className="mb-0">
                Ao trocar o centro de custo, <strong>todos os serviços serão removidos</strong>.
              </p>
              <p className="mt-2 mb-0">
                <strong>Deseja continuar?</strong>
              </p>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            variant="outline"
            onClick={cancelarTrocaCentroCusto}
          >
            Cancelar
          </CButton>
          <CButton 
            color="warning"
            onClick={confirmarTrocaCentroCusto}
          >
            Sim, trocar centro de custo
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

ServicosModalRefactored.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  setLoadingParent: PropTypes.func,
  showAlertParent: PropTypes.func,
  onSuccess: PropTypes.func
};

ServicosModalRefactored.defaultProps = {
  setLoadingParent: null,
  showAlertParent: null,
  onSuccess: null
};

export default ServicosModalRefactored;