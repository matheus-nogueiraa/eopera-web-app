import httpRequest from '../utils/httpRequests';

export const atestadosService = {
  consultarAtestados: async (matricula) => {
    try {
      const response = await httpRequest(`/consultarAtestados?matricula=${matricula}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Erro ao consultar atestados: ${response.statusText}`);
      }
      const responseData = await response.json();
      console.log('Atestados consultados com sucesso:', responseData);
      return responseData
    } catch (error) {
      console.error('Erro ao consultar atestados:', error)
      throw error
    }
  },

  enviarAtestado: async (dadosAtestado) => {
    try {
      const response = await axios.post(
        'https://adm.elcop.eng.br:9000/api/enviarAtestado',
        dadosAtestado,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Erro ao enviar atestado:', error)
      throw error
    }
  },
}
