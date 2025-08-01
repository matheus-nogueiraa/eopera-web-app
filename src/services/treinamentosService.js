// Simulação de dados do banco
let cursosData = [
  {
    id: 1,
    nome: 'Style Guide - Filter',
    url_video: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    categoria: 'Desenvolvimento',
    ativo: true
  },
  {
    id: 2,
    nome: 'Style Guide - Datatable',
    url_video: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    categoria: 'Desenvolvimento',
    ativo: true
  },
  {
    id: 3,
    nome: 'Modal de seleção de documentos',
    url_video: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    categoria: 'Desenvolvimento',
    ativo: true
  },
  {
    id: 4,
    nome: 'Gestão de Papéis no TOTVS Fluig',
    url_video: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    categoria: 'Negócio',
    ativo: true
  }
];

let questionariosData = [
  {
    id: 1,
    id_curso: 1,
    nome: 'Avaliação - Style Guide Filter',
    perguntas_json: JSON.stringify([
      {
        id: 1,
        tipo: 'unica',
        pergunta: 'Qual é a principal função do componente Filter?',
        alternativas: ['Exibir dados', 'Filtrar dados', 'Editar dados', 'Excluir dados'],
        resposta: [1]
      },
      {
        id: 2,
        tipo: 'multipla',
        pergunta: 'Quais são características do Filter no Fluig?',
        alternativas: ['Configurável', 'Responsivo', 'Integração com API', 'Apenas visual'],
        resposta: [0, 1, 2]
      }
    ])
  },
  {
    id: 2,
    id_curso: 2,
    nome: 'Avaliação - Style Guide Datatable',
    perguntas_json: JSON.stringify([
      {
        id: 1,
        tipo: 'unica',
        pergunta: 'DataTable é usado para?',
        alternativas: ['Exibir listas', 'Criar formulários', 'Navegar páginas', 'Fazer login'],
        resposta: [0]
      }
    ])
  }
];

let turmasData = [
  {
    id: 1,
    id_curso: 1,
    nome: 'Turma Janeiro 2025',
    descricao: 'Turma de desenvolvimento para o primeiro trimestre',
    data_fim: '2025-03-31'
  },
  {
    id: 2,
    id_curso: 2,
    nome: 'Turma Fevereiro 2025',
    descricao: 'Turma especializada em DataTables',
    data_fim: '2025-04-30'
  }
];

let inscricoesData = [
  {
    id: 1,
    id_turma: 1,
    matricula_colaborador: '12345',
    nome_colaborador: 'João Silva'
  },
  {
    id: 2,
    id_turma: 1,
    matricula_colaborador: '67890',
    nome_colaborador: 'Maria Santos'
  }
];

// Controle de progresso e certificados
let progressoData = JSON.parse(localStorage.getItem('progressoTreinamentos')) || {};
let certificadosData = JSON.parse(localStorage.getItem('certificadosTreinamentos')) || [];

// Funções para salvar no localStorage
const salvarProgresso = () => {
  localStorage.setItem('progressoTreinamentos', JSON.stringify(progressoData));
};

const salvarCertificados = () => {
  localStorage.setItem('certificadosTreinamentos', JSON.stringify(certificadosData));
};

// API simulada
export const treinamentosAPI = {
  // Cursos
  getCursos: () => Promise.resolve(cursosData.filter(curso => curso.ativo)),
  
  getCurso: (id) => Promise.resolve(cursosData.find(curso => curso.id === parseInt(id))),
  
  // Questionários
  getQuestionarioPorCurso: (idCurso) => {
    const questionario = questionariosData.find(q => q.id_curso === parseInt(idCurso));
    if (questionario) {
      return Promise.resolve({
        ...questionario,
        perguntas: JSON.parse(questionario.perguntas_json)
      });
    }
    return Promise.resolve(null);
  },
  
  // Progresso do usuário
  getProgresso: (matricula, idCurso) => {
    const chave = `${matricula}_${idCurso}`;
    return Promise.resolve(progressoData[chave] || {
      aulasConcluidas: [],
      questionarioRespondido: false,
      aprovado: false,
      nota: 0,
      dataUltimaAtividade: null
    });
  },
  
  salvarProgresso: (matricula, idCurso, progresso) => {
    const chave = `${matricula}_${idCurso}`;
    progressoData[chave] = {
      ...progresso,
      dataUltimaAtividade: new Date().toISOString()
    };
    salvarProgresso();
    return Promise.resolve(true);
  },
  
  // Submissão de questionário
  submeterQuestionario: (matricula, idCurso, respostas) => {
    return new Promise((resolve) => {
      // Buscar questionário
      const questionario = questionariosData.find(q => q.id_curso === parseInt(idCurso));
      if (!questionario) {
        resolve({ sucesso: false, erro: 'Questionário não encontrado' });
        return;
      }
      
      const perguntas = JSON.parse(questionario.perguntas_json);
      let acertos = 0;
      const totalPerguntas = perguntas.length;
      
      // Calcular pontuação
      perguntas.forEach((pergunta, index) => {
        const respostaUsuario = respostas[index] || [];
        const respostaCorreta = pergunta.resposta;
        
        if (pergunta.tipo === 'unica') {
          if (respostaUsuario.length === 1 && respostaUsuario[0] === respostaCorreta[0]) {
            acertos++;
          }
        } else if (pergunta.tipo === 'multipla') {
          const respostaOrdenada = [...respostaUsuario].sort();
          const corretaOrdenada = [...respostaCorreta].sort();
          if (JSON.stringify(respostaOrdenada) === JSON.stringify(corretaOrdenada)) {
            acertos++;
          }
        }
      });
      
      const nota = Math.round((acertos / totalPerguntas) * 100);
      const aprovado = nota >= 70; // Nota mínima 70%
      
      // Salvar progresso
      const chave = `${matricula}_${idCurso}`;
      progressoData[chave] = {
        ...progressoData[chave],
        questionarioRespondido: true,
        aprovado,
        nota,
        dataUltimaAtividade: new Date().toISOString()
      };
      salvarProgresso();
      
      // Se aprovado, gerar certificado
      if (aprovado) {
        const curso = cursosData.find(c => c.id === parseInt(idCurso));
        const certificado = {
          id: Date.now(),
          matricula_colaborador: matricula,
          id_curso: parseInt(idCurso),
          nome_curso: curso.nome,
          nota,
          data_conclusao: new Date().toISOString(),
          hash_verificacao: `CERT-${Date.now()}-${matricula}-${idCurso}`
        };
        
        certificadosData.push(certificado);
        salvarCertificados();
      }
      
      resolve({
        sucesso: true,
        aprovado,
        nota,
        acertos,
        totalPerguntas
      });
    });
  },
  
  // Certificados
  getCertificados: (matricula) => {
    return Promise.resolve(certificadosData.filter(cert => cert.matricula_colaborador === matricula));
  },
  
  getCertificado: (id) => {
    return Promise.resolve(certificadosData.find(cert => cert.id === parseInt(id)));
  },
  
  // Turmas e inscrições
  getTurmas: () => Promise.resolve(turmasData),
  
  getInscricoesPorTurma: (idTurma) => {
    return Promise.resolve(inscricoesData.filter(insc => insc.id_turma === parseInt(idTurma)));
  }
};

// Função utilitária para simular matrícula do usuário logado
export const getUsuarioLogado = () => {
  return {
    matricula: '12345',
    nome: 'João Silva'
  };
};
