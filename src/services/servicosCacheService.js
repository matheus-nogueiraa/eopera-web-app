

import { consultarServicosProtheus } from './servicosService';
import centroCustoCacheService from './centroCustoCacheService';

class ServicosCacheService {
  constructor() {
    this.cachesPorCentroCusto = new Map(); // Cache organizado por centro de custo
    this.loadingStates = new Map(); // Estados de loading por centro de custo
    this.loadPromises = new Map(); // Promises de carregamento por centro de custo
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos em ms
  }

  /**
   * Carrega todos os serviços de um centro de custo específico
   * OBRIGATÓRIO: Centro de custo deve ser fornecido e validado
   */
  async carregarServicosPorCentroCusto(centroCusto, forceReload = false) {
    if (!centroCusto) {
      throw new Error('Centro de custo é obrigatório para carregar serviços');
    }

    const centroCustoKey = centroCusto.trim();

    // Validar se o centro de custo existe
    const centroCustoValido = await centroCustoCacheService.validarCentroCusto(centroCustoKey);
    if (!centroCustoValido) {
      throw new Error(`Centro de custo "${centroCustoKey}" não encontrado ou inativo`);
    }

    // Se já está carregando este centro de custo, retorna a promise em andamento
    if (this.loadingStates.get(centroCustoKey) && this.loadPromises.get(centroCustoKey)) {
      return this.loadPromises.get(centroCustoKey);
    }

    // Verifica se o cache ainda é válido para este centro de custo
    if (!forceReload && this.isCacheValidForCentroCusto(centroCustoKey)) {
      return this.cachesPorCentroCusto.get(centroCustoKey).servicos;
    }

    console.log(`🔄 Carregando serviços para centro de custo: ${centroCustoKey}`);
    this.loadingStates.set(centroCustoKey, true);

    // Cria uma promise para evitar múltiplas chamadas
    const loadPromise = this._executarCarregamentoPorCentroCusto(centroCustoKey);
    this.loadPromises.set(centroCustoKey, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingStates.set(centroCustoKey, false);
      this.loadPromises.delete(centroCustoKey);
    }
  }

