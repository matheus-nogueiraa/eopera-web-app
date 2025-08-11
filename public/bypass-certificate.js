/**
 * bypass-certificate.js
 * Script avançado para contornar erros de certificado SSL
 * Especialmente para chamadas diretas para IPs com certificados inválidos
 */

(() => {
  console.log('🔒 Inicializando interceptador avançado de certificados...');

  // Guardar referência ao fetch original
  const originalFetch = window.fetch;

  // Adicionar configurações otimizadas para contornar problemas de certificado
  const enhanceOptions = (options = {}) => {
    // Configurações base melhoradas
    const enhancedOptions = {
      ...options,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    };

    // Melhorar os headers
    enhancedOptions.headers = {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'Access-Control-Allow-Origin': '*',
      'Pragma': 'no-cache'
    };

    return enhancedOptions;
  };

  // Função para realizar múltiplas tentativas com diferentes configurações
  async function attemptFetchWithFallbacks(url, originalOptions = {}) {
    // Log detalhado para depuração
    console.log('🔒 Tentativa de fetch para URL com bypass:', url);
    
    try {
      // Primeira tentativa com opções melhoradas
      console.log('🔒 Tentativa 1: Com opções otimizadas');
      const enhancedOptions = enhanceOptions(originalOptions);
      return await originalFetch(url, enhancedOptions);
    } 
    catch (error1) {
      console.warn('🔒 Primeira tentativa falhou:', error1.message);
      
      try {
        // Segunda tentativa: forçar HTTPS para HTTP se aplicável
        if (url.startsWith('https://')) {
          const httpUrl = url.replace('https://', 'http://');
          console.log('🔒 Tentativa 2: Convertendo para HTTP:', httpUrl);
          return await originalFetch(httpUrl, enhanceOptions(originalOptions));
        }
        
        // Se já for HTTP ou outra falha
        throw new Error('URL já é HTTP ou não é uma URL com protocolo');
      } 
      catch (error2) {
        console.warn('🔒 Segunda tentativa falhou:', error2.message);
        
        // Terceira tentativa: última opção com configurações extremas
        try {
          console.log('🔒 Tentativa 3: Configurações extremas');
          const lastResortOptions = {
            ...originalOptions,
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            redirect: 'follow',
            headers: {
              ...originalOptions.headers,
              'X-Requested-With': 'XMLHttpRequest',
              'X-Bypass-Certificate': 'true',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Access-Control-Allow-Origin': '*'
            }
          };
          return await originalFetch(url, lastResortOptions);
        } 
        catch (error3) {
          console.error('🔒 Todas as tentativas falharam:', error3);
          throw error3; // Propagar o último erro se todas as tentativas falharem
        }
      }
    }
  }

  // Substituir a função fetch do window
  window.fetch = async function(url, options = {}) {
    // Verificar se é uma chamada para a API
    const isApiCall = typeof url === 'string' && 
      (url.includes('10.10.0.13') || url.includes('/api/'));
    
    if (isApiCall) {
      console.log('🔒 Detectada chamada para API:', url);
      return attemptFetchWithFallbacks(url, options);
    } 
    
    // Para chamadas não-API, usar comportamento padrão
    return originalFetch(url, options);
  };

  // Adicionar indicador na página para confirmação visual
  const indicator = document.createElement('div');
  indicator.style.cssText = 'position:fixed; bottom:5px; right:5px; background:rgba(0,100,0,0.2); color:green; font-size:10px; padding:3px; z-index:9999; border-radius:3px;';
  indicator.innerText = '🔒 SSL-Bypass Ativo';
  document.body.appendChild(indicator);

  console.log('🔒 Interceptador avançado de certificados carregado com sucesso');
})();
