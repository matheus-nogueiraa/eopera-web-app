// Custom hook for form state management

import { useState, useCallback } from 'react';
import { convertFilesToBase64 } from '../utils/formatters';

/**
 * Custom hook to manage form state for ServicosModal
 * @returns {Object} Form state and functions
 */
export const useFormularioServicos = () => {
  // Main form states
  const [usuarios, setUsuarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [isLider, setIsLider] = useState(false);
  const [ocorrenciaSemEndereco, setOcorrenciaSemEndereco] = useState(false);

  // Cost center states
  const [centroCustoOpcoes, setCentroCustoOpcoes] = useState([]);
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState('');
  const [loadingCentroCusto, setLoadingCentroCusto] = useState(false);

  /**
   * Add user to the list
   * @param {Object} usuarioInfo - User information
   * @param {boolean} isLider - Whether user is a leader
   */
  const adicionarUsuario = useCallback((usuarioInfo, isLider) => {
    if (usuarioInfo.nome && usuarioInfo.matricula) {
      setUsuarios(prev => [...prev, {
        nome: usuarioInfo.nome,
        matricula: usuarioInfo.matricula,
        cpf: usuarioInfo.cpf,
        lider: isLider
      }]);
      return true;
    }
    return false;
  }, []);

  /**
   * Remove user from the list
   * @param {number} index - User index
   */
  const removerUsuario = useCallback((index) => {
    setUsuarios(prev => {
      const novosUsuarios = [...prev];
      novosUsuarios.splice(index, 1);
      return novosUsuarios;
    });
  }, []);

  /**
   * Add service to the list
   */
  const adicionarServico = useCallback(() => {
    setServicos(prev => [...prev, {
      servico: '',
      observacao: '',
      valorGrupo: '',
      valorServico: '',
      quantidade: '',
      servicoSelecionado: null,
      fotos: []
    }]);
  }, []);

  /**
   * Remove service from the list
   * @param {number} index - Service index
   */
  const removerServico = useCallback((index) => {
    setServicos(prev => {
      const novosServicos = [...prev];
      novosServicos.splice(index, 1);
      return novosServicos;
    });
  }, []);

  /**
   * Update service field
   * @param {number} index - Service index
   * @param {string} campo - Field name
   * @param {any} valor - Field value
   */
  const atualizarServico = useCallback((index, campo, valor) => {
    setServicos(prev => {
      const novosServicos = [...prev];
      novosServicos[index][campo] = valor;
      return novosServicos;
    });
  }, []);

  /**
   * Handle image upload for service
   * @param {Event} event - File input event
   * @param {number} servicoIndex - Service index
   * @param {Function} mostrarAlert - Alert function
   */
  const handleImageUpload = useCallback(async (event, servicoIndex, mostrarAlert) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const novasFotos = await convertFilesToBase64(files);
      
      setServicos(prev => {
        const novosServicos = [...prev];
        if (!novosServicos[servicoIndex].fotos) {
          novosServicos[servicoIndex].fotos = [];
        }
        novosServicos[servicoIndex].fotos = [...novosServicos[servicoIndex].fotos, ...novasFotos];
        return novosServicos;
      });

      mostrarAlert(
        `${novasFotos.length} foto${novasFotos.length > 1 ? 's' : ''} adicionada${novasFotos.length > 1 ? 's' : ''} com sucesso!`,
        'success'
      );
    } catch (error) {
      console.error('Erro ao converter imagens:', error);
      mostrarAlert('Erro ao processar as imagens. Tente novamente.', 'danger');
    }

    // Clear input to allow selecting same files again
    event.target.value = '';
  }, []);

  /**
   * Remove photo from service
   * @param {number} servicoIndex - Service index
   * @param {number} fotoIndex - Photo index
   * @param {Function} mostrarAlert - Alert function
   */
  const removerFoto = useCallback((servicoIndex, fotoIndex, mostrarAlert) => {
    setServicos(prev => {
      const novosServicos = [...prev];
      novosServicos[servicoIndex].fotos.splice(fotoIndex, 1);
      return novosServicos;
    });
    mostrarAlert('Foto removida com sucesso!', 'success');
  }, []);

  /**
   * Clear all form fields
   */
  const limparCampos = useCallback(() => {
    // Clear form inputs directly
    const inputs = [
      'numeroOS', 'unConsumidora', 'data', 'hora', 'endereco', 'bairro',
      'municipio', 'cep', 'latitude', 'longitude', 'dataConclusao',
      'horaConclusao', 'numeroOperacional'
    ];

    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = '';
      }
    });

    // Reset status select
    const statusSelect = document.getElementById('status');
    if (statusSelect) {
      statusSelect.selectedIndex = 0;
    }

    // Reset React states
    setUsuarios([]);
    setServicos([]);
    setIsLider(false);
    setOcorrenciaSemEndereco(false);
    setCentroCustoSelecionado('');
  }, []);

  /**
   * Get form data for submission
   */
  const getFormData = useCallback(() => {
    // Get values from DOM inputs
    const getFieldValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value.trim() : '';
    };

    return {
      numeroOs: getFieldValue('numeroOS'),
      unidadeConsumidora: getFieldValue('unConsumidora'),
      status: getFieldValue('status'),
      data: getFieldValue('data'),
      hora: getFieldValue('hora'),
      endereco: getFieldValue('endereco'),
      bairro: getFieldValue('bairro'),
      municipio: getFieldValue('municipio'),
      cep: getFieldValue('cep'),
      latitude: getFieldValue('latitude'),
      longitude: getFieldValue('longitude'),
      dataConclusao: getFieldValue('dataConclusao'),
      horaConclusao: getFieldValue('horaConclusao'),
      numeroOperacional: getFieldValue('numeroOperacional'),
      centroCusto: centroCustoSelecionado,
      usuarios,
      servicos,
      ocorrenciaSemEndereco
    };
  }, [usuarios, servicos, ocorrenciaSemEndereco, centroCustoSelecionado]);

  return {
    // States
    usuarios,
    servicos,
    isLider,
    ocorrenciaSemEndereco,
    centroCustoOpcoes,
    centroCustoSelecionado,
    loadingCentroCusto,

    // Setters
    setUsuarios,
    setServicos,
    setIsLider,
    setOcorrenciaSemEndereco,
    setCentroCustoOpcoes,
    setCentroCustoSelecionado,
    setLoadingCentroCusto,

    // Functions
    adicionarUsuario,
    removerUsuario,
    adicionarServico,
    removerServico,
    atualizarServico,
    handleImageUpload,
    removerFoto,
    limparCampos,
    getFormData
  };
};