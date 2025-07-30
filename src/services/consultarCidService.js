import axios from 'axios'

const API_URL = '/api/consultarCids'

export const cidService = {
  consultarCids: async (matricula) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      console.log('Resposta da API:', response.data)
      return response.data

    } catch (error) {
      console.error('Erro ao consultar CID:', error)
      throw error
    }
  },

  enviarCid: async (dadosCid) => {
    try {
      const response = await axios.post('/api/enviarCid', dadosCid, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao enviar CID:', error)
      throw error
    }
  },
}