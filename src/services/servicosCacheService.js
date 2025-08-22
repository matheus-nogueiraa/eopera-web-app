/**
 * Serviço de Cache Global para Serviços Protheus
 * 
 * Este serviço implementa um cache inteligente para evitar múltiplas
 * requisições à API de serviços, otimizando drasticamente a performance.
 * 
 * Funcionalidades:
 * - Cache global de todos os serviços
 * - Busca local por ID, código ou descrição
 * - Refresh automático em caso de erro
 * - Gerenciamento de estado de loading
 */

import { consultarServicosProtheus } from './servicosService';

class ServicosCacheService {
  constructor() {
    this.servicos = []; // Cache global de serviços
    this.isLoading = false;
    this.lastLoadTime = null;
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos em ms
    this.loadPromise = null; // Para evitar múltiplas chamadas simultâneas
  }

  /**
   * Carrega todos os serviços uma única vez e mantém em cache
   */
  async carregarTodosServicos(forceReload = false) {
    // Se já está carregando, retorna a promise em andamento
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Verifica se o cache ainda é válido
    if (!forceReload && this.isCacheValid()) {
      return this.servicos;
    }

    console.log('🔄 Carregando todos os serviços do Protheus...');
    this.isLoading = true;

    // Cria uma promise para evitar múltiplas chamadas
    this.loadPromise = this._executarCarregamento();

    try {
      const result = await this.loadPromise;
      return result;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Executa o carregamento efetivo dos dados
   */
  async _executarCarregamento() {
    try {
      const dados = await consultarServicosProtheus();
      
      if (Array.isArray(dados)) {
        this.servicos = dados.map(servico => ({
          ...servico,
          // Normalizar campos para busca mais eficiente
          idServico: servico.idServico?.trim() || '',
          codServico: servico.codServico?.trim() || '',
          descricaoServico: servico.descricaoServico?.trim() || '',
          siglaUp: servico.siglaUp?.trim() || '',
          searchText: this._createSearchText(servico)
        }));
        
        this.lastLoadTime = Date.now();
        console.log(`✅ Cache carregado com ${this.servicos.length} serviços`);
        return this.servicos;
      } else {
        throw new Error('Resposta da API não é um array válido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error);
      // Em caso de erro, manter cache anterior se existir
      if (this.servicos.length === 0) {
        throw error;
      }
      console.warn('⚠️ Mantendo cache anterior devido ao erro');
      return this.servicos;
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
   * Verifica se o cache ainda é válido
   */
  isCacheValid() {
    return this.servicos.length > 0 && 
           this.lastLoadTime && 
           (Date.now() - this.lastLoadTime) < this.CACHE_DURATION;
  }

  /**
   * Busca um serviço por ID (muito mais rápido que API)
   */
  async buscarServicoPorId(idServico) {
    if (!idServico) return null;

    // Garantir que o cache está carregado
    await this.carregarTodosServicos();

    // Busca local no cache
    const servicoEncontrado = this.servicos.find(s => 
      s.idServico === idServico.trim() || 
      s.codServico === idServico.trim()
    );

    return servicoEncontrado || null;
  }

  /**
   * Busca múltiplos serviços por IDs (OTIMIZADO!)
   */
  async buscarServicosPorIds(servicosArray) {
    if (!servicosArray || !Array.isArray(servicosArray)) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosServicos();

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
      const servicoEncontrado = this.servicos.find(s => 
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
   * Filtra serviços localmente para autocomplete
   */
  async filtrarServicos(termo, limite = 20) {
    if (!termo || termo.length < 2) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosServicos();

    const termoLower = termo.toLowerCase().trim();

    return this.servicos.filter(servico => 
      servico.searchText.includes(termoLower)
    ).slice(0, limite);
  }

  /**
   * Filtra serviços por centro de custo
   */
  async filtrarPorCentroCusto(centroCusto, termo = '', limite = 20) {
    if (!centroCusto) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosServicos();

    let servicosFiltrados = this.servicos.filter(servico => 
      servico.centroCusto?.trim() === centroCusto.trim()
    );

    // Se tem termo de busca, aplicar filtro adicional
    if (termo && termo.length >= 2) {
      const termoLower = termo.toLowerCase().trim();
      servicosFiltrados = servicosFiltrados.filter(servico => 
        servico.searchText.includes(termoLower)
      );
    }

    return servicosFiltrados.slice(0, limite);
  }

  /**
   * Obtém todos os serviços do cache
   */
  async obterTodosServicos() {
    await this.carregarTodosServicos();
    return this.servicos;
  }

  /**
   * Força o recarregamento do cache
   */
  async recarregarCache() {
    console.log('🔄 Forçando recarregamento do cache...');
    return this.carregarTodosServicos(true);
  }

  /**
   * Limpa o cache
   */
  limparCache() {
    this.servicos = [];
    this.lastLoadTime = null;
    this.isLoading = false;
    this.loadPromise = null;
    console.log('🗑️ Cache de serviços limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      totalServicos: this.servicos.length,
      isLoading: this.isLoading,
      isCacheValid: this.isCacheValid(),
      lastLoadTime: this.lastLoadTime,
      cacheAge: this.lastLoadTime ? Date.now() - this.lastLoadTime : null
    };
  }
}

// Instância singleton para uso global
const servicosCacheService = new ServicosCacheService();

export default servicosCacheService;

// Exports para compatibilidade
export { ServicosCacheService };
