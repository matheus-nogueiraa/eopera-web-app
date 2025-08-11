// consultarAtestadosService.js
import axios from 'axios'

const TOKEN = '@k)1qlny;dG!ogXC]us7XB(2LzE{@w'
const API_BASE_URL = 'https://adm.elcop.eng.br:443'

export const atestadosService = {
  consultarAtestados: async (matricula) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consultarAtestados?matricula=${matricula}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
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
        `${API_BASE_URL}/api/enviarAtestado`,
        dadosAtestado,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
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
