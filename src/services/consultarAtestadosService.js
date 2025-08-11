// consultarAtestadosService.js
import axios from 'axios'

export const atestadosService = {
  consultarAtestados: async (matricula) => {
    try {
      const response = await axios.get(`/api/consultarAtestados?matricula=${matricula}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      return response.data
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