  /**
   * Executa o carregamento efetivo dos dados por centro de custo
   */
  async _executarCarregamentoPorCentroCusto(centroCusto) {
    try {
      const dados = await consultarServicosProtheus({ centroCusto });
      
      if (Array.isArray(dados)) {
        const servicosProcessados = dados.map(servico => ({
          ...servico,
          // Normalizar campos para busca mais eficiente
          idServico: servico.idServico?.trim() || '',
          codServico: servico.codServico?.trim() || '',
          descricaoServico: servico.descricaoServico?.trim() || '',
          siglaUp: servico.siglaUp?.trim() || '',
          centroCusto: servico.centroCusto?.trim() || centroCusto,
          searchText: this._createSearchText(servico)
        }));
        
        // Armazenar no cache com timestamp
        this.cachesPorCentroCusto.set(centroCusto, {
          servicos: servicosProcessados,
          lastLoadTime: Date.now()
        });
        
        console.log(`✅ Cache carregado para centro de custo ${centroCusto} com ${servicosProcessados.length} serviços`);
        return servicosProcessados;
      } else {
        throw new Error('Resposta da API não é um array válido');
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar serviços para centro de custo ${centroCusto}:`, error);
      
      // Em caso de erro, manter cache anterior se existir
      const cacheExistente = this.cachesPorCentroCusto.get(centroCusto);
      if (cacheExistente && cacheExistente.servicos.length > 0) {
        console.warn(`⚠️ Mantendo cache anterior para centro de custo ${centroCusto} devido ao erro`);
        return cacheExistente.servicos;
      }
      
      throw error;
    }
  }

  /**
   * Cria texto de busca unificado para otimizar filtros
   */
  _createSearchText(servico) {
    return [
      servico.idServico,
      servico.codServico,
      servico.descricaoServico,
      servico.siglaUp
    ].filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Verifica se o cache ainda é válido para um centro de custo específico
   */
  isCacheValidForCentroCusto(centroCusto) {
    const cache = this.cachesPorCentroCusto.get(centroCusto);
    return cache && 
           cache.servicos.length > 0 && 
           cache.lastLoadTime && 
           (Date.now() - cache.lastLoadTime) < this.CACHE_DURATION;
  }

  /**
   * Busca um serviço por ID em um centro de custo específico
   * OBRIGATÓRIO: Centro de custo deve ser fornecido
   */
  async buscarServicoPorId(idServico, centroCusto) {
    if (!idServico || !centroCusto) {
      throw new Error('ID do serviço e centro de custo são obrigatórios');
    }

    // Garantir que o cache está carregado para este centro de custo
    await this.carregarServicosPorCentroCusto(centroCusto);

    const cache = this.cachesPorCentroCusto.get(centroCusto.trim());
    if (!cache) return null;

    // Busca local no cache
    const servicoEncontrado = cache.servicos.find(s => 
      s.idServico === idServico.trim() || 
      s.codServico === idServico.trim()
    );

    return servicoEncontrado || null;
  }

  /**
   * Busca múltiplos serviços por IDs em um centro de custo específico
   * OBRIGATÓRIO: Centro de custo deve ser fornecido
   */
  async buscarServicosPorIds(servicosArray, centroCusto) {
    if (!servicosArray || !Array.isArray(servicosArray) || !centroCusto) {
      console.warn('servicosArray ou centroCusto não fornecidos adequadamente');
      return [];
    }

    // Garantir que o cache está carregado para este centro de custo
    await this.carregarServicosPorCentroCusto(centroCusto);

    const cache = this.cachesPorCentroCusto.get(centroCusto.trim());
    if (!cache) return [];

    const servicosComNomes = servicosArray.map(servico => {
      // Se já tem o objeto completo, retorna direto
      if (servico.servicoSelecionado?.idServico) {
        return {
          ...servico,
          servicoNome: `${servico.servicoSelecionado.codServico?.trim() || servico.servicoSelecionado.idServico} - ${servico.servicoSelecionado.descricaoServico}`
        };
      }

      // Busca local no cache
      const servicoId = servico.servico || servico.idServico;
      const servicoEncontrado = cache.servicos.find(s => 
        s.idServico === servicoId || s.codServico === servicoId
      );

      if (servicoEncontrado) {
        return {
          ...servico,
          servicoNome: `${servicoEncontrado.codServico || servicoEncontrado.idServico} - ${servicoEncontrado.descricaoServico}`
        };
      }

      // Se não encontrou, retorna apenas o ID
      return {
        ...servico,
        servicoNome: servicoId || 'Serviço não identificado'
      };
    });

    return servicosComNomes;
  }

  /**
   * Filtra serviços localmente para autocomplete em um centro de custo específico
   * OBRIGATÓRIO: Centro de custo deve ser fornecido
   */
  async filtrarServicos(termo, centroCusto, limite = 20) {
    if (!centroCusto) {
      throw new Error('Centro de custo é obrigatório para filtrar serviços');
    }

    if (!termo || termo.length < 2) return [];

    // Garantir que o cache está carregado para este centro de custo
    await this.carregarServicosPorCentroCusto(centroCusto);

    const cache = this.cachesPorCentroCusto.get(centroCusto.trim());
    if (!cache) return [];

    const termoLower = termo.toLowerCase().trim();

    return cache.servicos.filter(servico => 
      servico.searchText.includes(termoLower)
    ).slice(0, limite);
  }

  /**
   * Obtém todos os serviços de um centro de custo específico
   * OBRIGATÓRIO: Centro de custo deve ser fornecido
   */
  async obterServicosPorCentroCusto(centroCusto) {
    if (!centroCusto) {
      throw new Error('Centro de custo é obrigatório');
    }

    await this.carregarServicosPorCentroCusto(centroCusto);
    
    const cache = this.cachesPorCentroCusto.get(centroCusto.trim());
    return cache ? cache.servicos : [];
  }

  /**
   * Força o recarregamento do cache para um centro de custo específico
   */
  async recarregarCacheCentroCusto(centroCusto) {
    if (!centroCusto) {
      throw new Error('Centro de custo é obrigatório para recarregar cache');
    }

    console.log(`🔄 Forçando recarregamento do cache para centro de custo: ${centroCusto}`);
    return this.carregarServicosPorCentroCusto(centroCusto, true);
  }

  /**
   * Limpa o cache de um centro de custo específico
   */
  limparCacheCentroCusto(centroCusto) {
    if (!centroCusto) return;

    this.cachesPorCentroCusto.delete(centroCusto.trim());
    this.loadingStates.delete(centroCusto.trim());
    this.loadPromises.delete(centroCusto.trim());
    console.log(`�️ Cache limpo para centro de custo: ${centroCusto}`);
  }

  /**
   * Limpa todo o cache
   */
  limparTodoCache() {
    this.cachesPorCentroCusto.clear();
    this.loadingStates.clear();
    this.loadPromises.clear();
    console.log('🗑️ Todo o cache de serviços foi limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const stats = {
      totalCentrosCusto: this.cachesPorCentroCusto.size,
      cachesPorCentroCusto: {},
      centrosCustoCarregando: []
    };

    // Estatísticas por centro de custo
    for (const [centroCusto, cache] of this.cachesPorCentroCusto) {
      stats.cachesPorCentroCusto[centroCusto] = {
        totalServicos: cache.servicos.length,
        isCacheValid: this.isCacheValidForCentroCusto(centroCusto),
        lastLoadTime: cache.lastLoadTime,
        cacheAge: cache.lastLoadTime ? Date.now() - cache.lastLoadTime : null
      };
    }

    // Centros de custo sendo carregados
    for (const [centroCusto, isLoading] of this.loadingStates) {
      if (isLoading) {
        stats.centrosCustoCarregando.push(centroCusto);
      }
    }

    return stats;
  }

  /**
   * Obtém lista de centros de custo disponíveis
   */
  async obterCentrosCustoDisponiveis() {
    return await centroCustoCacheService.obterTodosCentrosCusto();
  }

  /**
   * Filtra centros de custo para autocomplete
   */
  async filtrarCentrosCusto(termo, limite = 20) {
    return await centroCustoCacheService.filtrarCentrosCusto(termo, limite);
  }

  /**
   * Valida se um centro de custo existe e está ativo
   */
  async validarCentroCusto(centroCusto) {
    return await centroCustoCacheService.validarCentroCusto(centroCusto);
  }

  /**
   * Obtém descrição de um centro de custo
   */
  async obterDescricaoCentroCusto(centroCusto) {
    return await centroCustoCacheService.obterDescricaoCentroCusto(centroCusto);
  }

  /**
   * Pré-carrega cache para centros de custo mais utilizados
   */
  async preCarregarCachesComunsAsync(centrosCustoComuns = []) {
    if (!Array.isArray(centrosCustoComuns) || centrosCustoComuns.length === 0) return;

    console.log(`🚀 Pré-carregando caches para ${centrosCustoComuns.length} centros de custo...`);

    // Carregar em paralelo (sem await para não bloquear)
    centrosCustoComuns.forEach(centroCusto => {
      this.carregarServicosPorCentroCusto(centroCusto).catch(error => {
        console.warn(`Erro ao pré-carregar cache para centro de custo ${centroCusto}:`, error);
      });
    });
  }

  /**
   * Método legado - DEPRECATED
   * Use carregarServicosPorCentroCusto() em vez disso
   */
  async carregarTodosServicos(forceReload = false) {
    console.warn('⚠️ DEPRECATED: carregarTodosServicos() foi descontinuado. Use carregarServicosPorCentroCusto() com um centro de custo específico.');
    throw new Error('Método descontinuado. Centro de custo é obrigatório para carregar serviços.');
  }

  /**
   * Método legado - DEPRECATED  
   * Use obterServicosPorCentroCusto() em vez disso
   */
  async obterTodosServicos() {
    console.warn('⚠️ DEPRECATED: obterTodosServicos() foi descontinuado. Use obterServicosPorCentroCusto() com um centro de custo específico.');
    throw new Error('Método descontinuado. Centro de custo é obrigatório para obter serviços.');
  }

  /**
   * Método legado - DEPRECATED
   * Use recarregarCacheCentroCusto() em vez disso
   */
  async recarregarCache() {
    console.warn('⚠️ DEPRECATED: recarregarCache() foi descontinuado. Use recarregarCacheCentroCusto() com um centro de custo específico.');
    throw new Error('Método descontinuado. Centro de custo é obrigatório para recarregar cache.');
  }

  /**
   * Método legado - DEPRECATED
   * Use limparCacheCentroCusto() ou limparTodoCache() em vez disso
   */
  limparCache() {
    console.warn('⚠️ DEPRECATED: limparCache() foi descontinuado. Use limparCacheCentroCusto() ou limparTodoCache().');
    this.limparTodoCache();
  }
}

// Instância singleton para uso global
const servicosCacheService = new ServicosCacheService();

export default servicosCacheService;

// Exports para compatibilidade
export { ServicosCacheService };
