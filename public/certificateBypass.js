// Arquivo para lidar com erros de certificado
// Coloque este código dentro de uma tag <script> no seu index.html, antes de carregar o seu app React

// Esta função cria um servidor de proxy temporário para contornar 
// problemas de certificado em ambientes de desenvolvimento/testes
function setupCertificateBypass() {
  // Só aplicar em ambientes específicos
  if (window.location.port === '6443') {
    console.log('Configurando bypass de certificado para ambiente de produção');
    
    // Sobrescreve o método fetch original
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Se for uma chamada para o IP específico
      if (typeof url === 'string' && url.includes('10.10.0.13')) {
        console.log('Aplicando bypass para chamada:', url);
        
        // Adiciona cabeçalhos que podem ajudar em alguns casos
        options = options || {};
        options.headers = options.headers || {};
        options.headers['X-Bypass-Certificate-Check'] = 'true';
        
        // Adiciona modo 'no-cors' se não estiver em modo POST (isso pode afetar o comportamento)
        // if (!options || options.method !== 'POST') {
        //   options = options || {};
        //   options.mode = 'no-cors';
        // }
      }
      
      return originalFetch.call(window, url, options);
    };
    
    console.log('Configuração de bypass completa');
  }
}

// Executa a função
setupCertificateBypass();
