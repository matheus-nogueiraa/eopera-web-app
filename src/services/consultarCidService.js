import httpRequest from "../utils/httpRequests"

export const cidService = {
  consultarCids: async (matricula) => {
    try {
      const response = await httpRequest('/consultarCids', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao consultar CIDs: ${response.statusText}`)
      }
      const responseData = await response.json()
      console.log('CIDs consultados com sucesso:', responseData)
      return responseData
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