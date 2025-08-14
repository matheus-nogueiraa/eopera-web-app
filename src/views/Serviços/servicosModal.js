import React, { useState, useEffect, useRef } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CListGroup,
  CListGroupItem,
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX, cilCheckAlt, cilCamera, cilWarning } from '@coreui/icons';
import { consultarCentroCusto } from '../../services/centroCustoService';
import { consultarServicosProtheus } from '../../services/servicosService';
import { consultarEquipes } from '../../services/equipesService';
import { consultarUsuariosEoperaX, filtrarUsuarios } from '../../services/usuariosService';
import httpRequest from '../../utils/httpRequests';

// Adicionando estilos CSS para animação
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .alert-danger {
    border-left: 4px solid #dc3545 !important;
  }
  
  .alert-danger .alert-content {
    line-height: 1.6;
  }
  
  .alert-danger ul {
    margin: 0;
    padding-left: 1rem;
  }
  
  .campo-erro {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
  }
  
  .texto-erro {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .fade-in-error {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Adicionando os estilos ao head do documento
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const ServicosModal = ({ 
  visible, 
  setVisible, 
  setLoadingParent, 
  showAlertParent, 
  onSuccess,
  modoVisualizacao = false,
  dadosOcorrencia = null
}) => {
  const [ usuarios, setUsuarios ] = useState([]);
  const [ servicos, setServicos ] = useState([]);
  const [ novoUsuario, setNovoUsuario ] = useState('');
  const [ isLider, setIsLider ] = useState(false);
  const [ ocorrenciaSemEndereco, setOcorrenciaSemEndereco ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  // Estados para validação de campos
  const [ camposComErro, setCamposComErro ] = useState({});

  // Estados para alertas
  const [ alertVisible, setAlertVisible ] = useState(false);
  const [ alertMessage, setAlertMessage ] = useState('');
  const [ alertColor, setAlertColor ] = useState('success');

  // Estados para o select de centro de custo
  const [ centroCustoOpcoes, setCentroCustoOpcoes ] = useState([]);
  const [ centroCustoSelecionado, setCentroCustoSelecionado ] = useState('');
  const [ loadingCentroCusto, setLoadingCentroCusto ] = useState(false);

  // Estados para modal de confirmação de troca de centro de custo
  const [ modalConfirmacaoVisible, setModalConfirmacaoVisible ] = useState(false);
  const [ novoCentroCustoTemp, setNovoCentroCustoTemp ] = useState('');
  const [ selectElementTemp, setSelectElementTemp ] = useState(null);

  // Estados para autocomplete de serviços
  const [ servicosOpcoes, setServicosOpcoes ] = useState([]);
  const [ todosServicos, setTodosServicos ] = useState([]); // Cache de todos os serviços
  const [ loadingServicos, setLoadingServicos ] = useState(false);
  const [ servicoDropdownVisivel, setServicoDropdownVisivel ] = useState({});
  const [ servicoSelectedIndex, setServicoSelectedIndex ] = useState({});
  const servicosRefs = useRef({});

  // Estados para autocomplete de número operacional
  const [ equipesOpcoes, setEquipesOpcoes ] = useState([]);
  const [ todasEquipes, setTodasEquipes ] = useState([]); // Cache de todas as equipes
  const [ loadingEquipes, setLoadingEquipes ] = useState(false);
  const [ equipeDropdownVisivel, setEquipeDropdownVisivel ] = useState(false);
  const [ equipeSelectedIndex, setEquipeSelectedIndex ] = useState(-1);
  const [ numeroOperacionalSelecionado, setNumeroOperacionalSelecionado ] = useState('');
  const equipeRef = useRef(null);
  const equipeDebounceRef = useRef(null);

  // Estados para autocomplete de município
  const [ municipiosOpcoes, setMunicipiosOpcoes ] = useState([]);
  const [ todosMunicipios, setTodosMunicipios ] = useState([]);
  const [ loadingMunicipios, setLoadingMunicipios ] = useState(false);
  const [ municipioDropdownVisivel, setMunicipioDropdownVisivel ] = useState(false);
  const [ municipioSelectedIndex, setMunicipioSelectedIndex ] = useState(-1);
  const [ municipioSelecionado, setMunicipioSelecionado ] = useState('');
  const municipioRef = useRef(null);
  const municipioDebounceRef = useRef(null);

  // Estados para autocomplete de usuários
  const [ usuariosOpcoes, setUsuariosOpcoes ] = useState([]);
  const [ todosUsuarios, setTodosUsuarios ] = useState([]);
  const [ loadingUsuarios, setLoadingUsuarios ] = useState(false);
  const [ usuarioDropdownVisivel, setUsuarioDropdownVisivel ] = useState(false);
  const [ usuarioSelectedIndex, setUsuarioSelectedIndex ] = useState(-1);
  const [ usuarioSelecionado, setUsuarioSelecionado ] = useState('');
  const [ usuarioInfo, setUsuarioInfo ] = useState({ matricula: '', nome: '', cpf: '' });
  const usuarioRef = useRef(null);
  const usuarioDebounceRef = useRef(null);

  // Estados para dados de visualização
  const [ dadosVisualizacao, setDadosVisualizacao ] = useState({
    centroCustoNome: '',
    numeroOperacionalNome: '',
    municipioNome: '',
    servicosNomes: []
  });

  // Função para carregar todos os municípios (uma vez só)
  const carregarTodosMunicipios = async () => {
    if (todosMunicipios.length > 0) return;
    setLoadingMunicipios(true);
    try {
      const resp = await httpRequest('/consultarMunicipiosIBGE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
      });
      const json = await resp.json();
      if (json.status && Array.isArray(json.data)) {
        setTodosMunicipios(json.data);
      } else {
        setTodosMunicipios([]);
      }
    } catch (e) {
      setTodosMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  // Funções para buscar dados por ID para visualização
  const buscarCentroCustoPorId = async (centroCustoId) => {
    try {
      const response = await consultarCentroCusto({
        retornaInativos: 'N',
        numCCusto: centroCustoId
      });
      
      if (response?.status && response?.data && response.data.length > 0) {
        const centroCusto = response.data[0];
        return `${centroCusto.centroCusto?.trim()} - ${centroCusto.descricaoCCusto?.trim()}`;
      }
      return centroCustoId; // Retorna o ID se não encontrar
    } catch (error) {
      console.error('Erro ao buscar centro de custo:', error);
      return centroCustoId;
    }
  };

  const buscarNumeroOperacionalPorId = async (numeroOperacionalId) => {
    try {
      const response = await consultarEquipes({
        retornaInativos: 'S',
        numOperacional: numeroOperacionalId
      });
      
      if (response?.status && response?.data && response.data.length > 0) {
        const equipe = response.data[0];
        return `${equipe.numOperacional?.trim()} - ${equipe.descricao?.trim()}`;
      }
      return numeroOperacionalId; // Retorna o ID se não encontrar
    } catch (error) {
      console.error('Erro ao buscar número operacional:', error);
      return numeroOperacionalId;
    }
  };

  const buscarMunicipioPorCodigo = async (codigoMunicipio) => {
    try {
      // Primeiro tenta carregar todos os municípios se ainda não carregou
      if (todosMunicipios.length === 0) {
        await carregarTodosMunicipios();
      }
      
      // Procura o município pelo código
      const municipio = todosMunicipios.find(m => m.codigo === codigoMunicipio);
      if (municipio) {
        return `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
      }
      return codigoMunicipio; // Retorna o código se não encontrar
    } catch (error) {
      console.error('Erro ao buscar município:', error);
      return codigoMunicipio;
    }
  };

  const buscarServicosPorIds = async (servicosArray) => {
    if (!servicosArray || !Array.isArray(servicosArray)) return [];
    try {
      // Mapeia cada serviço para buscar sua descrição fazendo requisições individuais
      const servicosComNomes = await Promise.all(
        servicosArray.map(async (servico, index) => {
          
          if (servico.servicoSelecionado && servico.servicoSelecionado.idServico) {
            // Se já tem o objeto completo, usa ele
            return {
              ...servico,
              servicoNome: `${servico.servicoSelecionado.idServico} - ${servico.servicoSelecionado.descricaoServico}`
            };
          } else if (servico.servico || servico.idServico) {
            // Usa servico.servico (para dados de formulário) ou servico.idServico (para dados salvos)
            const servicoId = servico.servico || servico.idServico;
            try {
              
              // Faz requisição específica para o ID do serviço
              const response = await httpRequest(`/consultaServicosProtheus?idServico=${servicoId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
                },
              });
              
              const json = await response.json();
              
              if (json.status && json.data && json.data.length > 0) {
                const servicoEncontrado = json.data[0];
                return {
                  ...servico,
                  servicoNome: `${servicoEncontrado.idServico.trim()} - ${servicoEncontrado.descricaoServico.trim()}`
                };
              } else {
                // Se não encontrar na API, tenta buscar nos serviços já carregados
                if (todosServicos.length > 0) {
                  const servicoEncontrado = todosServicos.find(s => 
                    s.idServico === servicoId || 
                    s.codServico === servicoId
                  );
                  
                  if (servicoEncontrado) {
                    return {
                      ...servico,
                      servicoNome: `${servicoEncontrado.idServico} - ${servicoEncontrado.descricaoServico}`
                    };
                  }
                }
                
                // Se não encontrar em lugar nenhum, retorna o ID
                return {
                  ...servico,
                  servicoNome: servicoId || 'Serviço não identificado'
                };
              }
            } catch (error) {
              console.error(`Erro ao buscar serviço ${servicoId}:`, error);
              return {
                ...servico,
                servicoNome: servicoId || 'Erro ao carregar serviço'
              };
            }
          }
          
          // Se não tem serviço definido
          return {
            ...servico,
            servicoNome: 'Serviço não identificado'
          };
        })
      );
      
      return servicosComNomes;
    } catch (error) {
      console.error('Erro ao buscar serviços por IDs:', error);
      return servicosArray.map(servico => ({
        ...servico,
        servicoNome: servico.servico || servico.idServico || 'Erro ao carregar'
      }));
    }
  };

  // Função para filtrar municípios localmente
  const filtrarMunicipios = (termo) => {
    if (!termo || termo.length < 2) return [];
    const termoLower = termo.toLowerCase().trim();
    return todosMunicipios.filter(m =>
      m.codigo?.toLowerCase().includes(termoLower) ||
      m.descricao?.toLowerCase().includes(termoLower)
    ).slice(0, 20);
  };

  // Função para buscar municípios
  const buscarMunicipios = async (termo) => {
    if (!termo || termo.length < 2) {
      setMunicipiosOpcoes([]);
      setMunicipioDropdownVisivel(false);
      return;
    }
    if (todosMunicipios.length === 0) {
      await carregarTodosMunicipios();
    }
    const filtrados = filtrarMunicipios(termo);
    setMunicipiosOpcoes(filtrados);
    setMunicipioDropdownVisivel(true);
    setMunicipioSelectedIndex(-1);
  };

  // Debounce para busca de municípios
  const handleMunicipioChange = (e) => {
    const valor = e.target.value;
    setMunicipioSelecionado(valor);
    if (!valor) {
      setMunicipiosOpcoes([]);
      setMunicipioDropdownVisivel(false);
      return;
    }
    if (municipioDebounceRef.current) clearTimeout(municipioDebounceRef.current);
    municipioDebounceRef.current = setTimeout(() => {
      buscarMunicipios(valor);
    }, 300);
  };

  // Selecionar município
  const selecionarMunicipio = (municipio) => {
    const texto = `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
    setMunicipioSelecionado(texto);
    setMunicipioDropdownVisivel(false);
    setMunicipiosOpcoes([]);
    // Se quiser salvar o código do município para envio, salve em outro estado
    // setCodMunicipioSelecionado(municipio.codigo.trim());
    // Atualizar o valor do input diretamente
    const municipioInput = document.getElementById('municipio');
    if (municipioInput) {
      municipioInput.value = texto;
    }
  };

  // Navegação por teclado para municípios
  const handleMunicipioKeyDown = (e) => {
    if (!municipioDropdownVisivel || municipiosOpcoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      setMunicipioSelectedIndex((prev) => Math.min(prev + 1, municipiosOpcoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      setMunicipioSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && municipioSelectedIndex >= 0) {
      selecionarMunicipio(municipiosOpcoes[ municipioSelectedIndex ]);
    }
  };

  // Função para carregar todos os usuários (uma vez só)
  const carregarTodosUsuarios = async () => {
    if (todosUsuarios.length > 0) return;
    setLoadingUsuarios(true);
    try {
      const dados = await consultarUsuariosEoperaX();
      setTodosUsuarios(dados || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setTodosUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Função para buscar usuários
  const buscarUsuarios = async (termo) => {
    if (!termo || termo.length < 2) {
      setUsuariosOpcoes([]);
      setUsuarioDropdownVisivel(false);
      return;
    }
    if (todosUsuarios.length === 0) {
      await carregarTodosUsuarios();
    }
    const filtrados = filtrarUsuarios(todosUsuarios, termo);
    setUsuariosOpcoes(filtrados);
    setUsuarioDropdownVisivel(true);
    setUsuarioSelectedIndex(-1);
  };

  // Debounce para busca de usuários
  const handleUsuarioChange = (e) => {
    const valor = e.target.value;
    setUsuarioSelecionado(valor);
    if (!valor) {
      setUsuariosOpcoes([]);
      setUsuarioDropdownVisivel(false);
      return;
    }
    if (usuarioDebounceRef.current) clearTimeout(usuarioDebounceRef.current);
    usuarioDebounceRef.current = setTimeout(() => {
      buscarUsuarios(valor);
    }, 300);
  };

  // Selecionar usuário
  const selecionarUsuario = (usuario) => {
    const nomeCompleto = usuario.nome?.trim() || '';
    setUsuarioSelecionado(nomeCompleto);
    setUsuarioInfo({
      matricula: usuario.matricula?.trim() || '',
      nome: nomeCompleto,
      cpf: usuario.cpf?.trim() || ''
    });
    setUsuarioDropdownVisivel(false);
    setUsuariosOpcoes([]);
  };

  // Navegação por teclado para usuários
  const handleUsuarioKeyDown = (e) => {
    if (!usuarioDropdownVisivel || usuariosOpcoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      setUsuarioSelectedIndex((prev) => Math.min(prev + 1, usuariosOpcoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      setUsuarioSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && usuarioSelectedIndex >= 0) {
      selecionarUsuario(usuariosOpcoes[ usuarioSelectedIndex ]);
    }
  };

  // Função para limpar erro de um campo específico
  const limparErroCampo = (campo) => {
    setCamposComErro(prev => {
      const novoErros = { ...prev };
      delete novoErros[ campo ];
      return novoErros;
    });
  };

  // Função para limpar todos os campos do modal
  const limparCampos = () => {
    // Limpar inputs de texto
    const inputs = [
      'numeroOS', 'unConsumidora', 'data', 'endereco', 'bairro',
      'municipio', 'cep', 'latitude', 'longitude', 'dataConclusao',
      'numeroOperacional', 'hrInicialDeslocamento', 'hrInicioAtividade', 
      'hrInicioIntervalo', 'hrFimIntervalo', 'hrPrimeiroContatoCoi', 
      'hrAutorizacaoCoi', 'hrFechamentoCoi', 'hrFimAtividade', 'hrFimDeslocamento'
    ];

    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = '';
      }
    });

    // Resetar select de status para primeira opção
    const statusSelect = document.getElementById('status');
    if (statusSelect) {
      statusSelect.selectedIndex = 0;
    }

    // Resetar estados do React
    setUsuarios([]);
    setServicos([]);
    setIsLider(false);
    setOcorrenciaSemEndereco(false);

    // Resetar estado do centro de custo selecionado
    setCentroCustoSelecionado('');

    // Limpar serviços quando centro de custo é resetado
    setTodosServicos([]);

    // Resetar estados dos serviços
    setServicosOpcoes([]);
    setServicoDropdownVisivel({});
    setServicoSelectedIndex({});
    servicosRefs.current = {};
    // Manter todosServicos para não precisar recarregar

    // Resetar estados do número operacional
    setEquipesOpcoes([]);
    setEquipeDropdownVisivel(false);
    setEquipeSelectedIndex(-1);
    setNumeroOperacionalSelecionado('');
    if (equipeDebounceRef.current) {
      clearTimeout(equipeDebounceRef.current);
    }

    // Resetar estados do usuário
    setUsuariosOpcoes([]);
    setUsuarioDropdownVisivel(false);
    setUsuarioSelectedIndex(-1);
    setUsuarioSelecionado('');
    setUsuarioInfo({ matricula: '', nome: '', cpf: '' });
    if (usuarioDebounceRef.current) {
      clearTimeout(usuarioDebounceRef.current);
    }

    // Resetar estados do alert
    setAlertVisible(false);
    setAlertMessage('');
    setAlertColor('success');

    // Resetar estados do modal de confirmação
    setModalConfirmacaoVisible(false);
    setNovoCentroCustoTemp('');
    setSelectElementTemp(null);

    // Limpar erros de validação
    setCamposComErro({});
  };

  // Função para exibir alertas
  const mostrarAlert = (message, color = 'success') => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlertVisible(true);

    // Auto-hide após tempo variável dependendo do tipo
    const timeoutDuration = color === 'danger' ? 8000 : 4000; // 8 segundos para erros, 4 para sucesso
    setTimeout(() => {
      setAlertVisible(false);
    }, timeoutDuration);

    // Se houver função de alerta no componente pai, também exibe lá
    if (showAlertParent) {
      showAlertParent(message, color);
    }
  };

  // Função para carregar todos os centros de custo
  const carregarTodosCentrosCusto = async () => {
    setLoadingCentroCusto(true);
    try {
      const response = await consultarCentroCusto({
        retornaInativos: 'N' // Retorna apenas ativos
      });

      // A API retorna um objeto com status, message e data
      const dados = response?.data && Array.isArray(response.data) ? response.data : [];
      setCentroCustoOpcoes(dados);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      setCentroCustoOpcoes([]);
      mostrarAlert('Erro ao carregar centros de custo', 'danger');
    } finally {
      setLoadingCentroCusto(false);
    }
  };

  // UseEffect para limpar campos quando o modal abrir
  useEffect(() => {
    if (visible) {
      // Usar setTimeout para garantir que os elementos DOM estejam disponíveis
      setTimeout(() => {
        if (!modoVisualizacao) {
          limparCampos();
        }
        // Carregar todos os centros de custo ao abrir o modal
        carregarTodosCentrosCusto();
      }, 100);
    }
  }, [ visible ]);

  // UseEffect para preencher dados em modo visualização
  useEffect(() => {
    if (visible && modoVisualizacao && dadosOcorrencia) {
      // Função para carregar dados de visualização
      const carregarDadosVisualizacao = async () => {
        const novosDados = { ...dadosVisualizacao };
        
        // Buscar centro de custo por ID
        if (dadosOcorrencia.centroCusto) {
          const centroCustoNome = await buscarCentroCustoPorId(dadosOcorrencia.centroCusto);
          novosDados.centroCustoNome = centroCustoNome;
        }
        
        // Buscar número operacional por ID
        if (dadosOcorrencia.numeroOperacional) {
          const numeroOperacionalNome = await buscarNumeroOperacionalPorId(dadosOcorrencia.numeroOperacional);
          novosDados.numeroOperacionalNome = numeroOperacionalNome;
        }
        
        // Buscar município por código
        if (dadosOcorrencia.codMunicipio) {
          const municipioNome = await buscarMunicipioPorCodigo(dadosOcorrencia.codMunicipio);
          novosDados.municipioNome = municipioNome;
        }
        
        // Buscar serviços por IDs
        if (dadosOcorrencia.servicos && Array.isArray(dadosOcorrencia.servicos)) {
          const servicosComNomes = await buscarServicosPorIds(dadosOcorrencia.servicos);
          novosDados.servicosNomes = servicosComNomes;
        }
        
        setDadosVisualizacao(novosDados);
      };
      
      // Usar setTimeout para garantir que os elementos DOM estejam disponíveis
      setTimeout(() => {
        // Preencher campos básicos
        if (dadosOcorrencia.numeroOs) {
          const numeroOSEl = document.getElementById('numeroOS');
          if (numeroOSEl) numeroOSEl.value = dadosOcorrencia.numeroOs;
        }
        
        if (dadosOcorrencia.unidadeConsumidora) {
          const unConsumidoraEl = document.getElementById('unConsumidora');
          if (unConsumidoraEl) unConsumidoraEl.value = dadosOcorrencia.unidadeConsumidora;
        }
        
        if (dadosOcorrencia.status) {
          const statusEl = document.getElementById('status');
          if (statusEl) statusEl.value = dadosOcorrencia.status;
        }
        
        if (dadosOcorrencia.data) {
          const dataEl = document.getElementById('data');
          if (dataEl) {
            // Converter de YYYYMMDD para YYYY-MM-DD
            const ano = dadosOcorrencia.data.substring(0, 4);
            const mes = dadosOcorrencia.data.substring(4, 6);
            const dia = dadosOcorrencia.data.substring(6, 8);
            dataEl.value = `${ano}-${mes}-${dia}`;
          }
        }
        
        if (dadosOcorrencia.dataConclusao) {
          const dataConclusaoEl = document.getElementById('dataConclusao');
          if (dataConclusaoEl) {
            // Converter de YYYYMMDD para YYYY-MM-DD
            const ano = dadosOcorrencia.dataConclusao.substring(0, 4);
            const mes = dadosOcorrencia.dataConclusao.substring(4, 6);
            const dia = dadosOcorrencia.dataConclusao.substring(6, 8);
            dataConclusaoEl.value = `${ano}-${mes}-${dia}`;
          }
        }
        
        if (dadosOcorrencia.endereco) {
          const enderecoEl = document.getElementById('endereco');
          if (enderecoEl) enderecoEl.value = dadosOcorrencia.endereco;
        }
        
        if (dadosOcorrencia.bairro) {
          const bairroEl = document.getElementById('bairro');
          if (bairroEl) bairroEl.value = dadosOcorrencia.bairro;
        }
        
        if (dadosOcorrencia.centroCusto) {
          setCentroCustoSelecionado(dadosOcorrencia.centroCusto);
        }
        
        // Preencher horários
        if (dadosOcorrencia.hrInicialDeslocamento) {
          const hrInicialDeslocamentoEl = document.getElementById('hrInicialDeslocamento');
          if (hrInicialDeslocamentoEl) hrInicialDeslocamentoEl.value = dadosOcorrencia.hrInicialDeslocamento;
        }
        
        if (dadosOcorrencia.hrInicioAtividade) {
          const hrInicioAtividadeEl = document.getElementById('hrInicioAtividade');
          if (hrInicioAtividadeEl) hrInicioAtividadeEl.value = dadosOcorrencia.hrInicioAtividade;
        }
        
        if (dadosOcorrencia.hrInicioIntervalo) {
          const hrInicioIntervaloEl = document.getElementById('hrInicioIntervalo');
          if (hrInicioIntervaloEl) hrInicioIntervaloEl.value = dadosOcorrencia.hrInicioIntervalo;
        }
        
        if (dadosOcorrencia.hrFimIntervalo) {
          const hrFimIntervaloEl = document.getElementById('hrFimIntervalo');
          if (hrFimIntervaloEl) hrFimIntervaloEl.value = dadosOcorrencia.hrFimIntervalo;
        }
        
        if (dadosOcorrencia.hrPrimeiroContatoCoi) {
          const hrPrimeiroContatoCoiEl = document.getElementById('hrPrimeiroContatoCoi');
          if (hrPrimeiroContatoCoiEl) hrPrimeiroContatoCoiEl.value = dadosOcorrencia.hrPrimeiroContatoCoi;
        }
        
        if (dadosOcorrencia.hrAutorizacaoCoi) {
          const hrAutorizacaoCoiEl = document.getElementById('hrAutorizacaoCoi');
          if (hrAutorizacaoCoiEl) hrAutorizacaoCoiEl.value = dadosOcorrencia.hrAutorizacaoCoi;
        }
        
        if (dadosOcorrencia.hrFechamentoCoi) {
          const hrFechamentoCoiEl = document.getElementById('hrFechamentoCoi');
          if (hrFechamentoCoiEl) hrFechamentoCoiEl.value = dadosOcorrencia.hrFechamentoCoi;
        }
        
        if (dadosOcorrencia.hrFimAtividade) {
          const hrFimAtividadeEl = document.getElementById('hrFimAtividade');
          if (hrFimAtividadeEl) hrFimAtividadeEl.value = dadosOcorrencia.hrFimAtividade;
        }
        
        if (dadosOcorrencia.hrFimDeslocamento) {
          const hrFimDeslocamentoEl = document.getElementById('hrFimDeslocamento');
          if (hrFimDeslocamentoEl) hrFimDeslocamentoEl.value = dadosOcorrencia.hrFimDeslocamento;
        }
        
        // Preencher usuários
        if (dadosOcorrencia.usuarios && Array.isArray(dadosOcorrencia.usuarios)) {
          setUsuarios(dadosOcorrencia.usuarios);
        }
        
        // Preencher serviços
        if (dadosOcorrencia.servicos && Array.isArray(dadosOcorrencia.servicos)) {
          setServicos(dadosOcorrencia.servicos);
        }
        
        // Definir se ocorrência sem endereço
        if (dadosOcorrencia.semEndereco === 'S') {
          setOcorrenciaSemEndereco(true);
        }
        
        // Carregar dados de visualização (nomes dos campos)
        carregarDadosVisualizacao();
        
      }, 200);
    }
  }, [visible, modoVisualizacao, dadosOcorrencia]);

  // Esconde erros individuais após 5 segundos
  useEffect(() => {
    if (Object.keys(camposComErro).length > 0) {
      const timeout = setTimeout(() => {
        setCamposComErro({});
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [ camposComErro ]);

  const adicionarUsuario = () => {
    if (usuarioInfo.nome && usuarioInfo.matricula) {
      setUsuarios([ ...usuarios, {
        nome: usuarioInfo.nome,
        matricula: usuarioInfo.matricula,
        cpf: usuarioInfo.cpf,
        lider: isLider
      } ]);
      setUsuarioSelecionado('');
      setUsuarioInfo({ matricula: '', nome: '', cpf: '' });
      setIsLider(false);
    }
  };

  const removerUsuario = (index) => {
    const novosUsuarios = [ ...usuarios ];
    novosUsuarios.splice(index, 1);
    setUsuarios(novosUsuarios);
  };

  const adicionarServico = () => {
    setServicos([ ...servicos, {
      servico: '',
      observacao: '',
      valorGrupo: '',
      valorServico: '',
      quantidade: '',
      servicoSelecionado: null,
      fotos: []
    } ]);
  };

  const removerServico = (index) => {
    const novosServicos = [ ...servicos ];
    novosServicos.splice(index, 1);
    setServicos(novosServicos);
  };

  const atualizarServico = (index, campo, valor) => {
    const novosServicos = [ ...servicos ];
    novosServicos[ index ][ campo ] = valor;
    setServicos(novosServicos);
  };

  // Função para upload de imagens
  const handleImageUpload = (event, servicoIndex) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Converter arquivos para base64
    const promisesConvercao = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remover o prefixo data:image/...;base64,
          const base64 = reader.result.split(',')[ 1 ];
          resolve({ base64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promisesConvercao)
      .then(novasFotos => {
        const novosServicos = [ ...servicos ];
        if (!novosServicos[ servicoIndex ].fotos) {
          novosServicos[ servicoIndex ].fotos = [];
        }
        novosServicos[ servicoIndex ].fotos = [ ...novosServicos[ servicoIndex ].fotos, ...novasFotos ];
        setServicos(novosServicos);
        mostrarAlert(`${novasFotos.length} foto${novasFotos.length > 1 ? 's' : ''} adicionada${novasFotos.length > 1 ? 's' : ''} com sucesso!`, 'success');
      })
      .catch(error => {
        console.error('Erro ao converter imagens:', error);
        mostrarAlert('Erro ao processar as imagens. Tente novamente.', 'danger');
      });

    // Limpar o input para permitir selecionar os mesmos arquivos novamente
    event.target.value = '';
  };

  // Função para remover foto
  const removerFoto = (servicoIndex, fotoIndex) => {
    const novosServicos = [ ...servicos ];
    novosServicos[ servicoIndex ].fotos.splice(fotoIndex, 1);
    setServicos(novosServicos);
    mostrarAlert('Foto removida com sucesso!', 'success');
  };

  // Função para carregar todos os serviços (uma vez só)
  const carregarTodosServicos = async () => {
    if (todosServicos.length > 0) return; // Já carregados

    setLoadingServicos(true);

    try {

      // Usar a função consultarServicosProtheus sem parâmetros para buscar todos
      const dados = await consultarServicosProtheus();


      // A função já retorna diretamente o array de dados
      if (Array.isArray(dados)) {
        setTodosServicos(dados);
      } else {
        console.warn('Resposta da API não é um array:', dados);
        setTodosServicos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setTodosServicos([]);
      mostrarAlert('Erro ao carregar serviços do Protheus', 'danger');
    } finally {
      setLoadingServicos(false);
    }
  };

  // Função para carregar serviços de um centro de custo específico
  const carregarServicosPorCentroCusto = async (centroCusto) => {
    setLoadingServicos(true);

    try {

      // Usar a função consultarServicosProtheus com o parâmetro centroCusto
      const dados = await consultarServicosProtheus({ centroCusto });


      // A função já retorna diretamente o array de dados
      if (Array.isArray(dados)) {
        setTodosServicos(dados);
      } else {
        console.warn('Resposta da API não é um array:', dados);
        setTodosServicos([]);
        mostrarAlert('Nenhum serviço encontrado para o centro de custo selecionado', 'warning');
      }
    } catch (error) {
      console.error('Erro ao carregar serviços por centro de custo:', error);
      setTodosServicos([]);
      mostrarAlert('Erro ao carregar serviços do centro de custo selecionado', 'danger');
    } finally {
      setLoadingServicos(false);
    }
  };

  // Função para filtrar serviços localmente
  const filtrarServicos = (termo) => {
    if (!termo || termo.length < 2) {
      return [];
    }

    const termoLower = termo.toLowerCase().trim();

    return todosServicos.filter(servico => {
      const idServico = servico.idServico?.toLowerCase() || '';
      const descricao = servico.descricaoServico?.toLowerCase() || '';
      const codServico = servico.codServico?.toLowerCase() || '';
      const siglaUp = servico.siglaUp?.toLowerCase() || '';

      return idServico.includes(termoLower) ||
        descricao.includes(termoLower) ||
        codServico.includes(termoLower) ||
        siglaUp.includes(termoLower);
    }).slice(0, 20); // Limitar a 20 resultados
  };

  // Função para buscar serviços do Protheus
  const buscarServicos = async (termo, index) => {
    if (!termo || termo.length < 2) {
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
      return;
    }

    // Verificar se um centro de custo foi selecionado
    if (!centroCustoSelecionado) {
      mostrarAlert('É obrigatório selecionar um centro de custo antes de pesquisar serviços', 'warning');
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
      return;
    }

    // Se não há serviços carregados para este centro de custo, carregá-los primeiro
    if (todosServicos.length === 0) {
      await carregarServicosPorCentroCusto(centroCustoSelecionado);
    }

    // Filtrar localmente
    const servicosFiltrados = filtrarServicos(termo);
    setServicosOpcoes(servicosFiltrados);
    setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: true }));
    setServicoSelectedIndex(prev => ({ ...prev, [ index ]: -1 }));
  };

  // Debounce para busca de serviços
  const handleServicoChange = (e, index) => {
    const valor = e.target.value;
    atualizarServico(index, 'servico', valor);

    // Se o campo foi limpo, resetar seleção
    if (!valor) {
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
      return;
    }

    // Limpar timeout anterior
    if (servicosRefs.current[ `debounce_${index}` ]) {
      clearTimeout(servicosRefs.current[ `debounce_${index}` ]);
    }

    // Configurar novo timeout
    servicosRefs.current[ `debounce_${index}` ] = setTimeout(() => {
      buscarServicos(valor, index);
    }, 300); // 300ms de delay
  };

  // Selecionar serviço
  const selecionarServico = (servico, index) => {
    // Mostrar ID e descrição no input
    const descricaoServico = servico.descricaoServico?.trim() || '';
    const textoExibicao = `${servico.idServico?.trim()} - ${descricaoServico}`;

    atualizarServico(index, 'servico', textoExibicao);
    atualizarServico(index, 'servicoSelecionado', servico);

    // Preencher automaticamente o valor do grupo e valor do serviço
    if (servico.valorGrupo && servico.valorGrupo > 0) {
      atualizarServico(index, 'valorGrupo', servico.valorGrupo.toString());
    }
    if (servico.valorPontos && servico.valorPontos > 0) {
      atualizarServico(index, 'valorServico', servico.valorPontos.toString());
    }

    setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
    setServicoSelectedIndex(prev => ({ ...prev, [ index ]: -1 }));
  };

  // Navegação por teclado para serviços
  const handleServicoKeyDown = (e, index) => {
    if (!servicoDropdownVisivel[ index ] || servicosOpcoes.length === 0) return;

    const maxResults = Math.min(servicosOpcoes.length, 10);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setServicoSelectedIndex(prev => ({
          ...prev,
          [ index ]: prev[ index ] < maxResults - 1 ? prev[ index ] + 1 : 0
        }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setServicoSelectedIndex(prev => ({
          ...prev,
          [ index ]: prev[ index ] > 0 ? prev[ index ] - 1 : maxResults - 1
        }));
        break;
      case 'Enter':
        e.preventDefault();
        if (servicoSelectedIndex[ index ] >= 0 && servicoSelectedIndex[ index ] < maxResults) {
          selecionarServico(servicosOpcoes[ servicoSelectedIndex[ index ] ], index);
        }
        break;
      case 'Escape':
        setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
        setServicoSelectedIndex(prev => ({ ...prev, [ index ]: -1 }));
        break;
    }
  };

  // Função para lidar com a mudança no select de centro de custo
  const handleCentroCustoChange = async (e) => {
    const valor = e.target.value;
    
    // Se já existe um centro de custo selecionado e há serviços adicionados, 
    // perguntar se o usuário realmente quer trocar
    if (centroCustoSelecionado && servicos.length > 0 && valor !== centroCustoSelecionado) {
      // Armazenar temporariamente o novo valor e elemento do select
      setNovoCentroCustoTemp(valor);
      setSelectElementTemp(e.target);
      setModalConfirmacaoVisible(true);
      
      // Reverter o select para o valor anterior temporariamente
      e.target.value = centroCustoSelecionado;
      return;
    }

    // Se não há conflito, proceder normalmente
    await aplicarMudancaCentroCusto(valor);
  };

  // Função para aplicar a mudança do centro de custo
  const aplicarMudancaCentroCusto = async (valor) => {
    setCentroCustoSelecionado(valor);

    // Encontrar o objeto completo do centro de custo selecionado
    const centroCusto = centroCustoOpcoes.find(cc => cc.centroCusto === valor);

    // Limpar os serviços anteriores
    setTodosServicos([]);
    setServicosOpcoes([]);
    
    // Se um centro de custo foi selecionado, carregar os serviços desse centro
    if (valor && valor.trim()) {
      await carregarServicosPorCentroCusto(valor.trim());
    }
  };

  // Função para confirmar a troca do centro de custo
  const confirmarTrocaCentroCusto = async () => {
    // Limpar todos os serviços
    setServicos([]);
    
    // Aplicar a mudança
    await aplicarMudancaCentroCusto(novoCentroCustoTemp);
    
    // Atualizar o select element
    if (selectElementTemp) {
      selectElementTemp.value = novoCentroCustoTemp;
    }
    
    // Fechar modal e limpar estados temporários
    setModalConfirmacaoVisible(false);
    setNovoCentroCustoTemp('');
    setSelectElementTemp(null);

    mostrarAlert(`Centro de custo alterado e serviços removidos com sucesso!`, 'success');
  };

  // Função para cancelar a troca do centro de custo
  const cancelarTrocaCentroCusto = () => {
    // Fechar modal e limpar estados temporários
    setModalConfirmacaoVisible(false);
    setNovoCentroCustoTemp('');
    setSelectElementTemp(null);
  };

  // Função para carregar todas as equipes (uma vez só)
  const carregarTodasEquipes = async () => {
    if (todasEquipes.length > 0) return; // Já carregados

    setLoadingEquipes(true);

    try {
      const equipesData = await consultarEquipes({ retornaInativos: 'S' });
      setTodasEquipes(equipesData || []);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      mostrarAlert('Erro ao carregar equipes', 'danger');
    } finally {
      setLoadingEquipes(false);
    }
  };

  // Função para filtrar equipes localmente
  const filtrarEquipes = (termo) => {
    if (!termo || termo.length < 2) {
      return [];
    }

    const termoLower = termo.toLowerCase().trim();

    return todasEquipes.filter(equipe => {
      const numOperacional = equipe.numOperacional?.toLowerCase().trim() || '';
      const descricao = equipe.descricao?.toLowerCase() || '';

      return numOperacional.includes(termoLower) || descricao.includes(termoLower);
    }).slice(0, 20); // Limitar a 20 resultados
  };

  // Função para buscar equipes
  const buscarEquipes = async (termo) => {
    if (!termo || termo.length < 2) {
      setEquipesOpcoes([]);
      setEquipeDropdownVisivel(false);
      return;
    }

    // Carregar todas as equipes se ainda não carregou
    if (todasEquipes.length === 0) {
      await carregarTodasEquipes();
    }

    // Filtrar localmente
    const equipesFiltradas = filtrarEquipes(termo);
    setEquipesOpcoes(equipesFiltradas);
    setEquipeDropdownVisivel(true);
    setEquipeSelectedIndex(-1);
  };

  // Debounce para busca de equipes
  const handleNumeroOperacionalChange = (e) => {
    const valor = e.target.value;
    setNumeroOperacionalSelecionado(valor);

    // Se o campo foi limpo, resetar seleção
    if (!valor) {
      setEquipesOpcoes([]);
      setEquipeDropdownVisivel(false);
      return;
    }

    // Limpar timeout anterior
    if (equipeDebounceRef.current) {
      clearTimeout(equipeDebounceRef.current);
    }

    // Configurar novo timeout
    equipeDebounceRef.current = setTimeout(() => {
      buscarEquipes(valor);
    }, 300); // 300ms de delay
  };

  // Selecionar equipe
  const selecionarEquipe = (equipe) => {
    // Mostrar número operacional e descrição no input
    const descricaoEquipe = equipe.descricao?.trim() || '';
    const textoExibicao = `${equipe.numOperacional?.trim()} - ${descricaoEquipe}`;

    setNumeroOperacionalSelecionado(textoExibicao);

    // Atualizar o valor do input diretamente
    const numeroOperacionalInput = document.getElementById('numeroOperacional');
    if (numeroOperacionalInput) {
      numeroOperacionalInput.value = textoExibicao.split(' - ')[ 0 ];
    }

    setEquipeDropdownVisivel(false);
    setEquipeSelectedIndex(-1);
  };

  // Navegação por teclado para equipes
  const handleEquipeKeyDown = (e) => {
    if (!equipeDropdownVisivel || equipesOpcoes.length === 0) return;

    const maxResults = Math.min(equipesOpcoes.length, 10);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setEquipeSelectedIndex(prev => prev < maxResults - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setEquipeSelectedIndex(prev => prev > 0 ? prev - 1 : maxResults - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (equipeSelectedIndex >= 0 && equipeSelectedIndex < maxResults) {
          selecionarEquipe(equipesOpcoes[ equipeSelectedIndex ]);
        }
        break;
      case 'Escape':
        setEquipeDropdownVisivel(false);
        setEquipeSelectedIndex(-1);
        break;
    }
  };

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fechar dropdowns de serviços quando clicar fora
      Object.keys(servicosRefs.current).forEach(key => {
        if (key.startsWith('ref_') && servicosRefs.current[ key ] &&
          !servicosRefs.current[ key ].contains(event.target)) {
          const index = key.replace('ref_', '');
          setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
        }
      });

      // Fechar dropdown de equipes quando clicar fora
      if (equipeRef.current && !equipeRef.current.contains(event.target)) {
        setEquipeDropdownVisivel(false);
        setEquipeSelectedIndex(-1);
      }

      // Fechar dropdown de usuários quando clicar fora
      if (usuarioRef.current && !usuarioRef.current.contains(event.target)) {
        setUsuarioDropdownVisivel(false);
        setUsuarioSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Limpar timeouts dos serviços
      Object.keys(servicosRefs.current).forEach(key => {
        if (key.startsWith('debounce_') && servicosRefs.current[ key ]) {
          clearTimeout(servicosRefs.current[ key ]);
        }
      });
      // Limpar timeout das equipes
      if (equipeDebounceRef.current) {
        clearTimeout(equipeDebounceRef.current);
      }
      // Limpar timeout dos usuários
      if (usuarioDebounceRef.current) {
        clearTimeout(usuarioDebounceRef.current);
      }
    };
  }, []);

  return (
    <>
      <CModal
        visible={visible}
        onClose={() => {
          limparCampos();
          setVisible(false);
        }}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
      <CModalHeader>
        <CModalTitle>
          {modoVisualizacao ? 'Visualizar Ordem de Serviço' : 'Ordem de Serviço'}
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="pb-0">
        {/* Alert de sucesso/erro */}
        {alertVisible && (
          <CAlert
            color={alertColor}
            dismissible
            onClose={() => setAlertVisible(false)}
            className={`d-flex align-items-start mb-3 ${alertColor === 'danger' ? 'border-danger' : ''}`}
            style={{
              animation: 'fadeIn 0.3s',
              boxShadow: alertColor === 'danger' ? '0 4px 12px rgba(220, 53, 69, 0.3)' : '0 4px 12px rgba(25, 135, 84, 0.3)',
              zIndex: 1060
            }}
          >
            <div className="flex-shrink-0 me-2 mt-1">
              {alertColor === 'success' ? (
                <CIcon icon={cilCheckAlt} />
              ) : (
                <CIcon icon={cilX} />
              )}
            </div>
            <div
              className="flex-grow-1"
              dangerouslySetInnerHTML={{ __html: alertMessage }}
            />
          </CAlert>
        )}

        {/* Primeira linha */}
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel htmlFor="numeroOS" className="mb-1">Número OS:</CFormLabel>
            <CFormInput
              id="numeroOS"
              className={camposComErro.numeroOS ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('numeroOS')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.numeroOS && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.numeroOS}
              </div>
            )}
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="unConsumidora" className="mb-1">UN. Consumidora:</CFormLabel>
            <CFormInput
              id="unConsumidora"
              className={camposComErro.unConsumidora ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('unConsumidora')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.unConsumidora && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.unConsumidora}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="status" className="mb-1">Status:</CFormLabel>
            <CFormSelect
              id="status"
              className={camposComErro.status ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('status')}
              disabled={modoVisualizacao}
            >
              <option value="">Selecione...</option>
              <option value="01">Cancelado</option>
              <option value="02">Concluído</option>
              <option value="03">DSR</option>
              <option value="04">Executado Parcial</option>
              <option value="05">Falta Realizar Poda</option>
              <option value="06">Feriado</option>
              <option value="07">Folga</option>
              <option value="08">Improdutivo</option>
              <option value="09">Interrompido</option>
              <option value="10">Interticio</option>
              <option value="11">Parcial</option>
              <option value="12">Poda Feita EMS</option>
              <option value="13">Recolhimento Feito ELCOP</option>
              <option value="14">Reprovado</option>
              <option value="15">Trocar Status</option>
            </CFormSelect>
            {camposComErro.status && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.status}
              </div>
            )}
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="data" className="mb-1">Data:</CFormLabel>
            <CFormInput
              type="date"
              id="data"
              placeholder="dd/mm/aaaa"
              className={camposComErro.data ? 'campo-erro' : ''}
              readOnly={modoVisualizacao}
            />
            {camposComErro.data && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.data}
              </div>
            )}
          </CCol>
            <CCol md={2}>
            <CFormLabel htmlFor="dataConclusao" className="mb-1">Data Conclusão:</CFormLabel>
            <CFormInput
              type="date"
              id="dataConclusao"
              placeholder="dd/mm/aaaa"
              className={camposComErro.dataConclusao ? 'campo-erro' : ''}
              readOnly={modoVisualizacao}
            />
            {camposComErro.dataConclusao && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.dataConclusao}
              </div>
            )}
          </CCol>
        </CRow>

        {/* Segunda linha */}
        <CRow className="mb-4">
          <CCol md={5}>
            <CFormLabel htmlFor="endereco" className="mb-1">Endereço:</CFormLabel>
            <CFormInput
              id="endereco"
              readOnly={ocorrenciaSemEndereco}
              className={`${ocorrenciaSemEndereco ? 'bg-light' : ''} ${camposComErro.endereco ? 'campo-erro' : ''}`}
            />
            {camposComErro.endereco && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.endereco}
              </div>
            )}
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="bairro" className="mb-1">Bairro:</CFormLabel>
            <CFormInput
              id="bairro"
              readOnly={ocorrenciaSemEndereco}
              className={`${ocorrenciaSemEndereco ? 'bg-light' : ''} ${camposComErro.bairro ? 'campo-erro' : ''}`}
            />
            {camposComErro.bairro && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.bairro}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="municipio" className="mb-1">Município:</CFormLabel>
            {modoVisualizacao ? (
              <CFormInput
                id="municipio"
                value={dadosVisualizacao.municipioNome || 'Carregando...'}
                readOnly
                className="bg-light"
              />
            ) : (
              <div style={{ position: 'relative' }} ref={municipioRef}>
                <CFormInput
                  id="municipio"
                  value={municipioSelecionado}
                  onChange={handleMunicipioChange}
                  onKeyDown={handleMunicipioKeyDown}
                  placeholder="Digite o município"
                  autoComplete="off"
                  className={camposComErro.municipio ? 'campo-erro' : ''}
                  readOnly={modoVisualizacao}
                />
                {camposComErro.municipio && (
                  <div className="texto-erro fade-in-error">
                    <CIcon icon={cilX} size="sm" />
                    {camposComErro.municipio}
                  </div>
                )}
                {loadingMunicipios && municipioDropdownVisivel && (
                  <div className="position-absolute" style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                    <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '12px', height: '12px' }}>
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                )}
                {municipioDropdownVisivel && municipiosOpcoes.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                    style={{
                      zIndex: 1050,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      top: '100%'
                    }}
                  >
                    <CListGroup flush>
                      {municipiosOpcoes.slice(0, 10).map((m, idx) => (
                        <CListGroupItem
                          key={m.codigo}
                          className={`cursor-pointer py-1 px-2 ${municipioSelectedIndex === idx ? 'bg-light' : ''}`}
                          style={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            backgroundColor: municipioSelectedIndex === idx ? '#f8f9fa' : 'white',
                            fontSize: '0.8rem'
                          }}
                          onMouseDown={() => selecionarMunicipio(m)}
                          onMouseEnter={(e) => {
                            if (municipioSelectedIndex !== idx) {
                              e.target.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (municipioSelectedIndex !== idx) {
                              e.target.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div>
                            <strong>{m.codigo.trim()}</strong>
                            {m.descricao && (
                              <div className="text-muted small">
                                {m.descricao.trim()} ({m.estado.trim()})
                              </div>
                            )}
                          </div>
                        </CListGroupItem>
                      ))}
                      {municipiosOpcoes.length >= 20 && (
                        <CListGroupItem className="text-center text-muted py-1">
                          <small style={{ fontSize: '0.7rem' }}>Mostrando 20 primeiros resultados. Digite mais caracteres para refinar.</small>
                        </CListGroupItem>
                      )}
                    </CListGroup>
                  </div>
                )}
                {municipioDropdownVisivel && municipiosOpcoes.length === 0 && !loadingMunicipios && municipioSelecionado.length >= 2 && (
                  <div
                    className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                    style={{
                      zIndex: 1050,
                      top: '100%'
                    }}
                  >
                    <div className="p-2 text-muted text-center" style={{ fontSize: '0.8rem' }}>
                      Nenhum município encontrado
                    </div>
                  </div>
                )}
              </div>
            )}
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="cep" className="mb-1">CEP:</CFormLabel>
            <CFormInput
              id="cep"
              readOnly={ocorrenciaSemEndereco}
              className={`${ocorrenciaSemEndereco ? 'bg-light' : ''} ${camposComErro.cep ? 'campo-erro' : ''}`}
              maxLength={9}
            />
            {camposComErro.cep && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.cep}
              </div>
            )}
          </CCol>
        </CRow>

        {/* Quarta linha */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CFormLabel htmlFor="latitude" className="mb-1">Latitude:</CFormLabel>
            <CFormInput
              id="latitude"
              readOnly={ocorrenciaSemEndereco}
              className={`${ocorrenciaSemEndereco ? 'bg-light' : ''} ${camposComErro.latitude ? 'campo-erro' : ''}`}
            />
            {camposComErro.latitude && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.latitude}
              </div>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="longitude" className="mb-1">Longitude:</CFormLabel>
            <CFormInput
              id="longitude"
              readOnly={ocorrenciaSemEndereco}
              className={`${ocorrenciaSemEndereco ? 'bg-light' : ''} ${camposComErro.longitude ? 'campo-erro' : ''}`}
            />
            {camposComErro.longitude && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.longitude}
              </div>
            )}
          </CCol>
        </CRow>

        {/* Terceira linha */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CFormCheck
              id="ocorrenciaSemEndereco"
              label="Ocorrência sem endereço"
              checked={ocorrenciaSemEndereco}
              onChange={e => setOcorrenciaSemEndereco(e.target.checked)}
            />
          </CCol>
        </CRow>

        <hr className="my-4" />
        {/* Quinta linha - Campos de Horário */}
        <CRow >
          <CCol md={12}>
            <h6 >Horários</h6>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={3}>
            <CFormLabel htmlFor="hrInicialDeslocamento" className="mb-1">Hora Inicial do Deslocamento:</CFormLabel>
            <CFormInput
              type="time"
              id="hrInicialDeslocamento"
              className={camposComErro.hrInicialDeslocamento ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrInicialDeslocamento')}
            />
            {camposComErro.hrInicialDeslocamento && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrInicialDeslocamento}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrInicioAtividade" className="mb-1">Hora Início da Atividade:</CFormLabel>
            <CFormInput
              type="time"
              id="hrInicioAtividade"
              className={camposComErro.hrInicioAtividade ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrInicioAtividade')}
            />
            {camposComErro.hrInicioAtividade && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrInicioAtividade}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrInicioIntervalo" className="mb-1">Hora Início de Intervalo:</CFormLabel>
            <CFormInput
              type="time"
              id="hrInicioIntervalo"
              className={camposComErro.hrInicioIntervalo ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrInicioIntervalo')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.hrInicioIntervalo && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrInicioIntervalo}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrFimIntervalo" className="mb-1">Hora Fim do Intervalo:</CFormLabel>
            <CFormInput
              type="time"
              id="hrFimIntervalo"
              className={camposComErro.hrFimIntervalo ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrFimIntervaloHora Fim da Atividade:')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.hrFimIntervalo && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrFimIntervalo}
              </div>
            )}
          </CCol>
        </CRow>
        <CRow className="mb-4 mt-3">
          <CCol md={3}>
            <CFormLabel htmlFor="hrPrimeiroContatoCoi" className="mb-1">Horário de Primeiro Contato com o COI:</CFormLabel>
            <CFormInput
              type="time"
              id="hrPrimeiroContatoCoi"
              className={camposComErro.hrPrimeiroContatoCoi ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrPrimeiroContatoCoi')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.hrPrimeiroContatoCoi && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrPrimeiroContatoCoi}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrAutorizacaoCoi" className="mb-1">Horário de Autorização da Atividade COI:</CFormLabel>
            <CFormInput
              type="time"
              id="hrAutorizacaoCoi"
              className={camposComErro.hrAutorizacaoCoi ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrAutorizacaoCoi')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.hrAutorizacaoCoi && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrAutorizacaoCoi}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrFechamentoCoi" className="mb-1">Horário de Contato de Fechamento com o COI:</CFormLabel>
            <CFormInput
              type="time"
              id="hrFechamentoCoi"
              className={camposComErro.hrFechamentoCoi ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrFechamentoCoi')}
              readOnly={modoVisualizacao}
            />
            {camposComErro.hrFechamentoCoi && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrFechamentoCoi}
              </div>
            )}
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="hrFimAtividade" className="mt-3">Hora Fim da Atividade:</CFormLabel>
            <CFormInput
              type="time"
              id="hrFimAtividade"
              className={camposComErro.hrFimAtividade ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrFimAtividade')}
            />
            {camposComErro.hrFimAtividade && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrFimAtividade}
              </div>
            )}
          </CCol>
        </CRow>
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel htmlFor="hrFimDeslocamento" className="mb-1">Horário Final do Deslocamento:</CFormLabel>
            <CFormInput
              type="time"
              id="hrFimDeslocamento"
              className={camposComErro.hrFimDeslocamento ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('hrFimDeslocamento')}
            />
            {camposComErro.hrFimDeslocamento && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.hrFimDeslocamento}
              </div>
            )}
          </CCol>
        </CRow>
             <hr className="my-4" />
        {/* Sexta linha */}
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel htmlFor="numeroOperacional" className="mb-1">Número Operacional:</CFormLabel>
            {modoVisualizacao ? (
              <CFormInput
                id="numeroOperacional"
                value={dadosVisualizacao.numeroOperacionalNome || 'Carregando...'}
                readOnly
                className="bg-light"
              />
            ) : (
              <div className="position-relative" ref={equipeRef}>
                <CFormInput
                  id="numeroOperacional"
                  value={numeroOperacionalSelecionado}
                  onChange={handleNumeroOperacionalChange}
                  onKeyDown={handleEquipeKeyDown}
                  placeholder="Digite número ou descrição..."
                  autoComplete="off"
                  className={camposComErro.numeroOperacional ? 'campo-erro' : ''}
                  readOnly={modoVisualizacao}
                />
                {camposComErro.numeroOperacional && (
                  <div className="texto-erro fade-in-error">
                    <CIcon icon={cilX} size="sm" />
                    {camposComErro.numeroOperacional}
                  </div>
                )}
                {loadingEquipes && equipeDropdownVisivel && (
                  <div className="position-absolute" style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                    <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '12px', height: '12px' }}>
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                )}
                {equipeDropdownVisivel && equipesOpcoes.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                    style={{
                      zIndex: 1050,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      top: '100%'
                    }}
                  >
                    <CListGroup flush>
                      {equipesOpcoes.slice(0, 10).map((equipeOpcao, opcaoIndex) => (
                        <CListGroupItem
                          key={opcaoIndex}
                          className={`cursor-pointer py-1 px-2 ${equipeSelectedIndex === opcaoIndex ? 'bg-light' : ''}`}
                          style={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            backgroundColor: equipeSelectedIndex === opcaoIndex ? '#f8f9fa' : 'white',
                            fontSize: '0.8rem'
                          }}
                          onClick={() => selecionarEquipe(equipeOpcao)}
                          onMouseEnter={(e) => {
                            if (equipeSelectedIndex !== opcaoIndex) {
                              e.target.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (equipeSelectedIndex !== opcaoIndex) {
                              e.target.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div>
                            <strong>{equipeOpcao.numOperacional?.trim()}</strong>
                            {equipeOpcao.descricao && (
                              <div className="text-muted small">
                                {equipeOpcao.descricao.trim()}
                              </div>
                            )}
                            <small className={`${equipeOpcao.ativo === 'S' ? 'text-success' : 'text-danger'}`}>
                              {equipeOpcao.ativo === 'S' ? 'Ativo' : 'Inativo'}
                            </small>
                          </div>
                        </CListGroupItem>
                      ))}
                      {equipesOpcoes.length >= 20 && (
                        <CListGroupItem className="text-center text-muted py-1">
                          <small style={{ fontSize: '0.7rem' }}>Mostrando 20 primeiros resultados. Digite mais caracteres para refinar.</small>
                        </CListGroupItem>
                      )}
                    </CListGroup>
                  </div>
                )}
                {equipeDropdownVisivel && equipesOpcoes.length === 0 && !loadingEquipes && numeroOperacionalSelecionado.length >= 2 && (
                  <div
                    className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                    style={{
                      zIndex: 1050,
                      top: '100%'
                    }}
                  >
                    <div className="p-2 text-muted text-center" style={{ fontSize: '0.8rem' }}>
                      Nenhuma equipe encontrada
                    </div>
                  </div>
                )}
              </div>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="centroDeCustos" className="mb-1">Centro de Custos: </CFormLabel>
            {modoVisualizacao ? (
              <CFormInput
                id="centroDeCustos"
                value={dadosVisualizacao.centroCustoNome || 'Carregando...'}
                readOnly
                className="bg-light"
              />
            ) : (
              <div className="position-relative">
                {loadingCentroCusto ? (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <span>Carregando centros de custo...</span>
                  </div>
                ) : (
                  <CFormSelect
                    id="centroDeCustos"
                    value={centroCustoSelecionado}
                    onChange={handleCentroCustoChange}
                    className={camposComErro.centroDeCustos ? 'campo-erro' : ''}
                    disabled={modoVisualizacao}
                  >
                    <option value="">Selecione um centro de custo</option>
                    {centroCustoOpcoes.map((centroCusto, index) => (
                      <option key={index} value={centroCusto.centroCusto}>
                        {centroCusto.centroCusto?.trim()} - {centroCusto.descricaoCCusto?.trim()}
                      </option>
                    ))}
                  </CFormSelect>
                )}
                {loadingServicos && centroCustoSelecionado && (
                  <div className="mt-2 text-info">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      <small>Carregando serviços do centro de custo...</small>
                    </div>
                  </div>
                )}
                {camposComErro.centroDeCustos && (
                  <div className="texto-erro fade-in-error">
                    <CIcon icon={cilX} size="sm" />
                    {camposComErro.centroDeCustos}
                  </div>
                )}
              </div>
            )}
          </CCol>
        </CRow>

        {/* Seção de Usuários */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Usuários</h6>
            <CButton
              color="dark"
              size="sm"
              onClick={adicionarUsuario}
              disabled={modoVisualizacao}
              style={{ display: modoVisualizacao ? 'none' : 'inline-block' }}
            >
              Adicionar Usuário
            </CButton>
          </div>
          {camposComErro.usuarios && (
            <div className="texto-erro fade-in-error mb-2">
              <CIcon icon={cilX} size="sm" />
              {camposComErro.usuarios}
            </div>
          )}
          {camposComErro.lider && (
            <div className="texto-erro fade-in-error mb-2">
              <CIcon icon={cilX} size="sm" />
              {camposComErro.lider}
            </div>
          )}

          <CCard className="border">
            <CCardBody className="p-3">
              <CRow className="mb-3 align-items-center">
                <CCol md={7}>
                  <div className="position-relative" ref={usuarioRef}>
                    <CFormInput
                      value={usuarioSelecionado}
                      onChange={handleUsuarioChange}
                      onKeyDown={handleUsuarioKeyDown}
                      placeholder="Digite nome, matrícula ou CPF do usuário"
                      autoComplete="off"
                    />
                    {loadingUsuarios && usuarioDropdownVisivel && (
                      <div className="position-absolute" style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '12px', height: '12px' }}>
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                      </div>
                    )}
                    {usuarioDropdownVisivel && usuariosOpcoes.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                        style={{
                          zIndex: 1050,
                          maxHeight: '150px',
                          overflowY: 'auto',
                          top: '100%'
                        }}
                      >
                        <CListGroup flush>
                          {usuariosOpcoes.slice(0, 10).map((u, idx) => (
                            <CListGroupItem
                              key={u.matricula}
                              className={`cursor-pointer py-1 px-2 ${usuarioSelectedIndex === idx ? 'bg-light' : ''}`}
                              style={{
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                backgroundColor: usuarioSelectedIndex === idx ? '#f8f9fa' : 'white',
                                fontSize: '0.8rem'
                              }}
                              onMouseDown={() => selecionarUsuario(u)}
                              onMouseEnter={(e) => {
                                if (usuarioSelectedIndex !== idx) {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (usuarioSelectedIndex !== idx) {
                                  e.target.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <div>
                                <strong>{u.nome?.trim()}</strong>
                                <div className="text-muted small">
                                  Mat: {u.matricula} | CPF: {u.cpf} | Tipo: {u.tipoUsuario}
                                </div>
                              </div>
                            </CListGroupItem>
                          ))}
                          {usuariosOpcoes.length >= 20 && (
                            <CListGroupItem className="text-center text-muted py-1">
                              <small style={{ fontSize: '0.7rem' }}>Mostrando 20 primeiros resultados. Digite mais caracteres para refinar.</small>
                            </CListGroupItem>
                          )}
                        </CListGroup>
                      </div>
                    )}
                    {usuarioDropdownVisivel && usuariosOpcoes.length === 0 && !loadingUsuarios && usuarioSelecionado.length >= 2 && (
                      <div
                        className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                        style={{
                          zIndex: 1050,
                          top: '100%'
                        }}
                      >
                        <div className="p-2 text-muted text-center" style={{ fontSize: '0.8rem' }}>
                          Nenhum usuário encontrado
                        </div>
                      </div>
                    )}
                  </div>
                </CCol>
                <CCol md={3} className="text-center">
                  <CFormCheck
                    id="checkLider"
                    label="Líder"
                    checked={isLider}
                    onChange={(e) => setIsLider(e.target.checked)}
                    style={{
                      fontSize: '1.5rem',
                      '--cui-form-check-input-width': '1.7em',
                      '--cui-form-check-input-height': '1.7em',
                      marginLeft: '0.5rem'
                    }}
                  />
                </CCol>
                <CCol md={2}></CCol>
              </CRow>

              <CTable hover className="mb-0" responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Usuário</CTableHeaderCell>
                    <CTableHeaderCell>Matrícula</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Líder</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Ação</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {usuarios.map((usuario, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{usuario.nome}</CTableDataCell>
                      <CTableDataCell>{usuario.matricula}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {usuario.lider ? (
                          <CIcon icon={cilCheckAlt} className="text-success" />
                        ) : (
                          <CIcon icon={cilX} className="text-danger" />
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="light"
                          size="sm"
                          onClick={() => removerUsuario(index)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </div>

        {/* Seção de serviços */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Serviços</h6>
            <CButton
              color="dark"
              size="sm"
              onClick={adicionarServico}
              disabled={modoVisualizacao}
              style={{ display: modoVisualizacao ? 'none' : 'inline-block' }}
            >
              Adicionar Serviço
            </CButton>
          </div>
          {camposComErro.servicos && (
            <div className="texto-erro fade-in-error mb-2">
              <CIcon icon={cilX} size="sm" />
              {camposComErro.servicos}
            </div>
          )}

          <CCard className="border">
            <CCardHeader className="bg-light py-2">
              <CRow className="align-items-center">
                <CCol md={2}>
                  <span className="fw-semibold">Serviço</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Observação</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Valor Grupo</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Valor Serviço</span>
                </CCol>
                <CCol md={1}>
                  <span className="fw-semibold">Quantidade</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Fotos</span>
                </CCol>
                <CCol md={1} className="text-center">
                  <span className="fw-semibold">Ação</span>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody className="p-3">
              {servicos.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <small>Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.</small>
                </div>
              ) : (
                servicos.map((servico, index) => (
                  <CRow key={index} className="align-items-start mb-3 border-bottom pb-3">
                    <CCol md={2}>
                      {modoVisualizacao ? (
                        <CFormInput
                          value={
                            dadosVisualizacao.servicosNomes && dadosVisualizacao.servicosNomes[index] 
                              ? dadosVisualizacao.servicosNomes[index].servicoNome || 'Carregando...'
                              : 'Carregando...'
                          }
                          size="sm"
                          readOnly
                          className="bg-light"
                        />
                      ) : (
                        <div
                          className="position-relative"
                          ref={el => servicosRefs.current[ `ref_${index}` ] = el}
                        >
                          <CFormInput
                            value={servico.servico}
                            onChange={(e) => handleServicoChange(e, index)}
                            onKeyDown={(e) => handleServicoKeyDown(e, index)}
                            size="sm"
                            placeholder={centroCustoSelecionado ? "Digite ID ou descrição do serviço..." : "Selecione um centro de custo primeiro"}
                            autoComplete="off"
                            disabled={!centroCustoSelecionado || modoVisualizacao}
                            readOnly={modoVisualizacao}
                            style={{
                              backgroundColor: !centroCustoSelecionado ? '#f8f9fa' : 'white',
                              cursor: !centroCustoSelecionado ? 'not-allowed' : 'text'
                            }}
                          />
                          {loadingServicos && servicoDropdownVisivel[ index ] && (
                            <div className="position-absolute" style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                              <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '12px', height: '12px' }}>
                                <span className="visually-hidden">Carregando...</span>
                              </div>
                            </div>
                          )}
                          {servicoDropdownVisivel[ index ] && servicosOpcoes.length > 0 && (
                            <div
                              className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                              style={{
                                zIndex: 1050,
                                maxHeight: '150px',
                                overflowY: 'auto',
                                top: '100%'
                              }}
                            >
                              <CListGroup flush>
                                {servicosOpcoes.slice(0, 10).map((servicoOpcao, opcaoIndex) => (
                                  <CListGroupItem
                                    key={opcaoIndex}
                                    className={`cursor-pointer py-1 px-2 ${servicoSelectedIndex[ index ] === opcaoIndex ? 'bg-light' : ''}`}
                                    style={{
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s',
                                      backgroundColor: servicoSelectedIndex[ index ] === opcaoIndex ? '#f8f9fa' : 'white',
                                      fontSize: '0.8rem'
                                    }}
                                    onClick={() => selecionarServico(servicoOpcao, index)}
                                    onMouseEnter={(e) => {
                                      if (servicoSelectedIndex[ index ] !== opcaoIndex) {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (servicoSelectedIndex[ index ] !== opcaoIndex) {
                                        e.target.style.backgroundColor = 'white';
                                      }
                                    }}
                                  >
                                    <div>
                                      <strong>{servicoOpcao.idServico?.trim()}</strong>
                                      {servicoOpcao.siglaUp && (
                                        <div className="text-primary small fw-bold">Sigla UP: {servicoOpcao.siglaUp.trim()}</div>
                                      )}
                                      {servicoOpcao.descricaoServico && (
                                        <div className="text-muted small">
                                          {servicoOpcao.descricaoServico.trim()}
                                        </div>
                                      )}
                                      {servicoOpcao.valorGrupo > 0 && (
                                        <small className="text-success">
                                          Valor: R$ {servicoOpcao.valorGrupo.toFixed(2)}
                                        </small>
                                      )}
                                    </div>
                                  </CListGroupItem>
                                ))}
                                {servicosOpcoes.length >= 20 && (
                                  <CListGroupItem className="text-center text-muted py-1">
                                    <small style={{ fontSize: '0.7rem' }}>Mostrando 20 primeiros resultados. Digite mais caracteres para refinar.</small>
                                  </CListGroupItem>
                                )}
                              </CListGroup>
                            </div>
                          )}
                          {servicoDropdownVisivel[ index ] && servicosOpcoes.length === 0 && !loadingServicos && servico.servico.length >= 2 && (
                            <div
                              className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
                              style={{
                                zIndex: 1050,
                                top: '100%'
                              }}
                            >
                              <div className="p-2 text-muted text-center" style={{ fontSize: '0.8rem' }}>
                                Nenhum serviço encontrado
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.observacao}
                        onChange={(e) => atualizarServico(index, 'observacao', e.target.value)}
                        size="sm"
                        placeholder="Observação"
                        readOnly={modoVisualizacao}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.valorGrupo}
                        onChange={(e) => atualizarServico(index, 'valorGrupo', e.target.value)}
                        size="sm"
                        placeholder="Valor"
                        type="text"
                        readOnly
                        className="bg-light" // Adiciona um estilo visual para campos readonly
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.valorServico}
                        onChange={(e) => atualizarServico(index, 'valorServico', e.target.value)}
                        size="sm"
                        placeholder="Valor"
                        type="text"
                        readOnly
                        className="bg-light" // Adiciona um estilo visual para campos readonly
                        />
                      </CCol>
                      <CCol md={1}>
                        <CFormInput
                        value={servico.quantidade}
                        onChange={(e) => atualizarServico(index, 'quantidade', e.target.value)}
                        size="sm"
                        placeholder="Qtd"
                        type="number"
                        min="1"
                        readOnly={modoVisualizacao}
                        />
                      </CCol>
                      <CCol md={2}>
                        <div className="mb-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e, index)}
                          style={{ display: 'none' }}
                          id={`fileInput-${index}`}
                        />
                        <CButton
                          color="outline-primary"
                          size="sm"
                          onClick={() => document.getElementById(`fileInput-${index}`).click()}
                          className="mb-2"
                          style={{ display: modoVisualizacao ? 'none' : 'inline-flex' }}
                        >
                          <CIcon icon={cilCamera} className="me-1" />
                          Adicionar
                        </CButton>
                        </div>
                        {servico.fotos && servico.fotos.length > 0 && servico.fotos.some(f => f.base64) ? (
                        <div className="d-flex flex-wrap gap-1">
                          {servico.fotos.map((foto, fotoIndex) => (
                          foto.base64 ? (
                            <div key={fotoIndex} className="position-relative" style={{ width: '40px', height: '40px' }}>
                            <img
                              src={`data:image/jpeg;base64,${foto.base64}`}
                              style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #dee2e6'
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute"
                              style={{
                              top: '-5px',
                              right: '-5px',
                              width: '18px',
                              height: '18px',
                              padding: '0',
                              borderRadius: '50%',
                              fontSize: '10px',
                              lineHeight: '1'
                              }}
                              onClick={() => removerFoto(index, fotoIndex)}
                              title="Remover foto"
                            >
                              ×
                            </button>
                            </div>
                          ) : null
                          ))}
                        </div>
                        ) : null}
                        {servico.fotos && servico.fotos.length > 0 && (
                        <small className="text-muted d-block mt-1">
                          {servico.fotos.length} foto{servico.fotos.length > 1 ? 's' : ''} adicionada{servico.fotos.length > 1 ? 's' : ''}
                        </small>
                        )}
                      </CCol>
                      <CCol md={1} className="text-center">
                        <CButton
                        color="light"
                        size="sm"
                        onClick={() => removerServico(index)}
                        title="Remover serviço"
                        >
                        <CIcon icon={cilX} />
                        </CButton>
                      </CCol>
                      </CRow>
                    ))
                    )}
                  </CCardBody>
                  </CCard>
                </div>
                </CModalBody>
                <CModalFooter className="bg-light border-top">
                <CButton
                  color="secondary"
                  onClick={() => {
            if (!modoVisualizacao) {
              limparCampos();
            }
            setVisible(false);
          }}
          className="me-2"
          disabled={isSubmitting}
        >
          {modoVisualizacao ? 'Fechar' : 'Cancelar'}
        </CButton>
        {!modoVisualizacao && (
          <CButton
            color="primary"
            onClick={async () => {
            // Ativar loading
            setIsSubmitting(true);
            if (setLoadingParent) setLoadingParent(true);

            try {
              // Função para validar campos obrigatórios
              const validarCampos = () => {
                const erros = {};

                // Limpar erros anteriores
                setCamposComErro({});

                // Campos sempre obrigatórios
                const numeroOs = document.getElementById('numeroOS').value.trim();
                const unConsumidora = document.getElementById('unConsumidora').value.trim();
                const status = document.getElementById('status').value;
                const data = document.getElementById('data').value;
                const dataConclusao = document.getElementById('dataConclusao').value;
                const numeroOperacional = document.getElementById('numeroOperacional').value.trim();
                const municipio = document.getElementById('municipio').value.trim();
                const hrInicialDeslocamento = document.getElementById('hrInicialDeslocamento').value;
                const hrInicioAtividade = document.getElementById('hrInicioAtividade').value;
                const hrFimAtividade = document.getElementById('hrFimAtividade').value;
                const hrFimDeslocamento = document.getElementById('hrFimDeslocamento').value;

                // Validar campos sempre obrigatórios
                // Pelo menos um dos campos deve ser preenchido
                if (!numeroOs && !unConsumidora) {
                  erros.numeroOS = 'Preencha pelo menos um dos campos: Número OS ou UN. Consumidora';
                  erros.unConsumidora = 'Preencha pelo menos um dos campos: Número OS ou UN. Consumidora';
                }

                if (!status) erros.status = 'Este campo é obrigatório';
                if (!data) erros.data = 'Este campo é obrigatório';
                if (!dataConclusao) erros.dataConclusao = 'Este campo é obrigatório';
                if (!numeroOperacional) erros.numeroOperacional = 'Este campo é obrigatório';
                if (!municipio) erros.municipio = 'Este campo é obrigatório';
                if (!centroCustoSelecionado) erros.centroDeCustos = 'Este campo é obrigatório';
                if (!hrInicialDeslocamento) erros.hrInicialDeslocamento = 'Este campo é obrigatório';
                if (!hrInicioAtividade) erros.hrInicioAtividade = 'Este campo é obrigatório';
                if (!hrFimAtividade) erros.hrFimAtividade = 'Este campo é obrigatório';
                if (!hrFimDeslocamento) erros.hrFimDeslocamento = 'Este campo é obrigatório';

                // Campos condicionais - só obrigatórios se NÃO for ocorrência sem endereço
                if (!ocorrenciaSemEndereco) {
                  const endereco = document.getElementById('endereco').value.trim();
                  const bairro = document.getElementById('bairro').value.trim();

                  if (!endereco) erros.endereco = 'Este campo é obrigatório';
                  if (!bairro) erros.bairro = 'Este campo é obrigatório';
                }

                // Validar se tem pelo menos um usuário
                if (usuarios.length === 0) {
                  erros.usuarios = 'Pelo menos um usuário deve ser adicionado';
                }

                // Validar se tem pelo menos um serviço
                if (servicos.length === 0) {
                  erros.servicos = 'Pelo menos um serviço deve ser adicionado';
                }

                // Validar se pelo menos um usuário é líder
                const temLider = usuarios.some(u => u.lider);
                if (usuarios.length > 0 && !temLider) {
                  erros.lider = 'Pelo menos um usuário deve ser marcado como líder';
                }

                // Definir erros nos campos
                if (Object.keys(erros).length > 0) {
                  setCamposComErro(erros);
                }

                return Object.keys(erros).length > 0;
              };

              // Executar validação
              const temErros = validarCampos();

              if (temErros) {
                mostrarAlert('Por favor, corrija os campos destacados em vermelho.', 'danger');
                setIsSubmitting(false);
                if (setLoadingParent) setLoadingParent(false);
                return;
              }

              // Coleta dos dados dos inputs (após validação)
              const numeroOs = document.getElementById('numeroOS').value.trim();
              const unidadeConsumidora = document.getElementById('unConsumidora').value.trim();
              const status = document.getElementById('status').value;
              const data = document.getElementById('data').value.replace(/-/g, '');
              const endereco = ocorrenciaSemEndereco ? '' : document.getElementById('endereco').value.trim();
              const bairro = ocorrenciaSemEndereco ? '' : document.getElementById('bairro').value.trim();
              const codMunicipio = document.getElementById('municipio').value.trim().split('-')[ 0 ];
              const cep = ocorrenciaSemEndereco ? '' : document.getElementById('cep').value.trim().replace(/-/g, '');
              const latitude = ocorrenciaSemEndereco ? '' : document.getElementById('latitude').value.trim();
              const longitude = ocorrenciaSemEndereco ? '' : document.getElementById('longitude').value.trim();
              const dataConclusao = document.getElementById('dataConclusao').value.replace(/-/g, '');
              const centroCusto = centroCustoSelecionado;
              const numOperacional = document.getElementById('numeroOperacional').value.trim().split('-')[ 0 ];
              
              // Novos campos de horário - conversão para formato 00:00:00
              const hrInicialDeslocamento = document.getElementById('hrInicialDeslocamento').value + ':00';
              const hrInicioAtividade = document.getElementById('hrInicioAtividade').value + ':00';
              const hrInicioIntervalo = document.getElementById('hrInicioIntervalo').value ? document.getElementById('hrInicioIntervalo').value + ':00' : '';
              const hrFimIntervalo = document.getElementById('hrFimIntervalo').value ? document.getElementById('hrFimIntervalo').value + ':00' : '';
              const hrPrimeiroContatoCoi = document.getElementById('hrPrimeiroContatoCoi').value ? document.getElementById('hrPrimeiroContatoCoi').value + ':00' : '';
              const hrAutorizacaoCoi = document.getElementById('hrAutorizacaoCoi').value ? document.getElementById('hrAutorizacaoCoi').value + ':00' : '';
              const hrFechamentoCoi = document.getElementById('hrFechamentoCoi').value ? document.getElementById('hrFechamentoCoi').value + ':00' : '';
              const hrFimAtividade = document.getElementById('hrFimAtividade').value + ':00';
              const hrFimDeslocamento = document.getElementById('hrFimDeslocamento').value + ':00';

              // Pega o CPF e matrícula do usuário logado do localStorage
              const cpfInclusao = localStorage.getItem('cpf') || '00000000000';
              const matInclusao = localStorage.getItem('matricula') || '000000';

              // Monta array de usuários
              const usuariosReq = usuarios.map(u => ({
                cpf: u.cpf || '00000000000',
                matricula: u.matricula || '000000',
                lider: u.lider ? 'S' : 'N'
              }));

              // Monta array de serviços
              const servicosReq = servicos.map(s => ({
                idServico: s.servicoSelecionado?.idServico || s.servico,
                observacao: s.observacao || '',
                quantidade: Number(s.quantidade) || 0,
                valPontos: Number(s.valorServico) || 0,
                valGrupo: Number(s.valorGrupo) || 0,
                fotos: s.fotos || []
              }));

              const body = {
                numeroOs,
                unidadeConsumidora,
                status,
                data,
                semEndereco: ocorrenciaSemEndereco ? 'S' : 'N',
                endereco,
                bairro,
                codMunicipio,
                cep,
                latitude,
                longitude,
                dataConclusao,
                centroCusto,
                numOperacional,
                cpfInclusao,
                matInclusao,
                hrInicialDeslocamento,
                hrInicioAtividade,
                hrInicioIntervalo,
                hrFimIntervalo,
                hrPrimeiroContatoCoi,
                hrAutorizacaoCoi,
                hrFechamentoCoi,
                hrFimAtividade,
                hrFimDeslocamento,
                usuarios: usuariosReq,
                servicos: servicosReq,
                incrementos: []
              };

              const response = await httpRequest('/incluirOcorrencia', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
                },
                body: JSON.stringify(body)
              });
              const result = await response.json();

              if (response.ok) {
                mostrarAlert('Ordem de serviço registrada com sucesso!', 'success');

                if (onSuccess && typeof onSuccess === 'function') {
                  onSuccess();
                }

                setTimeout(() => {
                  limparCampos();
                  setVisible(false);
                }, 1000);
              } else {
                const errorMsg = result.message || 'Erro ao registrar ordem de serviço. Tente novamente.';
                mostrarAlert(errorMsg, 'danger');
              }
            } catch (err) {
              console.error('Erro:', err);
              mostrarAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'danger');
            } finally {
              // Desativar loading
              setIsSubmitting(false);
              if (setLoadingParent) setLoadingParent(false);
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Processando...
            </>
          ) : (
            'Registrar'
          )}
        </CButton>
        )}
      </CModalFooter>
    </CModal>

    {/* Modal de Confirmação para Troca de Centro de Custo */}
    <CModal
      visible={modalConfirmacaoVisible}
      onClose={cancelarTrocaCentroCusto}
      size="md"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Confirmar Troca de Centro de Custo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex align-items-start">
          <div className="flex-shrink-0 me-3">
            <div 
              className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <CIcon icon={cilWarning} size="lg" className="text-white" />
            </div>
          </div>
          <div>
            <h6 className="mb-2 text-warning">Atenção!</h6>
            <p className="mb-3">
              Você já possui <strong>{servicos.length} serviço{servicos.length > 1 ? 's' : ''}</strong> adicionado{servicos.length > 1 ? 's' : ''}.
            </p>
            <p className="mb-0">
              Ao trocar o centro de custo, <strong>todos os serviços serão removidos</strong>.
            </p>
            <p className="mt-2 mb-0">
              <strong>Deseja continuar?</strong>
            </p>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton 
          color="secondary" 
          variant="outline"
          onClick={cancelarTrocaCentroCusto}
        >
          Cancelar
        </CButton>
        <CButton 
          color="warning"
          onClick={confirmarTrocaCentroCusto}
        >
          Sim, trocar centro de custo
        </CButton>
      </CModalFooter>
    </CModal>
    </>
  );
};

export default ServicosModal;
