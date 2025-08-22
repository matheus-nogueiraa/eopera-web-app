import httpRequest from '../utils/httpRequests';

/**
 * Serviço para gerenciar operações relacionadas às ocorrências
 * Centraliza as chamadas à API para evitar múltiplas requisições simultâneas
 */
const ocorrenciasService = {
  /**
   * Busca todas as ocorrências no EoperaX
   * @returns {Promise<Array>} Lista de ocorrências formatada
   */
  async buscarOcorrencias() {
    try {
      const response = await httpRequest('/consultarOcorrenciasEoperaX', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Nenhum dado disponível');
      }
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
      throw error;
    }
  },

  /**
   * Busca os detalhes de uma ocorrência específica pelo ID
   * @param {string|number} idOcorrencia ID da ocorrência a ser consultada
   * @returns {Promise<Object>} Dados da ocorrência
   */
  async buscarOcorrenciaPorId(idOcorrencia) {
    if (!idOcorrencia) {
      throw new Error('ID da ocorrência é obrigatório');
    }

    try {
      const response = await httpRequest(`/consultarOcorrencia?idOcorrencia=${idOcorrencia}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Ocorrência não encontrada');
      }
    } catch (error) {
      console.error(`Erro ao buscar ocorrência ${idOcorrencia}:`, error);
      throw error;
    }
  },

  /**
   * Altera uma ocorrência existente
   * @param {Object} dadosOcorrencia Dados da ocorrência a ser alterada
   * @returns {Promise<Object>} Resultado da operação
   */
  async alterarOcorrencia(dadosOcorrencia) {
    if (!dadosOcorrencia || !dadosOcorrencia.idOcorrencia) {
      throw new Error('Dados da ocorrência são inválidos');
    }

    try {
      const response = await httpRequest('/alterarOcorrencia', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(dadosOcorrencia)
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Erro ao alterar ocorrência');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao alterar ocorrência:', error);
      throw error;
    }
  },

  /**
   * Inclui uma nova ocorrência
   * @param {Object} dadosOcorrencia Dados da nova ocorrência
   * @returns {Promise<Object>} Resultado da operação
   */
  async incluirOcorrencia(dadosOcorrencia) {
    if (!dadosOcorrencia) {
      throw new Error('Dados da ocorrência são inválidos');
    }

    try {
      const response = await httpRequest('/incluirOcorrencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(dadosOcorrencia)
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data.status === false) {
        throw new Error(result.msg || 'Erro ao incluir ocorrência');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao incluir ocorrência:', error);
      throw error;
    }
  },

  /**
   * Exclui uma ocorrência pelo ID
   * @param {string|number} idOcorrencia ID da ocorrência a ser excluída
   * @returns {Promise<Object>} Resultado da operação
   */
  async excluirOcorrencia(idOcorrencia) {
    if (!idOcorrencia) {
      throw new Error('ID da ocorrência é obrigatório');
    }

    try {
      const response = await httpRequest('/deletarOcorrencia', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ idOcorrencia })
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Erro ao excluir ocorrência');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao excluir ocorrência:', error);
      throw error;
    }
  }
};

export default ocorrenciasService;
