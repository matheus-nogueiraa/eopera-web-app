import { consultarCentroCusto } from './centroCustoService';

class CentroCustoCacheService {
  constructor() {
    this.centrosCusto = []; // Cache global de centros de custo
    this.isLoading = false;
    this.lastLoadTime = null;
    this.CACHE_DURATION = 60 * 60 * 1000; // 60 minutos em ms (centros de custo mudam pouco)
    this.loadPromise = null; // Para evitar múltiplas chamadas simultâneas
  }

  /**
   * Carrega todos os centros de custo ativos e mantém em cache
   */
  async carregarTodosCentrosCusto(forceReload = false) {
    // Se já está carregando, retorna a promise em andamento
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Verifica se o cache ainda é válido
    if (!forceReload && this.isCacheValid()) {
      return this.centrosCusto;
    }

    console.log('🔄 Carregando todos os centros de custo...');
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
      // Buscar apenas centros de custo ativos
      const response = await consultarCentroCusto({ retornaInativos: 'N' });
      
      if (response.status && Array.isArray(response.data)) {
        this.centrosCusto = response.data.map(centro => ({
          ...centro,
          // Normalizar campos para busca mais eficiente
          centroCusto: centro.centroCusto?.trim() || '',
          descricaoCCusto: centro.descricaoCCusto?.trim() || '',
          codProjeto: centro.codProjeto?.trim() || '',
          descricaoProjeto: centro.descricaoProjeto?.trim() || '',
          searchText: this._createSearchText(centro)
        }));
        
        this.lastLoadTime = Date.now();
        console.log(`✅ Cache de centros de custo carregado com ${this.centrosCusto.length} itens`);
        return this.centrosCusto;
      } else {
        throw new Error('Resposta da API não contém dados válidos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar centros de custo:', error);
      // Em caso de erro, manter cache anterior se existir
      if (this.centrosCusto.length === 0) {
        throw error;
      }
      console.warn('⚠️ Mantendo cache anterior devido ao erro');
      return this.centrosCusto;
    }
  }

  /**
   * Cria texto de busca unificado para otimizar filtros
   */
  _createSearchText(centro) {
    return [
      centro.centroCusto,
      centro.descricaoCCusto,
      centro.codProjeto,
      centro.descricaoProjeto
    ].filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Verifica se o cache ainda é válido
   */
  isCacheValid() {
    return this.centrosCusto.length > 0 && 
           this.lastLoadTime && 
           (Date.now() - this.lastLoadTime) < this.CACHE_DURATION;
  }

  /**
   * Busca um centro de custo por código
   */
  async buscarCentroCustoPorCodigo(codigo) {
    if (!codigo) return null;

    // Garantir que o cache está carregado
    await this.carregarTodosCentrosCusto();

    // Busca local no cache
    const centroEncontrado = this.centrosCusto.find(centro => 
      centro.centroCusto === codigo.trim()
    );

    return centroEncontrado || null;
  }

  /**
   * Filtra centros de custo localmente para autocomplete
   */
  async filtrarCentrosCusto(termo, limite = 20) {
    if (!termo || termo.length < 2) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosCentrosCusto();

    const termoLower = termo.toLowerCase().trim();

    return this.centrosCusto.filter(centro => 
      centro.searchText.includes(termoLower)
    ).slice(0, limite);
  }

  /**
   * Obtém todos os centros de custo do cache
   */
  async obterTodosCentrosCusto() {
    await this.carregarTodosCentrosCusto();
    return this.centrosCusto;
  }

  /**
   * Força o recarregamento do cache
   */
  async recarregarCache() {
    console.log('🔄 Forçando recarregamento do cache de centros de custo...');
    return this.carregarTodosCentrosCusto(true);
  }

  /**
   * Limpa o cache
   */
  limparCache() {
    this.centrosCusto = [];
    this.lastLoadTime = null;
    this.isLoading = false;
    this.loadPromise = null;
    console.log('🗑️ Cache de centros de custo limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      totalCentrosCusto: this.centrosCusto.length,
      isLoading: this.isLoading,
      isCacheValid: this.isCacheValid(),
      lastLoadTime: this.lastLoadTime,
      cacheAge: this.lastLoadTime ? Date.now() - this.lastLoadTime : null
    };
  }

  /**
   * Valida se um centro de custo existe
   */
  async validarCentroCusto(codigo) {
    const centro = await this.buscarCentroCustoPorCodigo(codigo);
    return !!centro;
  }

  /**
   * Obtém descrição de um centro de custo
   */
  async obterDescricaoCentroCusto(codigo) {
    const centro = await this.buscarCentroCustoPorCodigo(codigo);
    return centro ? centro.descricaoCCusto : null;
  }
}

// Instância singleton para uso global
const centroCustoCacheService = new CentroCustoCacheService();

export default centroCustoCacheService;

// Exports para compatibilidade
export { CentroCustoCacheService };
