import axios from 'axios'

const API_BASE_URL = 'https://adm.elcop.eng.br:443'
const API_URL = `${API_BASE_URL}/api/consultarCids`

export const cidService = {
  consultarCids: async (matricula) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      return response.data

    } catch (error) {
      console.error('Erro ao consultar CID:', error)
      throw error
    }
  },

  enviarCid: async (dadosCid) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/enviarCid`, dadosCid, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
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