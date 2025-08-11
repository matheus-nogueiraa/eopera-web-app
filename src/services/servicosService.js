export const servicosService = {
  // Buscar todas as ordens de serviço
  async buscarServicos() {
    try {
      const response = await fetch(`/api/servicos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.buscarServicos:', error);
      throw error;
    }
  },

  // Buscar serviços com paginação e filtros
  async buscarServicosComFiltros(page = 1, limit = 10, filtros = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filtros
      });

      const response = await fetch(`${API_BASE_URL}/api/servicos?${queryParams}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.buscarServicosComFiltros:', error);
      throw error;
    }
  },

  // Criar nova ordem de serviço
  async criarServico(dadosServico) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosServico),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar serviço');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.criarServico:', error);
      throw error;
    }
  },

  // Atualizar ordem de serviço
  async atualizarServico(id, dadosServico) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosServico),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar serviço');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.atualizarServico:', error);
      throw error;
    }
  },

  // Excluir ordem de serviço
  async excluirServico(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir serviço');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.excluirServico:', error);
      throw error;
    }
  },

  // Buscar serviço por ID
  async buscarServicoPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicos/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar serviço');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.buscarServicoPorId:', error);
      throw error;
    }
  },

  // Atualizar status do serviço
  async atualizarStatusServico(id, novoStatus) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do serviço');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.atualizarStatusServico:', error);
      throw error;
    }
  },

  // Exportar dados para download
  async exportarServicos(formato = 'csv', filtros = {}) {
    try {
      const queryParams = new URLSearchParams({
        formato,
        ...filtros
      });

      const response = await fetch(`${API_BASE_URL}/api/servicos/exportar?${queryParams}`);
      if (!response.ok) {
        throw new Error('Erro ao exportar serviços');
      }

      // Se for um arquivo, retorna o blob
      if (response.headers.get('content-type')?.includes('application/')) {
        return await response.blob();
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro no servicosService.exportarServicos:', error);
      throw error;
    }
  }
};

export default servicosService;

// Função para consultar serviços do Protheus (autocomplete)
export const consultarServicosProtheus = async (params = {}) => {
  try {
    const url = new URL('/api/consultaServicosProtheus', window.location.origin);
    
    // Adicionar parâmetros de query se fornecidos
    if (params.idServico) {
      url.searchParams.append('idServico', params.idServico);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao consultar serviços do Protheus:', error);
    throw error;
  }
};
