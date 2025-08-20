import httpRequest from '../utils/httpRequests';

/**
 * Serviço para gerenciar operações relacionadas aos municípios
 * Centraliza as chamadas à API para evitar múltiplas requisições simultâneas
 */
const municipiosService = {
  /**
   * Busca todos os municípios do IBGE
   * @returns {Promise<Array>} Lista de municípios
   */
  async buscarTodosMunicipios() {
    try {
      const response = await httpRequest('/consultarMunicipiosIBGE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && Array.isArray(result.data)) {
        return result.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      return [];
    }
  },

  /**
   * Busca municípios por termo de pesquisa
   * @param {string} termo Texto para filtrar municípios
   * @returns {Promise<Array>} Lista de municípios filtrada
   */
  async buscarMunicipiosPorTermo(termo) {
    if (!termo || termo.length < 2) return [];
    
    try {
      const todos = await this.buscarTodosMunicipios();
      const termoLower = termo.toLowerCase().trim();
      
      return todos.filter(municipio => 
        municipio.codigo?.toLowerCase().includes(termoLower) ||
        municipio.descricao?.toLowerCase().includes(termoLower)
      ).slice(0, 20); // Limitando a 20 resultados para melhor performance
    } catch (error) {
      console.error('Erro ao filtrar municípios:', error);
      return [];
    }
  },

  /**
   * Busca um município específico pelo código
   * @param {string} codigo Código do município
   * @returns {Promise<Object|null>} Município encontrado ou null
   */
  async buscarMunicipioPorCodigo(codigo) {
    if (!codigo) return null;
    
    try {
      const todos = await this.buscarTodosMunicipios();
      return todos.find(m => m.codigo === codigo) || null;
    } catch (error) {
      console.error('Erro ao buscar município por código:', error);
      return null;
    }
  }
};

export default municipiosService;
