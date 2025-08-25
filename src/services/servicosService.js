import httpRequest from '../utils/httpRequests';

export const servicosService = {
  // Buscar todos os cadastros de serviços do Protheus (OBRIGATÓRIO: Centro de custo)
  async buscarServicos(centroCusto) {
    if (!centroCusto) {
      throw new Error('Centro de custo é obrigatório para buscar serviços');
    }

    try {
      const response = await httpRequest(`/consultaServicosProtheus?centroCusto=${centroCusto}`, {
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
      console.error('Erro no servicosService.buscarServicos:', error);
      throw error;
    }
  },

  // Buscar serviços com filtros (OBRIGATÓRIO: Centro de custo)
  async buscarServicosComFiltros(filtros = {}) {
    if (!filtros.centroCusto) {
      throw new Error('Centro de custo é obrigatório nos filtros');
    }

    try {
      let endpoint = '/consultaServicosProtheus';
      const queryParams = [];

      // Centro de custo é sempre obrigatório
      queryParams.push(`centroCusto=${filtros.centroCusto}`);
      
      // Se tiver idServico, adicionar como query param
      if (filtros.idServico) {
        queryParams.push(`idServico=${filtros.idServico}`);
      }

      endpoint += `?${queryParams.join('&')}`;

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
      console.error('Erro no servicosService.buscarServicosComFiltros:', error);
      throw error;
    }
  },

  async buscarServicoPorId(idServico, centroCusto) {
    if (!idServico || !centroCusto) {
      throw new Error('ID do serviço e centro de custo são obrigatórios');
    }

    try {
      const response = await httpRequest(`/consultaServicosProtheus?centroCusto=${centroCusto}&idServico=${idServico}`, {
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
        throw new Error(result.messsage || 'Serviço não encontrado');
      }
    } catch (error) {
      console.error('Erro no servicosService.buscarServicoPorId:', error);
      throw error;
    }
  },

  // Exportar dados para download
  async exportarServicos(formato = 'csv', filtros = {}) {
    try {
      // Buscar dados primeiro
      const servicos = await this.buscarServicosComFiltros(filtros);
      
      if (!servicos || servicos.length === 0) {
        throw new Error('Nenhum dado disponível para exportação');
      }

      // Se for CSV, criar o conteúdo
      if (formato === 'csv') {
        const csvContent = [
          ['ID Serviço', 'Sigla UP', 'Descrição UP', 'Código Serviço', 'Descrição Serviço', 'Centro Custo', 'Valor Pontos', 'Valor Grupo', 'Grupo Instalação', 'Código Unidade', 'Descrição Unidade'],
          ...servicos.map(servico => [
            servico.idServico?.trim() || '',
            servico.siglaUp?.trim() || '',
            servico.descricaoUp?.trim() || '',
            servico.codServico?.trim() || '',
            servico.descricaoServico?.trim() || '',
            servico.centroCusto?.trim() || '',
            servico.valorPontos || 0,
            servico.valorGrupo || 0,
            servico.grupoInstalacao?.trim() || '',
            servico.codUnidade?.trim() || '',
            servico.descricaoUnidade?.trim() || ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        return blob;
      }
      
      return servicos;
    } catch (error) {
      console.error('Erro no servicosService.exportarServicos:', error);
      throw error;
    }
  }
};

export default servicosService;

// Função para consultar serviços do Protheus (OBRIGATÓRIO: Centro de custo)
export const consultarServicosProtheus = async (params = {}) => {
  // VALIDAÇÃO OBRIGATÓRIA: Centro de custo deve estar presente
  if (!params.centroCusto) {
    throw new Error('Centro de custo é obrigatório para consultar serviços do Protheus');
  }

  try {
    let endpoint = '/consultaServicosProtheus';
    const queryParams = [];
    
    // Adicionar parâmetro centroCusto (OBRIGATÓRIO)
    queryParams.push(`centroCusto=${params.centroCusto}`);
    
    // Adicionar parâmetro idServico se fornecido
    if (params.idServico) {
      queryParams.push(`idServico=${params.idServico}`);
    }
    
    // Montar a URL com os parâmetros
    endpoint += `?${queryParams.join('&')}`;

    console.log(`🔄 Consultando serviços Protheus para centro de custo: ${params.centroCusto}`);

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
      console.log(`✅ Serviços carregados para centro de custo ${params.centroCusto}: ${result.data.length} itens`);
      return result.data;
    } else {
      throw new Error(result.messsage || 'Nenhum dado disponível');
    }
  } catch (error) {
    console.error(`❌ Erro ao consultar serviços do Protheus para centro de custo ${params.centroCusto}:`, error);
    throw error;
  }
};
