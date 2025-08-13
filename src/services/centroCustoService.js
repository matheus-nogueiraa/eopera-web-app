import httpRequest from "../utils/httpRequests";

export const consultarCentroCusto = async (params = {}) => {

  try {
    const queryParams = new URLSearchParams();
    
    if (params.retornaInativos) {
      queryParams.append('retornaInativos', params.retornaInativos);
    }
    
    if (params.numCCusto) {
      queryParams.append('numCCusto', params.numCCusto);
    }
    
    const url = `/consultarCentroCusto${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await httpRequest(url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar centro de custo: ${response.statusText}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error('Erro ao consultar centro de custo:', error);
    throw error;
  }
};
