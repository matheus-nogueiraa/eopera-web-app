import httpRequest from '../utils/httpRequests';

export const atestadosService = {
  enviarAtestado: async (dadosAtestado) => {
    try {
      const resposta = await httpRequest('/enviarAtestado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify(dadosAtestado),
      })

      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }

      return await resposta.json() // ou .text() se a API não retornar JSON
    } catch (erro) {
      console.error('Erro ao enviar atestado:', erro)
      throw erro
    }
  },
}
