// src/services/atestadosService.js
const API_URL = '/api/enviarAtestado'

export const atestadosService = {
  enviarAtestado: async (dadosAtestado) => {
    try {
      const resposta = await fetch('/api/enviarAtestado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer @k)1qlny;dG!ogXC]us7XB(2LzE{@w',
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
