// Função para converter arquivo para base64
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1]) // Remove o prefixo data:...;base64,
    reader.onerror = (error) => reject(error)
  })
}

// Função para calcular a data final do atestado
export const calcularDataFinal = () => {
  const dataInicio = document.getElementById('dataInicioAtestado').value
  const dias = parseInt(document.getElementById('diasAtestado').value, 10)

  // Calcular informação sobre a data selecionada
  if (dataInicio) {
    const hoje = new Date()
    const dataSelecionada = new Date(dataInicio + 'T00:00:00') // Força horário local

    // Normalizar as datas para comparação (apenas a parte da data)
    const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataSelecionadaNormalizada = new Date(
      dataSelecionada.getFullYear(),
      dataSelecionada.getMonth(),
      dataSelecionada.getDate(),
    )

    const diferenca = Math.floor(
      (hojeNormalizado - dataSelecionadaNormalizada) / (1000 * 60 * 60 * 24),
    )

    let mensagem = ''
    if (diferenca === 0) {
      mensagem = '📅 Data de hoje selecionada'
    } else if (diferenca > 0) {
      mensagem = `📅 Data selecionada: ${diferenca} dia${diferenca === 1 ? '' : 's'} atrás`
    } else {
      mensagem = `📅 ⚠️ Data não pode ser no futuro!`
      // Limpar o campo se a data for no futuro
      document.getElementById('dataInicioAtestado').value = ''
      document.getElementById('dataFinalAtestado').value = ''
      document.getElementById('diasAtras').textContent = mensagem
      return
    }

    document.getElementById('diasAtras').textContent = mensagem
  } else {
    document.getElementById('diasAtras').textContent = ''
  }

  // Calcular informação sobre os dias de atestado
  if (dias && dias > 0) {
    let mensagemDias = ''
    let cor = ''

    if (dias >= 1 && dias <= 15) {
      mensagemDias = `⏱️ Tempo Regular (${dias} dia${dias === 1 ? '' : 's'})`
      cor = 'text-success'
    } else if (dias >= 16 && dias <= 30) {
      mensagemDias = `⏰ Tempo Intermediário (${dias} dias)`
      cor = 'text-warning'
    } else if (dias > 30) {
      mensagemDias = `🕐 Tempo Longo (${dias} dias)`
      cor = 'text-danger'
    }

    // Calcular finais de semana se também tiver data de início
    if (dataInicio) {
      const dataInicioCalc = new Date(dataInicio + 'T00:00:00')
      const dataFinalCalc = new Date(dataInicioCalc)
      dataFinalCalc.setDate(dataFinalCalc.getDate() + dias - 1)

      let finaisDeSemana = 0
      let dataAtual = new Date(dataInicioCalc)

      // Contar finais de semana completos no período
      while (dataAtual <= dataFinalCalc) {
        const diaSemana = dataAtual.getDay()

        // Se for sábado, verificar se domingo também está no período
        if (diaSemana === 6) {
          const domingo = new Date(dataAtual)
          domingo.setDate(domingo.getDate() + 1)

          if (domingo <= dataFinalCalc) {
            finaisDeSemana++
            // Pular para segunda-feira para não contar novamente
            dataAtual.setDate(dataAtual.getDate() + 2)
          } else {
            dataAtual.setDate(dataAtual.getDate() + 1)
          }
        } else {
          dataAtual.setDate(dataAtual.getDate() + 1)
        }
      }

      if (finaisDeSemana > 0) {
        mensagemDias += ` • 📅 ${finaisDeSemana} fina${finaisDeSemana === 1 ? 'l' : 'is'} de semana`
      } else {
        mensagemDias += ` • 💼 Nenhum final de semana`
      }
    }

    const spanDias = document.getElementById('informacaoDias')
    spanDias.textContent = mensagemDias
    spanDias.className = `form-text ${cor}`
  } else {
    const spanDias = document.getElementById('informacaoDias')
    spanDias.textContent = ''
    spanDias.className = 'form-text text-muted'
  }

  // Calcular data final se tiver dias
  if (dataInicio && dias && dias > 0) {
    const data = new Date(dataInicio + 'T00:00:00')
    data.setDate(data.getDate() + dias - 1)
    const dataFinal = data.toISOString().split('T')[0]
    document.getElementById('dataFinalAtestado').value = dataFinal

    // Adicionar informação sobre a data de retorno (dia seguinte) com dia da semana
    const dataRetorno = new Date(data)
    dataRetorno.setDate(dataRetorno.getDate() + 1)
    const dataRetornoFormatada = dataRetorno.toLocaleDateString('pt-BR')

    // Obter o dia da semana
    const diasSemana = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ]
    const diaSemana = diasSemana[dataRetorno.getDay()]

    const spanDataFinal = document.getElementById('informacaoDataFinal')
    spanDataFinal.textContent = `📆 Retorno previsto: ${dataRetornoFormatada} (${diaSemana})`
    spanDataFinal.className = 'form-text text-info'
  } else {
    document.getElementById('dataFinalAtestado').value = ''
    const spanDataFinal = document.getElementById('informacaoDataFinal')
    spanDataFinal.textContent = ''
    spanDataFinal.className = 'form-text text-muted'
  }
}

// Função para limpar todo o formulário
export const limparFormulario = (setValidated, setFile, setFileError, setForm, fileInputRef) => {
  // Resetar states
  setValidated(false)
  setFile(null)
  setFileError('')
  setForm({
    matricula: '',
    cpf: '',
    userNome: '',
    atestado: '',
    motivoAfastamento: '',
    dataInicio: '',
    qtdDias: '',
    cid: '',
    nomeMedico: '',
    justificativa: '',
    anexoBase64: '',
  })

  // Limpar campos do formulário usando uma abordagem mais robusta
  const formElement = document.querySelector('form')
  if (formElement) {
    formElement.reset() // Reset completo do formulário
  }

  // Limpar campos específicos que podem não ser resetados pelo form.reset()
  const campos = [
    'tipificacaoAtestado',
    'especificacaoAtestado',
    'dataInicioAtestado',
    'diasAtestado',
    'dataFinalAtestado',
    'justificativaAtestado',
    'medicoAtestado',
    'cidAtestado',
    'matriculaAtestado',
    'cpfAtestado',
    'nomeAtestado',
  ]

  campos.forEach((campoId) => {
    const campo = document.getElementById(campoId)
    if (campo) {
      if (campo.type === 'select-one') {
        campo.selectedIndex = 0 // Reset para primeira opção (disabled)
      } else {
        campo.value = ''
      }
    }
  })

  // Limpar input de arquivo
  if (fileInputRef.current) {
    fileInputRef.current.value = ''
  }

  // Limpar spans informativos
  const spans = ['diasAtras', 'informacaoDias', 'informacaoDataFinal']
  spans.forEach((spanId) => {
    const span = document.getElementById(spanId)
    if (span) {
      span.textContent = ''
      span.className = 'form-text text-muted'
    }
  })

  // Remover classes de validação com um pequeno delay
  setTimeout(() => {
    const formElements = document.querySelectorAll('.is-valid, .is-invalid')
    formElements.forEach((element) => {
      element.classList.remove('is-valid', 'is-invalid')
    })
  }, 100)

  console.log('📋 Formulário limpo e pronto para novo envio')
}

// Função para validar tipos de arquivo
export const validateFileType = (file) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  return allowedTypes.includes(file.type)
}

// Função para validar tamanho do arquivo
export const validateFileSize = (file, maxSizeInMB = 10) => {
  return file.size <= maxSizeInMB * 1024 * 1024
}
