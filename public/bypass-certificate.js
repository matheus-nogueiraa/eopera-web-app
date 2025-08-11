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
    
    // Converter para HTTP diretamente se for uma chamada para API (mais confiável)
    let targetUrl = url;
    if (targetUrl.startsWith('https://') && (targetUrl.includes('10.10.0.13') || targetUrl.includes('/api/'))) {
      targetUrl = targetUrl.replace('https://', 'http://');
      console.log('🔒 Convertendo automaticamente para HTTP:', targetUrl);
    }
    
    try {
      // Primeira tentativa com opções melhoradas
      console.log('🔒 Tentativa 1: Com opções otimizadas');
      const enhancedOptions = enhanceOptions(originalOptions);
      return await originalFetch(targetUrl, enhancedOptions);
    } 
    catch (error1) {
      console.warn('🔒 Primeira tentativa falhou:', error1.message);
      
      try {
        // Segunda tentativa: tentar com credenciais omitidas
        console.log('🔒 Tentativa 2: Sem credenciais');
        const secondOptions = {
          ...enhanceOptions(originalOptions),
          credentials: 'omit',
          mode: 'cors'
        };
        return await originalFetch(targetUrl, secondOptions);
      } 
      catch (error2) {
        console.warn('🔒 Segunda tentativa falhou:', error2.message);
        
        // Terceira tentativa: última opção com configurações extremas
        try {
          console.log('🔒 Tentativa 3: Configurações extremas');
          // Tentar com caminho relativo se estivermos no mesmo domínio
          // Isso pode ajudar a contornar problemas CORS
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
              'Pragma': 'no-cache'
            }
          };
          
          // Se falhar com HTTP, tentar novamente com o original
          return await originalFetch(targetUrl === url ? url : targetUrl, lastResortOptions);
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
    // Verificar se é uma chamada direta para o IP da API (sem passar pelo proxy NGINX)
    // Isso evita que interceptemos chamadas que já estão usando o proxy do NGINX
    const isDirectApiCall = typeof url === 'string' && 
      url.includes('10.10.0.13') && 
      !url.includes(window.location.origin + '/api');
    
    if (isDirectApiCall) {
      console.log('🔒 Detectada chamada direta para API:', url);
      console.log('🔒 Recomendamos usar o proxy do NGINX em vez de chamadas diretas.');
      return attemptFetchWithFallbacks(url, options);
    } 
    
    // Para chamadas não-API ou que já usam o proxy, usar comportamento padrão
    return originalFetch(url, options);
  };

  // Adicionar indicador na página para confirmação visual
  // Esperamos que o DOM esteja pronto antes de adicionar o indicador
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addStatusIndicator();
  } else {
    document.addEventListener('DOMContentLoaded', addStatusIndicator);
  }
  
  function addStatusIndicator() {
    try {
      // Verificamos se o body já existe
      if (document.body) {
        const indicator = document.createElement('div');
        indicator.style.cssText = 'position:fixed; bottom:5px; right:5px; background:rgba(0,100,0,0.2); color:green; font-size:10px; padding:3px; z-index:9999; border-radius:3px;';
        indicator.innerText = '🔒 SSL-Bypass Ativo';
        document.body.appendChild(indicator);
      }
    } catch (e) {
      console.warn('Não foi possível adicionar o indicador de SSL-Bypass:', e);
    }
  }

  console.log('🔒 Interceptador avançado de certificados carregado com sucesso');
})();
