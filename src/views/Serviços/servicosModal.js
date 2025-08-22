import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Este componente é responsável pelo modal de edição de serviços.
// Todas as chamadas à API devem ser feitas via os serviços em src/services para evitar duplicidade e facilitar manutenção.
import './servicosModal.css';
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
import { cilX, cilCheckAlt, cilWarning, cilCamera } from '@coreui/icons';
import { consultarCentroCusto } from '../../services/centroCustoService';
import servicosService, { consultarServicosProtheus } from '../../services/servicosService';
import servicosCacheService from '../../services/servicosCacheService';
import { consultarEquipes } from '../../services/equipesService';
import { consultarUsuariosEoperaX, filtrarUsuarios } from '../../services/popularTabela';
import ocorrenciasService from '../../services/ocorrenciasService';
import municipiosService from '../../services/municipiosService';
import fotosService from '../../services/fotosService';
import ModalFotos from './modalFotos';

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
  modoEdicao = false,
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
  const [ numeroOperacionalOpcoes, setNumeroOperacionalOpcoes ] = useState([]);
  const [ centroCustoDropdownVisivel, setCentroCustoDropdownVisivel ] = useState(false);
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

  // Estados para modal de fotos
  const [ modalFotosVisible, setModalFotosVisible ] = useState(false);
  const [ fotoServicoAtual, setFotoServicoAtual ] = useState({
    index: -1,
    idOcorrencia: '',
    itemServico: '',
    servicoDescricao: ''
  });

  // Função para carregar todos os municípios (uma vez só)
  // Função para carregar todos os municípios - otimizada para usar serviço centralizado
  const carregarTodosMunicipios = useCallback(async () => {
    // Busca todos os municípios apenas se ainda não estiverem carregados
    if (todosMunicipios.length > 0) return todosMunicipios;
    
    setLoadingMunicipios(true);
    try {
      // Usando o serviço centralizado para evitar sobrecarga no backend
      const municipios = await municipiosService.buscarTodosMunicipios();
      setTodosMunicipios(municipios);
      return municipios;
    } catch (e) {
      console.error('Erro ao carregar municípios:', e);
      setTodosMunicipios([]);
      return [];
    } finally {
      setLoadingMunicipios(false);
    }
  }, [todosMunicipios.length]);

  // Funções para buscar dados por ID para visualização
  const buscarCentroCustoPorId = async (centroCustoId) => {
  // Busca o nome do centro de custo pelo ID usando o serviço centralizado
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
  // Busca o nome do número operacional pelo ID usando o serviço centralizado
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

  const buscarMunicipioPorCodigo = useCallback(async (codigoMunicipio) => {
    // Busca o nome do município pelo código, usando cache local e serviço centralizado
    try {
      // Verifica primeiro no cache local
      if (todosMunicipios.length > 0) {
        const municipio = todosMunicipios.find(m => m.codigo === codigoMunicipio);
        if (municipio) {
          return `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
        }
      }
      
      // Se não encontrou no cache, busca via serviço
      const municipio = await municipiosService.buscarMunicipioPorCodigo(codigoMunicipio);
      if (municipio) {
        return `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
      }
      
      return codigoMunicipio; // Retorna o código se não encontrar
    } catch (error) {
      console.error('Erro ao buscar município:', error);
      return codigoMunicipio;
    }
  }, [todosMunicipios]);

  const buscarServicosPorIds = async (servicosArray) => {
  // OTIMIZADO: Usa cache global em vez de múltiplas requisições
  // Antes: 300 serviços = 300 requisições → Agora: 1 cache + busca local
    if (!servicosArray || !Array.isArray(servicosArray)) return [];
    
    try {
      // Usar o serviço de cache otimizado
      return await servicosCacheService.buscarServicosPorIds(servicosArray);
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

  // Função para resetar campos quando modal fechar
  const resetarCampos = () => {
    // Resetar estados principais
    setCentroCustoSelecionado('');
    setNumeroOperacionalSelecionado('');
    setMunicipioSelecionado('');
    setUsuarios([]);
    setServicos([{ servico: '', observacao: '', valorGrupo: '', valorServico: '', quantidade: '1' }]);
    setOcorrenciaSemEndereco(false);
    setDadosVisualizacao({});
    
    // Resetar opções de dropdowns
    setCentroCustoOpcoes([]);
    setServicosOpcoes([]);
    setNumeroOperacionalOpcoes([]);
    
    // Resetar visibilidade de dropdowns
    setCentroCustoDropdownVisivel(false);
    setServicoDropdownVisivel([]);
    setEquipeDropdownVisivel(false);
    setMunicipioDropdownVisivel(false);
    setUsuarioDropdownVisivel(false);
    
    // Resetar campos de erro
    setCamposComErro({});
  };

  // Função auxiliar para buscar serviço por ID ou código usando cache
  const buscarServicoNoCachePorIdOuCodigo = async (idOuCodigo) => {
    try {
      // Primeiro buscar no cache por ID
      let servico = await servicosCacheService.buscarServicoPorId(idOuCodigo);
      
      if (!servico) {
        // Se não encontrou por ID, buscar por código no cache completo
        const todosServicosCache = await servicosCacheService.obterTodosServicos();
        servico = todosServicosCache.find(s => 
          s.codServico?.trim() === idOuCodigo?.trim()
        );
      }
      
      return servico;
    } catch (error) {
      console.warn('Erro ao buscar serviço no cache:', error);
      return null;
    }
  };

  // UseEffect removido - cache será inicializado na página principal de serviços

  // UseEffect para resetar campos quando modal fechar
  useEffect(() => {
    if (!visible) {
      resetarCampos();
      
      // Resetar todas as referências e flags para evitar loops
      centroCustoInicializado.current = false;
      jaExecutouGarantia.current = false;
      
      // Limpar timeouts para evitar atualizações tardias
      if (usuarioDebounceRef.current) clearTimeout(usuarioDebounceRef.current);
      if (equipeDebounceRef.current) clearTimeout(equipeDebounceRef.current);
      if (municipioDebounceRef.current) clearTimeout(municipioDebounceRef.current);
      
      Object.keys(servicosRefs.current).forEach(key => {
        if (key.startsWith('debounce_') && servicosRefs.current[key]) {
          clearTimeout(servicosRefs.current[key]);
        }
      });
    }
  }, [visible]);

  // Função auxiliar para garantir que os valores dos serviços estejam preenchidos
  const garantirValoresServicos = () => {
    if (servicos.length > 0) {
      const servicosAtualizados = servicos.map(servico => {
        // Verificar se os valores estão vazios (string vazia ou não definidos)
        const valorGrupoVazio = !servico.valorGrupo && servico.valorGrupo !== 0;
        const valorServicoVazio = !servico.valorServico && servico.valorServico !== 0;
      
        let novoValorGrupo = servico.valorGrupo;
        let novoValorServico = servico.valorServico;
        
        // Primeiro tentar pegar do servicoSelecionado
        if (servico.servicoSelecionado) {
          if (valorGrupoVazio && servico.servicoSelecionado.valorGrupo !== undefined) {
            novoValorGrupo = servico.servicoSelecionado.valorGrupo.toString();
          }
          
          if (valorServicoVazio && servico.servicoSelecionado.valorPontos !== undefined) {
            novoValorServico = servico.servicoSelecionado.valorPontos.toString();
          }
        }
        
        // Se ainda estiver vazio, verificar nos dados originais da ocorrência
        if ((valorGrupoVazio || valorServicoVazio) && modoEdicao && dadosOcorrencia?.servicos) {
          // Tentar encontrar por idServico
          let servicoOriginal = dadosOcorrencia.servicos.find(s => 
            s.idServico === servico.servico);
            
          // Se não encontrou, tentar buscar pela descrição ou outras propriedades
          if (!servicoOriginal && servico.servicoSelecionado?.descricaoServico) {
            servicoOriginal = dadosOcorrencia.servicos.find(s => 
              s.descricaoServico === servico.servicoSelecionado.descricaoServico);
          }
            
          if (servicoOriginal) {
            // Atualizar valorGrupo se necessário
            if (valorGrupoVazio) {
              if (servicoOriginal.valGrupo !== undefined && servicoOriginal.valGrupo !== null) {
                novoValorGrupo = servicoOriginal.valGrupo.toString();
              } else if (servicoOriginal.valorGrupo !== undefined && servicoOriginal.valorGrupo !== null) {
                novoValorGrupo = servicoOriginal.valorGrupo.toString();
              }
            }
            
            // Atualizar valorServico se necessário
            if (valorServicoVazio) {
              if (servicoOriginal.valPontos !== undefined && servicoOriginal.valPontos !== null) {
                novoValorServico = servicoOriginal.valPontos.toString();
              } else if (servicoOriginal.valorPontos !== undefined && servicoOriginal.valorPontos !== null) {
                novoValorServico = servicoOriginal.valorPontos.toString();
              } else if (servicoOriginal.valorServico !== undefined && servicoOriginal.valorServico !== null) {
                novoValorServico = servicoOriginal.valorServico.toString();
              }
            }
          }
        }
        
        // Criar uma nova cópia do objeto com os valores atualizados
        const servicoAtualizado = {
          ...servico,
          valorGrupo: novoValorGrupo,
          valorServico: novoValorServico
        };
        
        // Atualizar também o servicoSelecionado se existir
        if (servicoAtualizado.servicoSelecionado) {
          if (valorGrupoVazio && novoValorGrupo) {
            servicoAtualizado.servicoSelecionado = {
              ...servicoAtualizado.servicoSelecionado,
              valorGrupo: parseFloat(novoValorGrupo) || 0
            };
          }
          
          if (valorServicoVazio && novoValorServico) {
            servicoAtualizado.servicoSelecionado = {
              ...servicoAtualizado.servicoSelecionado,
              valorPontos: parseFloat(novoValorServico) || 0
            };
          }
        }
        return servicoAtualizado;
      });
      
      // Verificar se algum serviço realmente mudou antes de atualizar o estado
      const precisaAtualizar = servicosAtualizados.some((servicoAtualizado, index) => {
        const servicoOriginal = servicos[index];
        return servicoAtualizado.valorGrupo !== servicoOriginal.valorGrupo || 
               servicoAtualizado.valorServico !== servicoOriginal.valorServico;
      });
      
      if (precisaAtualizar) {
        setServicos(servicosAtualizados);
      } else {
      }
    }
  };
  
  // UseEffect para garantir valores dos serviços após carregamento
  // Usando uma referência para controlar se já executou a garantia de valores
  const jaExecutouGarantia = useRef(false);
  useEffect(() => {
    if (visible && modoEdicao && servicos.length > 0 && !jaExecutouGarantia.current) {
      // Marca que já executou para evitar loop infinito
      jaExecutouGarantia.current = true;
      
      // Usar setTimeout para garantir que dados já foram carregados
      setTimeout(() => {
        garantirValoresServicos();
      }, 500);
    }
    
    // Resetar a referência quando o modal for fechado
    return () => {
      if (!visible) {
        jaExecutouGarantia.current = false;
      }
    };
  }, [visible, modoEdicao, servicos.length]);

  // UseEffect para limpar campos quando o modal abrir
  useEffect(() => {
    if (visible) {
      // Usar setTimeout para garantir que os elementos DOM estejam disponíveis
      setTimeout(() => {
        if (!modoVisualizacao && !modoEdicao) {
          limparCampos();
        }
        // Carregar todos os centros de custo ao abrir o modal
        carregarTodosCentrosCusto();
        // Carregar todos os municípios ao abrir o modal
        carregarTodosMunicipios();
      }, 100);
    }
  }, [ visible ]);

  // UseEffect para sincronizar centro de custo quando as opções são carregadas
  useEffect(() => {
    if (modoEdicao && dadosOcorrencia && dadosOcorrencia.centroCusto && centroCustoOpcoes.length > 0) {
      const centroCustoTrim = dadosOcorrencia.centroCusto.trim();
      // Verificar se o centro de custo atual já está correto
      if (centroCustoSelecionado === centroCustoTrim) {
        return; // Já está correto, não fazer nada
      }
      // Tenta encontrar o centro de custo nas opções (case-insensitive)
      const centroCustoEncontrado = centroCustoOpcoes.find(cc => {
        const ccTrim = cc.centroCusto?.trim();
        return ccTrim?.toLowerCase() === centroCustoTrim.toLowerCase();
      });
      if (centroCustoEncontrado) {
        setCentroCustoSelecionado(centroCustoEncontrado.centroCusto);
      } else {
        // Se não encontrar, usa o valor direto
        setCentroCustoSelecionado(centroCustoTrim);
      }
    }
  }, [centroCustoOpcoes, modoEdicao, dadosOcorrencia]);

  // UseEffect específico para inicializar campos em modo edição
  // Usar uma ref para controlar se já inicializamos o centro de custo
  const centroCustoInicializado = useRef(false);
  
  useEffect(() => {
    if (visible && modoEdicao && dadosOcorrencia && !centroCustoInicializado.current) {
      // Marcar que já estamos inicializando
      centroCustoInicializado.current = true;
      
      // Aguardar carregamento das opções de centro de custo e então inicializar
      const inicializarCentroCusto = async () => {
        // Verificar se já temos as opções de centro de custo carregadas
        if (centroCustoOpcoes.length === 0 && dadosOcorrencia.centroCusto) {
          // Se não temos opções carregadas, carregar primeiro
          await carregarTodosCentrosCusto();
        }
        
        // Aguardar um tempo para que as opções de centro de custo carreguem
        setTimeout(() => {
          if (dadosOcorrencia.centroCusto && centroCustoOpcoes.length > 0) {
            
            // Encontrar o centro de custo correto fazendo trim e comparação case-insensitive
            const centroCustoTrim = dadosOcorrencia.centroCusto.trim();
            
            const centroCustoEncontrado = centroCustoOpcoes.find(cc => {
              const ccTrim = cc.centroCusto?.trim();
              return ccTrim === centroCustoTrim || ccTrim?.toLowerCase() === centroCustoTrim.toLowerCase();
            });
            
            if (centroCustoEncontrado) {
              const valorParaSelecionar = centroCustoEncontrado.centroCusto;
              
              setCentroCustoSelecionado(valorParaSelecionar);
              
              // Cache é carregado automaticamente no background
            } else {
              // Se não encontrar na lista, usar o valor diretamente
              const valorDireto = dadosOcorrencia.centroCusto.trim();
              setCentroCustoSelecionado(valorDireto);
              
              // Cache é carregado automaticamente no background
            }
          } 
        }, 300);
      };
      
      inicializarCentroCusto();
      
      // Inicializar número operacional
      if (dadosOcorrencia.numeroOperacional) {
        setNumeroOperacionalSelecionado(dadosOcorrencia.numeroOperacional);
      }
      
      // Inicializar serviços formatados
      if (dadosOcorrencia.servicos && Array.isArray(dadosOcorrencia.servicos)) {
        const servicosFormatados = dadosOcorrencia.servicos.map(servico => {
          // Verificar se temos valGrupo ou valorGrupo
          const valorGrupo = servico.valGrupo !== undefined ? servico.valGrupo : servico.valorGrupo;
          // Verificar se temos valPontos ou valorPontos (ou valorServico)
          const valorPontos = servico.valPontos !== undefined ? servico.valPontos : (servico.valorPontos || servico.valorServico);
          
          // Converter para string com verificação de undefined/null
          const valorGrupoStr = valorGrupo !== undefined && valorGrupo !== null ? valorGrupo.toString() : '';
          const valorPontosStr = valorPontos !== undefined && valorPontos !== null ? valorPontos.toString() : '';
          
          // Usar codServico para exibição, mas manter idServico para a API
          const displayServico = servico.codServico ? `${servico.codServico.trim()} - ${servico.descricaoServico?.trim() || ''}` : servico.idServico || '';
          
          return {
            servico: displayServico,
            observacao: servico.observacao || '',
            valorGrupo: valorGrupoStr,
            valorServico: valorPontosStr,
            quantidade: servico.quantidade?.toString() || '',
            servicoSelecionado: {
              idServico: servico.idServico,
              codServico: servico.codServico,
              descricaoServico: servico.descricaoServico || '',
              valorGrupo: valorGrupo || 0,
              valorPontos: valorPontos || 0
            },
            fotos: servico.fotos || []
          };
        });
        setServicos(servicosFormatados);
      }
      
      // Inicializar usuários
      if (dadosOcorrencia.usuarios && Array.isArray(dadosOcorrencia.usuarios)) {
        // Garantir que o campo lider esteja no formato correto
        const usuariosFormatados = dadosOcorrencia.usuarios.map(usuario => ({
          ...usuario,
          lider: usuario.lider === 'S' || usuario.lider === true ? 'S' : 'N'
        }));
        setUsuarios(usuariosFormatados);
      }
      
      // Inicializar checkbox de ocorrência sem endereço
      if (dadosOcorrencia.semEndereco === 'S') {
        setOcorrenciaSemEndereco(true);
      } else {
        setOcorrenciaSemEndereco(false);
      }
    }
    
    // Resetar o flag quando o modal for fechado ou mudar de modo
    return () => {
      if (!visible) {
        centroCustoInicializado.current = false;
      }
    };
  }, [visible, modoEdicao, dadosOcorrencia, centroCustoOpcoes]);

  // UseEffect específico para preencher município em modo edição quando os dados são carregados
  useEffect(() => {
    if (visible && modoEdicao && dadosOcorrencia && dadosOcorrencia.codMunicipio && todosMunicipios.length > 0) {
      const municipio = todosMunicipios.find(m => m.codigo === dadosOcorrencia.codMunicipio);
      if (municipio) {
        const textoMunicipio = `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
        setMunicipioSelecionado(textoMunicipio);
        // Usar setTimeout para garantir que o DOM esteja pronto
        setTimeout(() => {
          const municipioInput = document.getElementById('municipio');
          if (municipioInput) {
            municipioInput.value = textoMunicipio;
          }
        }, 100);
      }
    }
  }, [visible, modoEdicao, dadosOcorrencia, todosMunicipios]);

  // UseEffect para preencher dados em modo visualização ou edição
  useEffect(() => {
    if (visible && (modoVisualizacao || modoEdicao) && dadosOcorrencia) {
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
        
        if (dadosOcorrencia.cep) {
          const cepEl = document.getElementById('cep');
          if (cepEl) cepEl.value = dadosOcorrencia.cep;
        }

        if (dadosOcorrencia.latitude) {
          const latitudeEl = document.getElementById('latitude');
          if (latitudeEl) latitudeEl.value = dadosOcorrencia.latitude;
        }

        if (dadosOcorrencia.longitude) {
          const longitudeEl = document.getElementById('longitude');
          if (longitudeEl) longitudeEl.value = dadosOcorrencia.longitude;
        }
        
        if (dadosOcorrencia.centroCusto) {
          // Não fazer nada aqui, pois o centro de custo será tratado no useEffect específico
        }
        
        // Cache de serviços é carregado automaticamente em background
        // Não precisa mais carregar por centro de custo
        
        // Preencher campos de município em modo edição
        if (modoEdicao && dadosOcorrencia.codMunicipio) {
          // Carregar todos os municípios e definir o selecionado
          if (todosMunicipios.length === 0) {
            carregarTodosMunicipios().then((municipiosCarregados) => {
              const municipio = municipiosCarregados.find(m => m.codigo === dadosOcorrencia.codMunicipio);
              if (municipio) {
                const textoMunicipio = `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
                setMunicipioSelecionado(textoMunicipio);
                const municipioInput = document.getElementById('municipio');
                if (municipioInput) {
                  municipioInput.value = textoMunicipio;
                }
              }
            });
          } else {
            const municipio = todosMunicipios.find(m => m.codigo === dadosOcorrencia.codMunicipio);
            if (municipio) {
              const textoMunicipio = `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
              setMunicipioSelecionado(textoMunicipio);
              const municipioInput = document.getElementById('municipio');
              if (municipioInput) {
                municipioInput.value = textoMunicipio;
              }
            }
          }
        }
        
        // Preencher campos de número operacional em modo edição
        if (modoEdicao && dadosOcorrencia.numeroOperacional) {
          if (todasEquipes.length === 0) {
            carregarTodasEquipes().then(() => {
              const equipe = todasEquipes.find(e => e.numOperacional === dadosOcorrencia.numeroOperacional);
              if (equipe) {
                const textoEquipe = `${equipe.numOperacional?.trim()} - ${equipe.descricao?.trim()}`;
                setNumeroOperacionalSelecionado(textoEquipe);
                // Também preencher o input diretamente
                const numeroOperacionalInput = document.getElementById('numeroOperacional');
                if (numeroOperacionalInput) {
                  numeroOperacionalInput.value = equipe.numOperacional?.trim() || '';
                }
              }
            });
          } else {
            const equipe = todasEquipes.find(e => e.numOperacional === dadosOcorrencia.numeroOperacional);
            if (equipe) {
              const textoEquipe = `${equipe.numOperacional?.trim()} - ${equipe.descricao?.trim()}`;
              setNumeroOperacionalSelecionado(textoEquipe);
              // Também preencher o input diretamente
              const numeroOperacionalInput = document.getElementById('numeroOperacional');
              if (numeroOperacionalInput) {
                numeroOperacionalInput.value = equipe.numOperacional?.trim() || '';
              }
            }
          }
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
        
        // Preencher novos campos
        if (dadosOcorrencia.osSgm) {
          const osSGMEl = document.getElementById('osSgm');
          if (osSGMEl) osSGMEl.value = dadosOcorrencia.osSgm;
        }
        
        if (dadosOcorrencia.osAcionamentoEmergencial) {
          const osAcionamentoEmergencialEl = document.getElementById('osAcionamentoEmergencial');
          if (osAcionamentoEmergencialEl) osAcionamentoEmergencialEl.value = dadosOcorrencia.osAcionamentoEmergencial;
        }
        
        if (dadosOcorrencia.osTablet) {
          const osTabletEl = document.getElementById('osTablet');
          if (osTabletEl) osTabletEl.value = dadosOcorrencia.osTablet;
        }
        
        // Preencher usuários
        if (dadosOcorrencia.usuarios && Array.isArray(dadosOcorrencia.usuarios)) {
          // Garantir que o campo lider esteja no formato correto
          const usuariosFormatados = dadosOcorrencia.usuarios.map(usuario => ({
            ...usuario,
            lider: usuario.lider === 'S' || usuario.lider === true ? 'S' : 'N'
          }));
          setUsuarios(usuariosFormatados);
        }
        
        // Preencher serviços
        if (dadosOcorrencia.servicos && Array.isArray(dadosOcorrencia.servicos)) {
          if (modoEdicao) {
            // Em modo edição, precisamos formatar os serviços corretamente
            const servicosFormatados = dadosOcorrencia.servicos.map(servico => {
              // Verificar se temos valGrupo ou valorGrupo
              const valorGrupo = servico.valGrupo !== undefined ? servico.valGrupo : servico.valorGrupo;
              // Verificar se temos valPontos ou valorPontos (ou valorServico)
              const valorPontos = servico.valPontos !== undefined ? servico.valPontos : (servico.valorPontos || servico.valorServico);
              
              // Converter para string com verificação de undefined/null
              const valorGrupoStr = valorGrupo !== undefined && valorGrupo !== null ? valorGrupo.toString() : '';
              const valorPontosStr = valorPontos !== undefined && valorPontos !== null ? valorPontos.toString() : '';
              const descServico = servico.codServico.trim() + ' - ' + servico.descricaoServico.trim();
              return {
                servico: descServico || '',
                observacao: servico.observacao || '',
                valorGrupo: valorGrupoStr,
                valorServico: valorPontosStr,
                quantidade: servico.quantidade?.toString() || '',
                servicoSelecionado: {
                  idServico: servico.idServico,
                  descricaoServico: servico.descricaoServico || '',
                  valorGrupo: valorGrupo || 0,
                  valorPontos: valorPontos || 0
                },
                fotos: servico.fotos || []
              };
            });
            
            setServicos(servicosFormatados);
          } else {
            setServicos(dadosOcorrencia.servicos);
          }
        }
        
        // Definir se ocorrência sem endereço
        if (dadosOcorrencia.semEndereco === 'S') {
          setOcorrenciaSemEndereco(true);
        }
        
        // Carregar dados de visualização (nomes dos campos) - tanto para visualização quanto edição
        carregarDadosVisualizacao();
        
      }, 200);
    }
  }, [visible, modoVisualizacao, modoEdicao, dadosOcorrencia]);

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
      quantidade: '1',
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

  // Função para calcular o total geral dos serviços
  const calcularTotalServicos = () => {
    return servicos.reduce((total, servico) => {
      const valorGrupo = parseFloat(servico.valorGrupo) || 0;
      const valorServico = parseFloat(servico.valorServico) || 0;
      const quantidade = parseFloat(servico.quantidade) || 0;

      // Multiplicar valorGrupo, valorServico e quantidade
      const subtotal = valorGrupo * valorServico * quantidade;

      return total + subtotal;
    }, 0);
  };

  // Total geral calculado de forma reativa
  const totalGeral = useMemo(() => {
    return servicos.reduce((total, servico) => {
      const valorGrupo = parseFloat(servico.valorGrupo) || 0;
      const valorServico = parseFloat(servico.valorServico) || 0;
      const quantidade = parseFloat(servico.quantidade) || 0;
      return total + (valorGrupo * valorServico * quantidade);
    }, 0);
  }, [servicos]);

  // Função para calcular o subtotal de uma linha específica
  const calcularSubtotalLinha = (servico) => {
    const valorGrupo = parseFloat(servico.valorGrupo) || 0;
    const valorServico = parseFloat(servico.valorServico) || 0;
    const quantidade = parseFloat(servico.quantidade) || 0;
    
    return valorGrupo * valorServico * quantidade;
  };

  // Função otimizada para calcular subtotal usando useMemo quando necessário
  const calcularSubtotalLinhaOtimizado = useCallback((servico) => {
    const valorGrupo = parseFloat(servico.valorGrupo) || 0;
    const valorServico = parseFloat(servico.valorServico) || 0;
    const quantidade = parseFloat(servico.quantidade) || 0;
    
    return valorGrupo * valorServico * quantidade;
  }, []);

  // Função para abrir modal de fotos
  const abrirModalFotos = (servicoIndex) => {    
    const servico = servicos[servicoIndex];
    const servicoDescricao = servico.servicoSelecionado?.descricaoServico || 
                           servico.servico || 
                           `Serviço ${servicoIndex + 1}`;

    // Determinar idOcorrencia e itemServico corretos
    let idOcorrencia = '';
    let itemServico = '';

    if ((modoEdicao || modoVisualizacao) && dadosOcorrencia) {
      // Em modo edição ou visualização, usar dados da ocorrência existente
      idOcorrencia = dadosOcorrencia.idOcorrencia || '';
      
      // Tentar encontrar o itemServico baseado no serviço
      const servicoOriginal = dadosOcorrencia.servicos?.find(s => 
        s.idServico === (servico.servicoSelecionado?.idServico || servico.servico)
      );
      
      if (servicoOriginal) {
        itemServico = servicoOriginal.itemOcorrencia || `${(servicoIndex + 1).toString().padStart(3, '0')}`;
      } else {
        // Novo serviço em edição - usar índice
        itemServico = `${(servicoIndex + 1).toString().padStart(3, '0')}`;
      }
    } else {
      // Em modo criação, não há dados para buscar da API
      idOcorrencia = '';
      itemServico = `${(servicoIndex + 1).toString().padStart(3, '0')}`;
    }

    setFotoServicoAtual({
      index: servicoIndex,
      idOcorrencia,
      itemServico,
      servicoDescricao
    });
    
    setModalFotosVisible(true);
  };

  // Função para atualizar fotos do serviço quando modal de fotos for fechado
  const handleFotosChange = (novasFotos) => {
    if (fotoServicoAtual.index >= 0) {
      atualizarServico(fotoServicoAtual.index, 'fotos', novasFotos);
    }
  };

  // Função para buscar serviços do Protheus (OTIMIZADA COM CACHE)
  const buscarServicos = async (termo, index) => {
    // OTIMIZADO: Usa sempre cache global, sem filtro por centro de custo
    if (!termo || termo.length < 2) {
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
      return;
    }

    try {
      // Buscar em todos os serviços do cache global (sem filtro por centro de custo)
      const servicosFiltrados = await servicosCacheService.filtrarServicos(termo, 10);

      setServicosOpcoes(servicosFiltrados);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: true }));
      setServicoSelectedIndex(prev => ({ ...prev, [ index ]: -1 }));
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
    }
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
    // Mostrar codServico e descrição no input (mas manter idServico para API)
    const descricaoServico = servico.descricaoServico?.trim() || '';
    const textoExibicao = `${servico.codServico?.trim()} - ${descricaoServico}`;

    atualizarServico(index, 'servico', textoExibicao);
    atualizarServico(index, 'servicoSelecionado', servico);

    // Preencher automaticamente o valor do grupo e valor do serviço
    if (servico.valorGrupo && servico.valorGrupo > 0) {
      atualizarServico(index, 'valorGrupo', servico.valorGrupo.toString());
    }
    if (servico.valorPontos && servico.valorPontos > 0) {
      atualizarServico(index, 'valorServico', servico.valorPontos.toString());
    }

    // Definir quantidade padrão como 1 se estiver vazia
    const servicoAtual = servicos[index];
    if (!servicoAtual.quantidade || servicoAtual.quantidade === '') {
      atualizarServico(index, 'quantidade', '1');
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

    // Cache de serviços é global - não precisa recarregar por centro de custo
    // Apenas limpar seleções de autocomplete
    setServicosOpcoes([]);
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

   
      const equipesData = await consultarEquipes({ retornaInativos: 'S' });
      setTodasEquipes(equipesData || []);
    
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

  // Função unificada para submissão (criar/atualizar)
  const handleSubmit = async () => {
    // Funções auxiliares para edição
    const construirUsuariosParaEdicao = () => {
      const usuariosEdicao = [];
      const usuariosOriginais = dadosOcorrencia.usuarios || [];
      
      usuariosOriginais.forEach(usuarioOriginal => {
        const usuarioExiste = usuarios.find(u => 
          u.cpf === usuarioOriginal.cpf && u.matricula === usuarioOriginal.matricula
        );
        
        if (!usuarioExiste) {
          usuariosEdicao.push({
            acao: "DELETE",
            itemUsuario: usuarioOriginal.itemUsuario || "001"
          });
        }
      });
      
      usuarios.forEach(usuarioAtual => {
        const usuarioOriginal = usuariosOriginais.find(u => 
          u.cpf === usuarioAtual.cpf && u.matricula === usuarioAtual.matricula
        );
        
        if (!usuarioOriginal) {
          usuariosEdicao.push({
            acao: "POST",
            cpf: usuarioAtual.cpf,
            matricula: usuarioAtual.matricula,
            lider: usuarioAtual.lider ? 'S' : 'N'
          });
        } else {
          const liderOriginal = usuarioOriginal.lider === 'S' || usuarioOriginal.lider === true;
          const liderAtual = usuarioAtual.lider === true;
          
          if (liderOriginal !== liderAtual) {
            usuariosEdicao.push({
              acao: "PUT",
              itemUsuario: usuarioOriginal.itemUsuario || "001",
              cpf: usuarioAtual.cpf,
              matricula: usuarioAtual.matricula,
              lider: usuarioAtual.lider ? 'S' : 'N'
            });
          }
        }
      });
      
      return usuariosEdicao;
    };

    const construirServicosParaEdicao = async () => {
      const servicosEdicao = [];
      const servicosOriginais = dadosOcorrencia.servicos || [];
      
      servicosOriginais.forEach(servicoOriginal => {
        const servicoExiste = servicos.find(s => 
          (s.servicoSelecionado?.idServico || s.servico) === servicoOriginal.idServico
        );
        
        if (!servicoExiste) {
          servicosEdicao.push({
            acao: "DELETE",
            itemServico: servicoOriginal.itemOcorrencia || "001"
          });
        }
      });
      
      for (const servicoAtual of servicos) {
        let idServicoAtual = '';
        if (servicoAtual.servicoSelecionado?.idServico) {
          idServicoAtual = servicoAtual.servicoSelecionado.idServico;
        } else {
          const servicoOriginalTexto = servicoAtual.servico?.split(' - ')[0]?.trim();
          const servicoEncontrado = await buscarServicoNoCachePorIdOuCodigo(servicoOriginalTexto);
          idServicoAtual = servicoEncontrado ? servicoEncontrado.idServico : servicoOriginalTexto;
        }
        
        const servicoOriginal = servicosOriginais.find(s => s.idServico === idServicoAtual);
        
        if (!servicoOriginal) {
          servicosEdicao.push({
            acao: "POST",
            idServico: idServicoAtual,
            observacao: servicoAtual.observacao || '',
            quantidade: Number(servicoAtual.quantidade) || 0,
            valPontos: parseFloat(servicoAtual.valorServico) || 0,
            valGrupo: parseFloat(servicoAtual.valorGrupo) || 0,
            fotos: (servicoAtual.fotos || []).map(foto => ({ 
              acao: "POST", 
              base64: foto.base64 
            }))
          });
        } else {
          const obsOriginal = (servicoOriginal.observacao || '').trim();
          const obsAtual = (servicoAtual.observacao || '').trim();
          const qtdOriginal = Math.round(Number(servicoOriginal.quantidade || 0));
          const qtdAtual = Math.round(Number(servicoAtual.quantidade || 0));
          const pontosOriginal = Number(Number(servicoOriginal.valPontos || 0).toFixed(6));
          const pontosAtual = Number(Number(servicoAtual.valorServico || 0).toFixed(6));
          const grupoOriginal = Number(Number(servicoOriginal.valGrupo || 0).toFixed(6));
          const grupoAtual = Number(Number(servicoAtual.valorGrupo || 0).toFixed(6));

          const temAlteracao = obsOriginal !== obsAtual || qtdOriginal !== qtdAtual || 
                             Math.abs(pontosOriginal - pontosAtual) > 0.000001 || 
                             Math.abs(grupoOriginal - grupoAtual) > 0.000001;
          
          if (temAlteracao) {
            const fotosEdicao = [];
            const fotosOriginais = servicoOriginal.fotos || [];
            const fotosAtuais = servicoAtual.fotos || [];
            
            fotosOriginais.forEach((fotoOriginal, index) => {
              if (index < fotosAtuais.length) {
                fotosEdicao.push({
                  acao: "PUT",
                  itemFoto: fotoOriginal.itemFoto || (index + 1).toString().padStart(3, '0'),
                  base64: fotosAtuais[index].base64
                });
              } else {
                fotosEdicao.push({
                  acao: "DELETE",
                  itemFoto: fotoOriginal.itemFoto || (index + 1).toString().padStart(3, '0')
                });
              }
            });
            
            fotosAtuais.forEach((fotoAtual, index) => {
              if (index >= fotosOriginais.length) {
                fotosEdicao.push({
                  acao: "POST",
                  base64: fotoAtual.base64
                });
              }
            });
            
            servicosEdicao.push({
              acao: "PUT",
              itemServico: servicoOriginal.itemOcorrencia || "001",
              idServico: idServicoAtual,
              observacao: servicoAtual.observacao || '',
              quantidade: Number(servicoAtual.quantidade) || 0,
              valPontos: parseFloat(servicoAtual.valorServico) || 0,
              valGrupo: parseFloat(servicoAtual.valorGrupo) || 0,
              fotos: fotosEdicao
            });
          }
        }
      }
      
      return servicosEdicao;
    };

    // Validação unificada
    const validarCampos = () => {
      const erros = {};
      setCamposComErro({});

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

      if (!ocorrenciaSemEndereco) {
        const endereco = document.getElementById('endereco').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        if (!endereco) erros.endereco = 'Este campo é obrigatório';
        if (!bairro) erros.bairro = 'Este campo é obrigatório';
      }

      if (usuarios.length === 0) {
        erros.usuarios = 'Pelo menos um usuário deve ser adicionado';
      }

      if (servicos.length === 0) {
        erros.servicos = 'Pelo menos um serviço deve ser adicionado';
      }

      const temLider = usuarios.some(u => u.lider);
      if (usuarios.length > 0 && !temLider) {
        erros.lider = 'Pelo menos um usuário deve ser marcado como líder';
      }

      if (Object.keys(erros).length > 0) {
        setCamposComErro(erros);
      }

      return Object.keys(erros).length > 0;
    };

    setIsSubmitting(true);
    if (setLoadingParent) setLoadingParent(true);

    try {
      if (validarCampos()) {
        mostrarAlert('Por favor, corrija os campos destacados em vermelho.', 'danger');
        return;
      }

      // Coleta dos dados
      const numeroOs = document.getElementById('numeroOS').value.trim();
      const unidadeConsumidora = document.getElementById('unConsumidora').value.trim();
      const status = document.getElementById('status').value;
      const data = document.getElementById('data').value.replace(/-/g, '');
      const endereco = ocorrenciaSemEndereco ? '' : document.getElementById('endereco').value.trim();
      const bairro = ocorrenciaSemEndereco ? '' : document.getElementById('bairro').value.trim();
      const codMunicipio = document.getElementById('municipio').value.trim().split('-')[0];
      const cep = ocorrenciaSemEndereco ? '' : document.getElementById('cep').value.trim().replace(/-/g, '');
      const latitude = ocorrenciaSemEndereco ? '' : document.getElementById('latitude').value.trim();
      const longitude = ocorrenciaSemEndereco ? '' : document.getElementById('longitude').value.trim();
      const dataConclusao = document.getElementById('dataConclusao').value.replace(/-/g, '');
      const centroCusto = centroCustoSelecionado;
      const numOperacional = document.getElementById('numeroOperacional').value.trim().split('-')[0];
      
      const osSgm = document.getElementById('osSgm')?.value.trim() || '';
      const osAcionamentoEmergencial = document.getElementById('osAcionamentoEmergencial')?.value.trim() || '';
      const osTablet = document.getElementById('osTablet')?.value.trim() || '';
      
      const hrInicialDeslocamento = document.getElementById('hrInicialDeslocamento').value + ':00';
      const hrInicioAtividade = document.getElementById('hrInicioAtividade').value + ':00';
      const hrInicioIntervalo = document.getElementById('hrInicioIntervalo').value ? document.getElementById('hrInicioIntervalo').value + ':00' : '';
      const hrFimIntervalo = document.getElementById('hrFimIntervalo').value ? document.getElementById('hrFimIntervalo').value + ':00' : '';
      const hrPrimeiroContatoCoi = document.getElementById('hrPrimeiroContatoCoi').value ? document.getElementById('hrPrimeiroContatoCoi').value + ':00' : '';
      const hrAutorizacaoCoi = document.getElementById('hrAutorizacaoCoi').value ? document.getElementById('hrAutorizacaoCoi').value + ':00' : '';
      const hrFechamentoCoi = document.getElementById('hrFechamentoCoi').value ? document.getElementById('hrFechamentoCoi').value + ':00' : '';
      const hrFimAtividade = document.getElementById('hrFimAtividade').value + ':00';
      const hrFimDeslocamento = document.getElementById('hrFimDeslocamento').value + ':00';

      const cpfInclusao = localStorage.getItem('cpf');
      const matInclusao = localStorage.getItem('matricula');

      const usuariosReq = usuarios.map(u => ({
        cpf: u.cpf,
        matricula: u.matricula,
        lider: u.lider ? 'S' : 'N'
      }));

      const servicosReq = [];
      for (const s of servicos) {
        let idServico = '';
        if (s.servicoSelecionado?.idServico) {
          idServico = s.servicoSelecionado.idServico;
        } else {
          const servicoOriginal = s.servico?.split(' - ')[0]?.trim();
          const servicoEncontrado = await buscarServicoNoCachePorIdOuCodigo(servicoOriginal);
          idServico = servicoEncontrado ? servicoEncontrado.idServico : servicoOriginal;
        }
        
        servicosReq.push({
          idServico: idServico,
          observacao: s.observacao || '',
          quantidade: Number(s.quantidade) || 0,
          valPontos: Number(s.valorServico) || 0,
          valGrupo: Number(s.valorGrupo) || 0,
          fotos: s.fotos || []
        });
      }

      const baseBody = {
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
        osSgm,
        osAcionamentoEmergencial,
        osTablet,
        hrFechamentoCoi,
        hrFimAtividade,
        hrFimDeslocamento,
        usuarios: modoEdicao ? construirUsuariosParaEdicao() : usuariosReq,
        servicos: modoEdicao ? await construirServicosParaEdicao() : servicosReq,
        incrementos: []
      };

      if (modoEdicao && dadosOcorrencia) {
        const bodyEdicao = { ...baseBody, idOcorrencia: dadosOcorrencia.idOcorrencia };
        await ocorrenciasService.alterarOcorrencia(bodyEdicao);
        mostrarAlert('Ordem de serviço atualizada com sucesso!', 'success');
      } else {
        await ocorrenciasService.incluirOcorrencia(baseBody);
        mostrarAlert('Ordem de serviço registrada com sucesso!', 'success');
      }

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }

      setTimeout(() => {
        limparCampos();
        setVisible(false);
      }, 1000);

    } catch (error) {
      console.error('Erro na operação:', error);
      const operacao = modoEdicao ? 'atualizar' : 'registrar';
      mostrarAlert(`Erro ao ${operacao}: ${error.message || 'Falha na operação'}`, 'danger');
    } finally {
      setIsSubmitting(false);
      if (setLoadingParent) setLoadingParent(false);
    }
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

  // Função para posicionar corretamente os dropdowns
  const posicionarDropdowns = useCallback(() => {
    Object.keys(servicoDropdownVisivel).forEach(index => {
      if (servicoDropdownVisivel[index] && servicosRefs.current[`ref_${index}`]) {
        const rect = servicosRefs.current[`ref_${index}`].getBoundingClientRect();
        const dropdown = document.querySelector(`#servico-dropdown-${index}`);
        if (dropdown) {
          dropdown.style.top = `${rect.bottom}px`;
          dropdown.style.left = `${rect.left}px`;
          dropdown.style.width = `${rect.width}px`;
        }
      }
    });
  }, [servicoDropdownVisivel]);

  // Atualizar posição dos dropdowns quando eles são exibidos
  useEffect(() => {
    posicionarDropdowns();
    window.addEventListener('scroll', posicionarDropdowns);
    window.addEventListener('resize', posicionarDropdowns);
    
    return () => {
      window.removeEventListener('scroll', posicionarDropdowns);
      window.removeEventListener('resize', posicionarDropdowns);
    };
  }, [posicionarDropdowns, servicoDropdownVisivel]);

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
          {modoVisualizacao ? 'Visualizar Ordem de Serviço' : 
           modoEdicao ? 'Editar Ordem de Serviço' : 
           'Ordem de Serviço'}
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
          <CCol md={3}>
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
            <CFormLabel htmlFor="osSgm" className="mb-1">OS SGM</CFormLabel>
            <CFormInput
              id="osSgm"
              readOnly={modoVisualizacao}
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="osAcionamentoEmergencial" className="mb-1">OS Acionamento Emergencial</CFormLabel>
            <CFormInput
              id="osAcionamentoEmergencial"
              readOnly={modoVisualizacao}
            />
          </CCol>
        </CRow>
        <CRow className='mb-4'>
          <CCol md={3}>
             <CFormLabel htmlFor="osTablet" className="mb-1">OS Tablet</CFormLabel>
            <CFormInput
              id="osTablet"
              // className={camposComErro.numeroOS ? 'campo-erro' : ''}
              onChange={() => limparErroCampo('numeroOS')}
              readOnly={modoVisualizacao}
            />
            {/* {camposComErro.numeroOS && (
              <div className="texto-erro fade-in-error">
                <CIcon icon={cilX} size="sm" />
                {camposComErro.numeroOS}
              </div>
            )} */}
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
          <CCol md={3}>
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
            <CCol md={3}>
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
                      maxHeight: '400px',
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
          <CCol md={3}>
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
          <CCol md={3}>
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
          <CCol md={3}>
               <CFormLabel htmlFor="centroDeCustos" className="mb-1">Centro de Custos: </CFormLabel>
            {modoVisualizacao ? (
              <CFormInput
                id="centroDeCustos"
                value={dadosVisualizacao.centroCustoNome || 'Carregando...'}
                readOnly
                className="bg-light"
              />
            ) : modoEdicao ? (
              // Em modo edição, permitir edição do centro de custo
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
                    disabled={false}
                  >
                    <option value="">Selecione um centro de custo</option>
                    {centroCustoOpcoes.map((centroCusto, index) => (
                      <option key={index} value={centroCusto.centroCusto}>
                        {centroCusto.centroCusto?.trim()} - {centroCusto.descricaoCCusto?.trim()}
                      </option>
                    ))}
                  </CFormSelect>
                )}
                {camposComErro.centroDeCustos && (
                  <div className="texto-erro fade-in-error">
                    <CIcon icon={cilX} size="sm" />
                    {camposComErro.centroDeCustos}
                  </div>
                )}
              </div>
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
          <CCol md={3}>
            <CFormLabel htmlFor="numeroOperacional" className="mb-1">Número Operacional:</CFormLabel>
            {modoVisualizacao ? (
              <CFormInput
                id="numeroOperacional"
                value={dadosVisualizacao.numeroOperacionalNome || 'Carregando...'}
                readOnly
                className="bg-light"
              />
            ) : modoEdicao ? (
              // Em modo edição, permitir edição completa do número operacional
              <div className="position-relative" ref={equipeRef}>
                <CFormInput
                  id="numeroOperacional"
                  value={numeroOperacionalSelecionado}
                  onChange={handleNumeroOperacionalChange}
                  onKeyDown={handleEquipeKeyDown}
                  placeholder="Digite número ou descrição..."
                  autoComplete="off"
                  className={camposComErro.numeroOperacional ? 'campo-erro' : ''}
                  readOnly={false}
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
                      maxHeight: '400px',
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
                      maxHeight: '400px',
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
          
          <CCol md={4}>
         
          </CCol>
        </CRow>

        {/* Seção de Usuários */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Usuários</h6>
            <CButton
              color="primary"
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
                          maxHeight: '400px',
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

              <CTable hover className="mb-0 table-responsive">
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
                        {usuario.lider === 'S' || usuario.lider === true ? (
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
        <div className="mb-4" zIndex={1050}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Serviços</h6>
            <CButton
              color="primary"
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

          <CCard className="border table-container">
            <CCardHeader className="bg-light py-2">
              <CRow className="align-items-center">
                <CCol md={3}>
                  <span className="fw-semibold">Serviço</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Observação</span>
                </CCol>
                <CCol md={1}>
                  <span className="fw-semibold">Valor Grupo</span>
                </CCol>
                <CCol md={2}>
                  <span className="fw-semibold">Valor Serviço</span>
                </CCol>
                <CCol md={1}>
                  <span className="fw-semibold">Quantidade</span>
                </CCol>
                <CCol md={1}>
                  <span className="fw-semibold">Total</span>
                </CCol>
                <CCol md={1}>
                  <span className="fw-semibold">Fotos</span>
                </CCol>
                <CCol md={1} className="text-center">
                  <span className="fw-semibold">Ação</span>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody className="p-3 overflow-visible">
              {servicos.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <small>Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.</small>
                </div>
              ) : (
                servicos.map((servico, index) => (
                  <CRow key={index} className="align-items-start mb-3 border-bottom pb-3">
                    <CCol md={3}>
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
                        // Input unificado para cadastro e edição
                        <div
                          className="position-relative"
                          ref={el => servicosRefs.current[ `ref_${index}` ] = el}
                        >
                          <CFormInput
                            value={servico.servico}
                            onChange={(e) => handleServicoChange(e, index)}
                            onKeyDown={(e) => handleServicoKeyDown(e, index)}
                            size="sm"
                            placeholder="Digite ID ou descrição do serviço..."
                            autoComplete="off"
                            style={{
                              backgroundColor: 'white',
                              cursor: 'text'
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
                                maxHeight: '400px',
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
                                      <strong style={{ fontSize: '1rem' }}>{servicoOpcao.codServico?.trim()}</strong>
                                      {servicoOpcao.siglaUp && (
                                        <div className="text-primary small fw-bold">Sigla UP: {servicoOpcao.siglaUp.trim()}</div>
                                      )}
                                      {servicoOpcao.descricaoServico && (
                                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
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
                    <CCol md={1}>
                      <CFormInput
                        value={(() => {
                          // Se tem valorGrupo definido, use-o
                          if (servico.valorGrupo !== undefined && servico.valorGrupo !== '') {
                            return servico.valorGrupo;
                          }
                          // Se tem servicoSelecionado com valorGrupo, use-o
                          if (servico.servicoSelecionado?.valorGrupo !== undefined) {
                            return servico.servicoSelecionado.valorGrupo.toString();
                          }
                          // Se estamos em modo de edição, busque nos dados originais
                          if (modoEdicao && dadosOcorrencia?.servicos) {
                            // Buscar por idServico exato
                            const servicoOriginal = dadosOcorrencia.servicos.find(s => 
                              s.idServico === servico.servico);
                              
                            if (servicoOriginal) {
                              // Verificar primeiro valGrupo, depois valorGrupo
                              if (servicoOriginal.valGrupo !== undefined && servicoOriginal.valGrupo !== null) {
                                return servicoOriginal.valGrupo.toString();
                              }
                              if (servicoOriginal.valorGrupo !== undefined && servicoOriginal.valorGrupo !== null) {
                                return servicoOriginal.valorGrupo.toString();
                              }
                            }
                            
                            // Como último recurso, procurar em todos os serviços
                            for (const s of dadosOcorrencia.servicos) {
                              if (s.idServico === servico.servico || s.codServico === servico.servico) {
                                if (s.valGrupo !== undefined && s.valGrupo !== null) {
                                  return s.valGrupo.toString();
                                }
                                if (s.valorGrupo !== undefined && s.valorGrupo !== null) {
                                  return s.valorGrupo.toString();
                                }
                              }
                            }
                          }
                          return '';
                        })()}
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
                        value={(() => {
                          // Se tem valorServico definido, use-o
                          if (servico.valorServico !== undefined && servico.valorServico !== '') {
                            return servico.valorServico;
                          }
                          // Se tem servicoSelecionado com valorPontos, use-o
                          if (servico.servicoSelecionado?.valorPontos !== undefined) {
                            return servico.servicoSelecionado.valorPontos.toString();
                          }
                          // Se estamos em modo de edição, busque nos dados originais
                          if (modoEdicao && dadosOcorrencia?.servicos) {
                            // Buscar por idServico exato
                            const servicoOriginal = dadosOcorrencia.servicos.find(s => 
                              s.idServico === servico.servico);
                              
                            if (servicoOriginal) {
                              // Verificar primeiro valPontos, depois valorServico ou valorPontos
                              if (servicoOriginal.valPontos !== undefined && servicoOriginal.valPontos !== null) {
                                return servicoOriginal.valPontos.toString();
                              }
                              if (servicoOriginal.valorPontos !== undefined && servicoOriginal.valorPontos !== null) {
                                return servicoOriginal.valorPontos.toString();
                              }
                              if (servicoOriginal.valorServico !== undefined && servicoOriginal.valorServico !== null) {
                                return servicoOriginal.valorServico.toString();
                              }
                            }
                            
                            // Como último recurso, procurar em todos os serviços
                            for (const s of dadosOcorrencia.servicos) {
                              if (s.idServico === servico.servico || s.codServico === servico.servico) {
                                if (s.valPontos !== undefined && s.valPontos !== null) {
                                  return s.valPontos.toString();
                                }
                                if (s.valorPontos !== undefined && s.valorPontos !== null) {
                                  return s.valorPontos.toString();
                                }
                                if (s.valorServico !== undefined && s.valorServico !== null) {
                                  return s.valorServico.toString();
                                }
                              }
                            }
                          }
                          return '';
                        })()}
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
                      <CCol md={1}>
                        <div 
                          className="text-center"
                          style={{ fontSize: '14px' }}
                        >
                          R$ {calcularSubtotalLinha(servico).toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </div>
                      </CCol>
                      <CCol md={1}>
                        <div className="d-flex flex-column gap-2">
                          <CButton
                            color="outline-primary"
                            size="sm"
                            onClick={() => abrirModalFotos(index)}
                            className="d-flex align-items-center justify-content-center"
                            title="Gerenciar fotos do serviço"
                          >
                            <CIcon icon={cilCamera} className="me-1" />
                            ({servico.fotos?.length || 0})
                          </CButton>
                          
                          {servico.fotos && servico.fotos.length > 0 && (
                            <div className="d-flex flex-wrap gap-1">
                              {servico.fotos.slice(0, 3).map((foto, fotoIndex) => (
                                foto.base64 ? (
                                  <img
                                    key={fotoIndex}
                                    src={`data:image/jpeg;base64,${foto.base64}`}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid #dee2e6',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => abrirModalFotos(index)}
                                    title="Clique para gerenciar fotos"
                                  />
                                ) : null
                              ))}
                              {servico.fotos.length > 3 && (
                                <div
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8f9fa',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => abrirModalFotos(index)}
                                  title="Clique para ver todas as fotos"
                                >
                                  +{servico.fotos.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                    
                    {/* Linha de Total */}
                    {servicos.length > 0 && (
                      <CRow className="mt-5 pt-3 border-top bg-light rounded">
                        <CCol md={3}>
                          <span className="fw-bold">TOTAL GERAL</span>
                        </CCol>
                        <CCol md={2}>
                          {/* Vazio */}
                        </CCol>
                        <CCol md={1}>
                          {/* Vazio */}
                        </CCol>
                        <CCol md={1}>
                          {/* Vazio */}
                        </CCol>
                        <CCol md={1}>
                          {/* Vazio */}
                        </CCol>
                        <CCol md={3}>
                          <span className="fw-bold fs-5" style={{ color: 'black' }}>
                            R$ {totalGeral.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </CCol>
                        <CCol md={1}>
                          {/* Vazio */}
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                  </CCard>
                </div>
                </CModalBody>
                <CModalFooter className="bg-light border-top">
                <CButton
                  color="secondary"
                  onClick={() => {
            if (!modoVisualizacao && !modoEdicao) {
              limparCampos();
            }
            setVisible(false);
          }}
          className="me-2"
          disabled={isSubmitting}
        >
          {modoVisualizacao || modoEdicao ? 'Fechar' : 'Cancelar'}
        </CButton>
        {(!modoVisualizacao) && (
          <CButton
            color="primary"
            onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Processando...
            </>
          ) : (
            modoEdicao ? 'Atualizar' : 'Registrar'
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

    {/* Modal de Fotos */}
    <ModalFotos
      visible={modalFotosVisible}
      setVisible={setModalFotosVisible}
      idOcorrencia={fotoServicoAtual.idOcorrencia}
      itemServico={fotoServicoAtual.itemServico}
      servicoDescricao={fotoServicoAtual.servicoDescricao}
      fotos={fotoServicoAtual.index >= 0 ? servicos[fotoServicoAtual.index]?.fotos || [] : []}
      onFotosChange={handleFotosChange}
      modoVisualizacao={modoVisualizacao}
    />
    </>
  );
};

export default ServicosModal;
