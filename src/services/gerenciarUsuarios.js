import httpRequest from '../utils/httpRequests'

export const gerenciarUsuarios = {
  // Cadastrar novo usuário
  enviarCadastro: async (dadosUsuario) => {
    try {
      

      const resposta = await httpRequest('/postUserEopera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify(dadosUsuario),
      })

      if (!resposta.ok) {
        const errorData = await resposta.text()
        throw new Error(`Erro ${resposta.status}: ${errorData}`)
      }

      const resultado = await resposta.json()
      
      return resultado
    } catch (erro) {
      console.error('Erro ao cadastrar usuário:', erro)
      throw erro
    }
  },

  // Atualizar usuário existente
  atualizarUsuario: async (dadosAlterados) => {
    try {
     

      const resposta = await httpRequest('/postUserEopera', {
        method: 'POST', // Usando a mesma API
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify(dadosAlterados),
      })

      if (!resposta.ok) {
        const errorData = await resposta.text()
        throw new Error(`Erro ${resposta.status}: ${errorData}`)
      }

      const resultado = await resposta.json()
     
      return resultado
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro)
      throw erro
    }
  },
}
