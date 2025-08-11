import axios from 'axios';

// Usar URL completa da API para produção
const API_BASE_URL = 'https://adm.elcop.eng.br:443/api';

export const consultarCentroCusto = async (params = {}) => {

  try {
    const queryParams = new URLSearchParams();
    
    if (params.retornaInativos) {
      queryParams.append('retornaInativos', params.retornaInativos);
    }
    
    if (params.numCCusto) {
      queryParams.append('numCCusto', params.numCCusto);
    }
    
    const url = `${API_BASE_URL}/consultarCentroCusto${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Centro de custo consultado com sucesso:', response.data);

    return response.data;
  } catch (error) {
    console.error('Erro ao consultar centro de custo:', error);
    throw error;
  }
};
