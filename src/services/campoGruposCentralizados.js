import httpRequest from '../utils/httpRequests'

const getGruposCentralizados = async () => {
  try {
    console.log('=== DEBUG API CALL ===')
    console.log('Iniciando chamada para /getGruposCentralizadores')

    const resposta = await httpRequest('/getGruposCentralizadores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    console.log('Status da resposta:', resposta.status)
    console.log('Response OK?', resposta.ok)

    if (!resposta.ok) {
      const errorData = await resposta.text()
      console.error('Erro na resposta da API:', errorData)
      throw new Error(`Erro ${resposta.status}: ${errorData}`)
    }

    const resultado = await resposta.json()
    console.log('=== DADOS DA API ===')
    console.log('Tipo do resultado:', typeof resultado)
    console.log('Resultado completo:', resultado)
    console.log('Status:', resultado.status)
    console.log('Message:', resultado.message)
    console.log('Data type:', typeof resultado.data)
    console.log('Data is array?:', Array.isArray(resultado.data))
    console.log('Data length:', resultado.data?.length)

    // Verificar se a resposta tem status true e dados válidos
    if (resultado.status === true && Array.isArray(resultado.data)) {
      console.log('Estrutura válida - retornando dados')
      console.log('Primeiros 3 itens dos dados:', resultado.data.slice(0, 3))
      return resultado.data // Retornar apenas o array de dados
    } else {
      console.error('Estrutura inválida da resposta:', resultado)
      return []
    }
  } catch (erro) {
    console.error('Erro ao buscar grupos centralizados:', erro)
    throw erro
  }
}

export const gerenciarUsuarios = {
  getGruposCentralizados,
}

export { getGruposCentralizados }
