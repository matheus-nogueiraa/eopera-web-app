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
import { cilX, cilCheckAlt } from '@coreui/icons';
import { consultarCentroCusto } from '../../services/centroCustoService';
import { consultarServicosProtheus } from '../../services/servicosService';
import { left } from '@popperjs/core';

// Adicionando estilos CSS para animação
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Adicionando os estilos ao head do documento
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const ServicosModal = ({ visible, setVisible, setLoadingParent, showAlertParent }) => {
  const [ usuarios, setUsuarios ] = useState([]);
  const [ servicos, setServicos ] = useState([]);
  const [ novoUsuario, setNovoUsuario ] = useState('');
  const [ isLider, setIsLider ] = useState(false);
  const [ ocorrenciaSemEndereco, setOcorrenciaSemEndereco ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  // Estados para alertas
  const [ alertVisible, setAlertVisible ] = useState(false);
  const [ alertMessage, setAlertMessage ] = useState('');
  const [ alertColor, setAlertColor ] = useState('success');

  // Estados para o select de centro de custo
  const [ centroCustoOpcoes, setCentroCustoOpcoes ] = useState([]);
  const [ centroCustoSelecionado, setCentroCustoSelecionado ] = useState('');
  const [ loadingCentroCusto, setLoadingCentroCusto ] = useState(false);

  // Estados para autocomplete de serviços
  const [ servicosOpcoes, setServicosOpcoes ] = useState([]);
  const [ todosServicos, setTodosServicos ] = useState([]); // Cache de todos os serviços
  const [ loadingServicos, setLoadingServicos ] = useState(false);
  const [ servicoDropdownVisivel, setServicoDropdownVisivel ] = useState({});
  const [ servicoSelectedIndex, setServicoSelectedIndex ] = useState({});
  const servicosRefs = useRef({});

  // Função para limpar todos os campos do modal
  const limparCampos = () => {
    // Limpar inputs de texto
    const inputs = [
      'numeroOS', 'unConsumidora', 'data', 'hora', 'endereco', 'bairro',
      'municipio', 'cep', 'latitude', 'longitude', 'dataConclusao',
      'horaConclusao', 'numeroOperacional'
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
    setNovoUsuario('');
    setIsLider(false);
    setOcorrenciaSemEndereco(false);

    // Resetar estado do centro de custo selecionado
    setCentroCustoSelecionado('');

    // Resetar estados dos serviços
    setServicosOpcoes([]);
    setServicoDropdownVisivel({});
    setServicoSelectedIndex({});
    servicosRefs.current = {};
    // Manter todosServicos para não precisar recarregar

    // Resetar estados do alert
    setAlertVisible(false);
    setAlertMessage('');
    setAlertColor('success');
  };

  // Função para exibir alertas
  const mostrarAlert = (message, color = 'success') => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlertVisible(true);

    // Auto-hide após 4 segundos
    setTimeout(() => {
      setAlertVisible(false);
    }, 4000);
    
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
      console.log('ServicosModal aberto - limpando campos');
      // Usar setTimeout para garantir que os elementos DOM estejam disponíveis
      setTimeout(() => {
        limparCampos();
        // Carregar todos os centros de custo ao abrir o modal
        carregarTodosCentrosCusto();
      }, 100);
    }
  }, [ visible ]);

  const adicionarUsuario = () => {
    if (novoUsuario.trim() !== '') {
      setUsuarios([ ...usuarios, { nome: novoUsuario, lider: isLider } ]);
      setNovoUsuario('');
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
      servicoSelecionado: null
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

  // Função para carregar todos os serviços (uma vez só)
  const carregarTodosServicos = async () => {
    if (todosServicos.length > 0) return; // Já carregados

    setLoadingServicos(true);

    try {
      const response = await consultarServicosProtheus(); // Sem parâmetros = todos os serviços

      // A API retorna um objeto com status, messsage e data
      // O array de serviços está em response.data
      const dados = response?.data && Array.isArray(response.data) ? response.data : [];
      setTodosServicos(dados);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setTodosServicos([]);
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

      return idServico.includes(termoLower) ||
        descricao.includes(termoLower) ||
        codServico.includes(termoLower);
    }).slice(0, 20); // Limitar a 20 resultados
  };

  // Função para buscar serviços do Protheus
  const buscarServicos = async (termo, index) => {
    if (!termo || termo.length < 2) {
      setServicosOpcoes([]);
      setServicoDropdownVisivel(prev => ({ ...prev, [ index ]: false }));
      return;
    }

    // Carregar todos os serviços se ainda não carregou
    if (todosServicos.length === 0) {
      await carregarTodosServicos();
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

    // Preencher automaticamente apenas o valor do grupo se disponível
    if (servico.valorGrupo && servico.valorGrupo > 0) {
      atualizarServico(index, 'valorGrupo', servico.valorGrupo.toString());
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
  const handleCentroCustoChange = (e) => {
    const valor = e.target.value;
    setCentroCustoSelecionado(valor);
    
    // Encontrar o objeto completo do centro de custo selecionado
    const centroCusto = centroCustoOpcoes.find(cc => cc.centroCusto === valor);
    console.log('Centro de custo selecionado:', centroCusto);
  };

  // Fechar dropdowns de serviços quando clicar fora
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
    };
  }, []);

  return (
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
        <CModalTitle>Ordem de Serviço</CModalTitle>
      </CModalHeader>
      <CModalBody className="pb-0">
        {/* Alert de sucesso/erro */}
        {alertVisible && (
          <CAlert
            color={alertColor}
            dismissible
            onClose={() => setAlertVisible(false)}
            className="d-flex align-items-center mb-3"
            style={{ animation: 'fadeIn 0.3s' }}
          >
            <div>
              {alertColor === 'success' ? (
                <CIcon icon={cilCheckAlt} className="me-2" />
              ) : (
                <CIcon icon={cilX} className="me-2" />
              )}
              {alertMessage}
            </div>
          </CAlert>
        )}

        {/* Primeira linha */}
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel htmlFor="numeroOS" className="mb-1">Número OS:</CFormLabel>
            <CFormInput id="numeroOS" />
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="unConsumidora" className="mb-1">UN. Consumidora:</CFormLabel>
            <CFormInput id="unConsumidora" />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="status" className="mb-1">Status:</CFormLabel>
            <CFormSelect id="status">
              <option value="cancelado">Cancelado</option>
              <option value="concluido">Concluído</option>
              <option value="dsr">DSR</option>
              <option value="executado_parcial">Executado Parcial</option>
              <option value="falta_realizar_poda">Falta Realizar Poda</option>
              <option value="feriado">Feriado</option>
              <option value="folga">Folga</option>
              <option value="improdutivo">Improdutivo</option>
              <option value="interrompido">Interrompido</option>
              <option value="interticio">Interticio</option>
              <option value="parcial">Parcial</option>
              <option value="poda_feita_ems">Poda Feita EMS</option>
              <option value="recolhimento_feito_elcop">Recolhimento Feito ELCOP</option>
              <option value="reprovado">Reprovado</option>
              <option value="trocar_status">Trocar Status</option>
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="data" className="mb-1">Data:</CFormLabel>
            <CFormInput
              type="date"
              id="data"
              placeholder="dd/mm/aaaa"
            />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="hora" className="mb-1">Hora:</CFormLabel>
            <div>
              <CFormInput type="time" id="hora" placeholder="--" />
            </div>
          </CCol>
        </CRow>

        {/* Segunda linha */}
        <CRow className="mb-4">
          <CCol md={5}>
            <CFormLabel htmlFor="endereco" className="mb-1">Endereço:</CFormLabel>
            <CFormInput id="endereco" readOnly={ocorrenciaSemEndereco} className={ocorrenciaSemEndereco ? 'bg-light' : ''} />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="bairro" className="mb-1">Bairro:</CFormLabel>
            <CFormInput id="bairro" readOnly={ocorrenciaSemEndereco} className={ocorrenciaSemEndereco ? 'bg-light' : ''} />
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="municipio" className="mb-1">Município:</CFormLabel>
            <CFormInput id="municipio" />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="cep" className="mb-1">CEP:</CFormLabel>
            <CFormInput id="cep" readOnly={ocorrenciaSemEndereco} className={ocorrenciaSemEndereco ? 'bg-light' : ''} />
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

        {/* Quarta linha */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CFormLabel htmlFor="latitude" className="mb-1">Latitude:</CFormLabel>
            <CFormInput id="latitude" readOnly={ocorrenciaSemEndereco} className={ocorrenciaSemEndereco ? 'bg-light' : ''} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="longitude" className="mb-1">Longitude:</CFormLabel>
            <CFormInput id="longitude" readOnly={ocorrenciaSemEndereco} className={ocorrenciaSemEndereco ? 'bg-light' : ''} />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="dataConclusao" className="mb-1">Data Conclusão:</CFormLabel>
            <CFormInput
              type="date"
              id="dataConclusao"
              placeholder="dd/mm/aaaa"
            />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="horaConclusao" className="mb-1">Hora Conclusão:</CFormLabel>
            <div >
              <CFormInput
                type="time"
                id="horaConclusao"
                placeholder="--"
              />
            </div>
          </CCol>
        </CRow>

        {/* Quinta linha */}
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel htmlFor="numeroOperacional" className="mb-1">Número Operacional:</CFormLabel>
            <CFormInput id="numeroOperacional" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="centroDeCustos" className="mb-1">Centro de Custos:</CFormLabel>
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
                >
                  <option value="">Selecione um centro de custo</option>
                  {centroCustoOpcoes.map((centroCusto, index) => (
                    <option key={index} value={centroCusto.centroCusto}>
                      {centroCusto.centroCusto?.trim()} - {centroCusto.descricaoCCusto?.trim()}
                    </option>
                  ))}
                </CFormSelect>
              )}
            </div>
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
            >
              Adicionar Usuário
            </CButton>
          </div>

          <CCard className="border">
            <CCardBody className="p-3">
              <CRow className="mb-3 align-items-center">
                <CCol md={8}>
                  <CFormInput
                    value={novoUsuario}
                    onChange={(e) => setNovoUsuario(e.target.value)}
                    placeholder="Nome do usuário"
                  />
                </CCol>
                <CCol md={2} className="text-center">
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
                    <CTableHeaderCell className="text-center">Líder</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Ação</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {usuarios.map((usuario, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{usuario.nome}</CTableDataCell>
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
            <h6 className="mb-0">serviços</h6>
            <CButton
              color="dark"
              size="sm"
              onClick={adicionarServico}
            >
              Adicionar Serviço
            </CButton>
          </div>

          <CCard className="border">
            <CCardHeader className="bg-light py-2">
              <CRow className="align-items-center">
                <CCol md={4}>
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
                  <CRow key={index} className="align-items-center mb-3 border-bottom pb-3">
                    <CCol md={4}>
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
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.observacao}
                        onChange={(e) => atualizarServico(index, 'observacao', e.target.value)}
                        size="sm"
                        placeholder="Observação"
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.valorGrupo}
                        onChange={(e) => atualizarServico(index, 'valorGrupo', e.target.value)}
                        size="sm"
                        placeholder="Valor"
                        type="number"
                        step="0.01"
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        value={servico.valorServico}
                        onChange={(e) => atualizarServico(index, 'valorServico', e.target.value)}
                        size="sm"
                        placeholder="Valor"
                        type="number"
                        step="0.01"
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
                      />
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
            limparCampos();
            setVisible(false);
          }}
          className="me-2"
          disabled={isSubmitting}
        >
          Cancelar
        </CButton>
        <CButton
          color="primary"
          onClick={async () => {
            // Ativar loading
            setIsSubmitting(true);
            if (setLoadingParent) setLoadingParent(true);
            
            try {
              // Validação básica
              const numeroOs = document.getElementById('numeroOS').value;
              if (!numeroOs) {
                mostrarAlert('O número da OS é obrigatório', 'danger');
                setIsSubmitting(false);
                if (setLoadingParent) setLoadingParent(false);
                return;
              }
              
              // Coleta dos dados dos inputs
              const unidadeConsumidora = document.getElementById('unConsumidora').value;
              const status = document.getElementById('status').value;
              const data = document.getElementById('data').value.replace(/-/g, '');
              const hora = document.getElementById('hora').value;
              const endereco = document.getElementById('endereco').value;
              const bairro = document.getElementById('bairro').value;
              const codMunicipio = document.getElementById('municipio').value;
              const cep = document.getElementById('cep').value;
              const latitude = document.getElementById('latitude').value;
              const longitude = document.getElementById('longitude').value;
              const dataConclusao = document.getElementById('dataConclusao').value.replace(/-/g, '');
              const horaConclusao = document.getElementById('horaConclusao').value;
              const centroCusto = centroCustoSelecionado || '';
              const numOperacional = document.getElementById('numeroOperacional').value;
              // Pega o CPF e matrícula do usuário logado do localStorage
              const cpfInclusao = localStorage.getItem('cpf') || '00000000000';
              const matInclusao = localStorage.getItem('matricula') || '000000';

              // Monta array de usuários
              const usuariosReq = usuarios.map(u => ({
                cpf: localStorage.getItem('cpf') || '00000000000', // CPF do usuário logado
                matricula: localStorage.getItem('matricula') || '000000', // Matrícula do usuário logado
                lider: u.lider ? 'S' : 'N'
              }));

              // Monta array de serviços
              const servicosReq = servicos.map(s => ({
                idServico: s.servicoSelecionado?.idServico || s.servico,
                observacao: s.observacao,
                quantidade: Number(s.quantidade) || 0,
                valPontos: Number(s.valorServico) || 0,
                valGrupo: Number(s.valorGrupo) || 0,
                fotos: [] // Adapte se for usar fotos
              }));

              const body = {
                numeroOs,
                unidadeConsumidora,
                status,
                data,
                hora,
                semEndereco: ocorrenciaSemEndereco ? 'S' : 'N',
                endereco,
                bairro,
                codMunicipio,
                cep,
                latitude,
                longitude,
                dataConclusao,
                horaConclusao,
                centroCusto,
                numOperacional,
                cpfInclusao,
                matInclusao,
                usuarios: usuariosReq,
                servicos: servicosReq,
                incrementos: []
              };

              console.log('Enviando corpo:', body);
              const response = await fetch('https://adm.elcop.eng.br:443/api/incluirOcorrencia', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
                },
                body: JSON.stringify(body)
              });
              const result = await response.json();
              console.log('Resultado:', result);

              if (response.ok) {
                mostrarAlert('Ordem de serviço registrada com sucesso!', 'success');
                // Fechando o modal imediatamente após o sucesso
                limparCampos();
                setVisible(false);
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
      </CModalFooter>
    </CModal>
  );
};

export default ServicosModal;
