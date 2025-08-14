import httpRequest from '../utils/httpRequests'

const getGruposCentralizados = async () => {
  try {
    const resposta = await httpRequest('/getGruposCentralizadores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    if (!resposta.ok) {
      const errorData = await resposta.text()
      throw new Error(`Erro ${resposta.status}: ${errorData}`)
    }

    const resultado = await resposta.json()
    console.log('Grupos centralizados:', resultado)
    return resultado
  } catch (erro) {
    console.error('Erro ao buscar grupos centralizados:', erro)
    throw erro
  }
}

export const gerenciarUsuarios = {
  getGruposCentralizados
}

export { getGruposCentralizados }