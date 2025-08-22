// Serviço centralizado de cache para municípios IBGE
// Baseado no servicosCacheService.js para consistência

import httpRequest from '../utils/httpRequests';

class MunicipiosCacheService {
  constructor() {
    this.municipios = [];
    this.lastLoadTime = null;
    this.isLoading = false;
    this.loadPromise = null;
    // Cache válido por 4 horas (municípios não mudam frequentemente)
    this.cacheExpirationTime = 4 * 60 * 60 * 1000; // 4 horas em millisegundos
  }

  /**
   * Carrega todos os municípios uma única vez e mantém em cache
   */
  async carregarTodosMunicipios(forceReload = false) {
    // Se já está carregando, retorna a promise em andamento
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Verifica se o cache ainda é válido
    if (!forceReload && this.isCacheValid()) {
      return this.municipios;
    }

    console.log('🔄 Carregando todos os municípios IBGE...');
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
        this.municipios = result.data.map(municipio => ({
          ...municipio,
          // Normalizar campos para busca mais eficiente
          codigo: municipio.codigo?.trim() || '',
          descricao: municipio.descricao?.trim() || '',
          estado: municipio.estado?.trim() || '',
          searchText: this._createSearchText(municipio)
        }));
        
        this.lastLoadTime = Date.now();
        console.log(`✅ Cache de municípios carregado com ${this.municipios.length} municípios`);
        return this.municipios;
      } else {
        throw new Error('Resposta da API não é um array válido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar municípios:', error);
      // Em caso de erro, manter cache anterior se existir
      if (this.municipios.length === 0) {
        throw error;
      }
      console.warn('⚠️ Mantendo cache anterior devido ao erro');
      return this.municipios;
    }
  }

  /**
   * Cria texto de busca unificado para otimizar filtros
   */
  _createSearchText(municipio) {
    const parts = [
      municipio.codigo || '',
      municipio.descricao || '',
      municipio.estado || ''
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Verifica se o cache ainda é válido
   */
  isCacheValid() {
    if (!this.lastLoadTime || this.municipios.length === 0) {
      return false;
    }
    
    const timeElapsed = Date.now() - this.lastLoadTime;
    return timeElapsed < this.cacheExpirationTime;
  }

  /**
   * Busca um município por código (muito mais rápido que API)
   */
  async buscarMunicipioPorCodigo(codigo) {
    if (!codigo) return null;

    // Garantir que o cache está carregado
    await this.carregarTodosMunicipios();

    // Busca local no cache
    const municipioEncontrado = this.municipios.find(m => 
      m.codigo === codigo.trim()
    );

    return municipioEncontrado || null;
  }

  /**
   * Filtra municípios localmente para autocomplete
   */
  async filtrarMunicipios(termo, limite = 20) {
    if (!termo || termo.length < 2) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosMunicipios();

    const termoLower = termo.toLowerCase().trim();

    return this.municipios.filter(municipio => 
      municipio.searchText.includes(termoLower)
    ).slice(0, limite);
  }

  /**
   * Filtra municípios por estado
   */
  async filtrarPorEstado(estado, termo = '', limite = 20) {
    if (!estado) return [];

    // Garantir que o cache está carregado
    await this.carregarTodosMunicipios();

    let municipiosFiltrados = this.municipios.filter(municipio => 
      municipio.estado?.trim() === estado.trim()
    );

    // Se tem termo de busca, aplicar filtro adicional
    if (termo && termo.length >= 2) {
      const termoLower = termo.toLowerCase().trim();
      municipiosFiltrados = municipiosFiltrados.filter(municipio => 
        municipio.searchText.includes(termoLower)
      );
    }

    return municipiosFiltrados.slice(0, limite);
  }

  /**
   * Obtém todos os municípios do cache
   */
  async obterTodosMunicipios() {
    await this.carregarTodosMunicipios();
    return this.municipios;
  }

  /**
   * Força o recarregamento do cache
   */
  async recarregarCache() {
    console.log('🔄 Forçando recarregamento do cache de municípios...');
    return this.carregarTodosMunicipios(true);
  }

  /**
   * Limpa o cache
   */
  limparCache() {
    this.municipios = [];
    this.lastLoadTime = null;
    this.isLoading = false;
    this.loadPromise = null;
    console.log('🗑️ Cache de municípios limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      totalMunicipios: this.municipios.length,
      isLoading: this.isLoading,
      isCacheValid: this.isCacheValid(),
      lastLoadTime: this.lastLoadTime,
      cacheAge: this.lastLoadTime ? Date.now() - this.lastLoadTime : null
    };
  }

  /**
   * Formata município para exibição
   */
  formatarMunicipio(municipio) {
    if (!municipio) return '';
    return `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
  }

  /**
   * Busca municípios por termo usando cache (compatível com API anterior)
   */
  async buscarMunicipiosPorTermo(termo) {
    return this.filtrarMunicipios(termo);
  }
}

// Exporta uma instância única (singleton)
const municipiosCacheService = new MunicipiosCacheService();
export default municipiosCacheService;
