import httpRequest from '../utils/httpRequests';

export const equipesService = {
  // Buscar todas as equipes
  async buscarEquipes() {
    try {
      const response = await httpRequest('/consultarEquipes', {
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
        throw new Error(result.messsage || 'Nenhum dado disponível');
      }
    } catch (error) {
      console.error('Erro no equipesService.buscarEquipes:', error);
      throw error;
    }
  },

  // Buscar equipes com filtros
  async buscarEquipesComFiltros(filtros = {}) {
    try {
      let endpoint = '/consultarEquipes';
      const queryParams = [];
      
      // Adicionar parâmetros de query se fornecidos
      if (filtros.retornaInativos !== undefined) {
        queryParams.push(`retornaInativos=${filtros.retornaInativos}`);
      }
      
      if (filtros.numOperacional) {
        queryParams.push(`numOperacional=${filtros.numOperacional}`);
      }
      
      if (filtros.numCCusto) {
        queryParams.push(`numCCusto=${filtros.numCCusto}`);
      }
      
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }

      const response = await httpRequest(endpoint, {
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
        throw new Error(result.messsage || 'Nenhum dado disponível');
      }
    } catch (error) {
      console.error('Erro no equipesService.buscarEquipesComFiltros:', error);
      throw error;
    }
  },

  // Buscar equipe por número operacional específico
  async buscarEquipePorNumero(numOperacional) {
    try {
      const response = await httpRequest(`/consultarEquipes?numOperacional=${numOperacional}`, {
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
      
      if (result.status && result.data && result.data.length > 0) {
        return result.data[0]; // Retorna o primeiro (e único) resultado
      } else {
        throw new Error(result.messsage || 'Equipe não encontrada');
      }
    } catch (error) {
      console.error('Erro no equipesService.buscarEquipePorNumero:', error);
      throw error;
    }
  }
};

export default equipesService;

// Função para consultar equipes (compatibilidade)
export const consultarEquipes = async (params = {}) => {
  try {
    let endpoint = '/consultarEquipes';
    const queryParams = [];
    
    // Adicionar parâmetros de query se fornecidos
    if (params.retornaInativos !== undefined) {
      queryParams.push(`retornaInativos=${params.retornaInativos}`);
    }
    
    if (params.numOperacional) {
      queryParams.push(`numOperacional=${params.numOperacional}`);
    }
    
    if (params.numCCusto) {
      queryParams.push(`numCCusto=${params.numCCusto}`);
    }
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

    const response = await httpRequest(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status && result.data) {
      return result.data;
    } else {
      throw new Error(result.messsage || 'Nenhum dado disponível');
    }
  } catch (error) {
    console.error('Erro ao consultar equipes:', error);
    throw error;
  }
};
