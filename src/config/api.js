// Configuração da API
export const API_CONFIG = {
  BASE_URL: 'https://adm.elcop.eng.br:443',
  TOKEN: import.meta.env.VITE_API_TOKEN,
  
  // Headers padrão
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.TOKEN}`
  }),
  
  // URLs completas
  endpoints: {
    login: `${API_CONFIG.BASE_URL}/api/login`,
    consultarOperador: `${API_CONFIG.BASE_URL}/api/consultarOperador`,
    enviarAtestado: `${API_CONFIG.BASE_URL}/api/enviarAtestado`,
    consultarAtestados: `${API_CONFIG.BASE_URL}/api/consultarAtestados`,
    consultarCids: `${API_CONFIG.BASE_URL}/api/consultarCids`,
    enviarCid: `${API_CONFIG.BASE_URL}/api/enviarCid`,
    consultarCentroCusto: `${API_CONFIG.BASE_URL}/api/consultarCentroCusto`,
    servicos: `${API_CONFIG.BASE_URL}/api/servicos`,
    consultaServicosProtheus: `${API_CONFIG.BASE_URL}/api/consultaServicosProtheus`,
    incluirOcorrencia: `${API_CONFIG.BASE_URL}/api/incluirOcorrencia`
  }
};

export default API_CONFIG;
