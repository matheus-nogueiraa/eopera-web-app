import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormSelect,
  CButton,
  CPagination,
  CPaginationItem,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTooltip
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass, cilCloudDownload, cilInfo, cilTrash, cilPencil } from '@coreui/icons';
import { debounce } from '../../utils/debounce';
import ocorrenciasService from '../../services/ocorrenciasService';
import ServicosModal from './servicosModal';
import './servicoTabela.css'

const ServicosTabela = forwardRef((props, ref) => {
  // Estados para os dados da tabela
  const { podeDeletar, podeEditar, showAlertParent } = props;

  const [ servicos, setServicos ] = useState([]);
  const [ filteredServicos, setFilteredServicos ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');

  // Estados para paginação
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ itemsPerPage, setItemsPerPage ] = useState(10);

  // Estados para filtros
  const [ filtroConteudo, setFiltroConteudo ] = useState('');

  // Estados para modal de visualização
  const [ modalVisualizar, setModalVisualizar ] = useState(false);
  const [ modalEditar, setModalEditar ] = useState(false);
  const [ dadosOcorrencia, setDadosOcorrencia ] = useState(null);
  const [ loadingDetalhes, setLoadingDetalhes ] = useState(false);

  // Função para carregar serviços da API
  const carregarServicos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Usando o serviço centralizado para buscar ocorrências
      const data = await ocorrenciasService.buscarOcorrencias();
      
      // Formatando os dados para exibição na tabela
      const servicosFormatados = data.map(item => ({
        id: item.idOcorrencia,
        numeroOS: item.numOs.trim(),
        unidadeConsumidora: item.unidadeConsumidora.trim(),
        dataInicio: formatarDataHora(item.data, item.hora),
        usuarioRegistro: item.ZCC_NOME || ''
      }));
      
      setServicos(servicosFormatados);
      setFilteredServicos(servicosFormatados);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Erro ao carregar os serviços. Tente novamente.');
      setServicos([]);
      setFilteredServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função auxiliar para formatar data e hora
  const formatarDataHora = (data, hora) => {
    if (!data) return '';
    try {
      const ano = data.substring(0, 4);
      const mes = data.substring(4, 6);
      const dia = data.substring(6, 8);
      const horaFormatada = hora ? hora.trim() : '';
      return `${dia}/${mes}/${ano} ${horaFormatada}`;
    } catch (e) {
      return data;
    }
  };

  // Função para buscar detalhes da ocorrência
  const buscarDetalhesOcorrencia = async (idOcorrencia) => {
    setLoadingDetalhes(true);
    try {
      // Usando o serviço centralizado para buscar detalhes da ocorrência
      const data = await ocorrenciasService.buscarOcorrenciaPorId(idOcorrencia);
      setDadosOcorrencia(data);
      setModalVisualizar(true);
    } catch (err) {
      console.error('Erro ao buscar detalhes da ocorrência:', err);
      setError('Erro ao carregar detalhes da ocorrência. Tente novamente.');
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Função para editar serviço - otimizada para evitar sobrecarga no backend
  const editarServico = async (idOcorrencia) => {
    setLoadingDetalhes(true);
    try {
      // Usando o serviço centralizado para buscar detalhes da ocorrência
      const data = await ocorrenciasService.buscarOcorrenciaPorId(idOcorrencia);
      
      // Definindo os dados e abrindo o modal de edição
      setDadosOcorrencia(data);
      setModalEditar(true);
    } catch (err) {
      console.error('Erro ao buscar detalhes para edição:', err);
      setError('Erro ao carregar detalhes da ocorrência para edição. Tente novamente.');
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const [ modalConfirmacao, setModalConfirmacao ] = useState(false);
  const [ idParaExcluir, setIdParaExcluir ] = useState(null);

  const confirmarExclusao = (idOcorrencia) => {
    setIdParaExcluir(idOcorrencia);
    setModalConfirmacao(true);
  };

  const excluirOcorrencia = async () => {
    if (!idParaExcluir) return;
    
    setLoadingDetalhes(true);
    try {
      // Usando o serviço centralizado para excluir a ocorrência
      await ocorrenciasService.excluirOcorrencia(idParaExcluir);
      
      // Atualiza os estados locais após exclusão bem-sucedida
      setServicos(prevServicos => prevServicos.filter(servico => servico.id !== idParaExcluir));
      setFilteredServicos(prevFiltered => prevFiltered.filter(servico => servico.id !== idParaExcluir));
      setModalConfirmacao(false);
      setIdParaExcluir(null);
      
      // Mostrar alerta de sucesso no componente pai
      if (showAlertParent) {
        showAlertParent('Ocorrência excluída com sucesso.', 'success');
      }
    } catch (error) {
      const mensagem = 'Erro ao excluir a ocorrência. Tente novamente.';
      setError(mensagem);
      console.error('Erro ao excluir ocorrência:', error);
      if (showAlertParent) showAlertParent(mensagem, 'danger');
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Expor a função de recarregamento para o componente pai
  useImperativeHandle(ref, () => ({
    recarregarDados: carregarServicos
  }));

  // Carregar dados na inicialização
  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  // Efeito para filtrar os dados com debounce
  useEffect(() => {
    const debounced = debounce(() => {
      if (!filtroConteudo) {
        setFilteredServicos(servicos);
      } else {
        const filtered = servicos.filter(servico =>
          servico.numeroOS?.toLowerCase().includes(filtroConteudo.toLowerCase()) ||
          servico.unidadeConsumidora?.toLowerCase().includes(filtroConteudo.toLowerCase()) ||
          servico.dataInicio?.toLowerCase().includes(filtroConteudo.toLowerCase()) ||
          servico.usuarioRegistro?.toLowerCase().includes(filtroConteudo.toLowerCase())
        );
        setFilteredServicos(filtered);
      }
      setCurrentPage(1);
    }, 400);
    debounced();
    return debounced.cancel;
  }, [filtroConteudo, servicos]);

  // Efeito para filtrar os dados - Removido pois está duplicado com o useEffect com debounce acima

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredServicos.length / itemsPerPage);
  const paginatedServicos = filteredServicos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para download dos dados
  const handleDownload = async () => {
    try {
      setLoading(true);
      // Implementação do download quando houver dados
      if (filteredServicos.length === 0) {
        setError('Nenhum dado disponível para download.');
        return;
      }
      const csvContent = [
        [ 'Número OS', 'UN. Consumidora', 'Data/Hora Início', 'Usuário Registro' ],
        ...filteredServicos.map(servico => [
          servico.numeroOS,
          servico.unidadeConsumidora,
          servico.dataInicio,
          servico.usuarioRegistro
        ])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([ csvContent ], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `servicos_${new Date().toISOString().split('T')[ 0 ]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Erro ao fazer download dos dados.');
      console.error('Erro no download:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <CRow>
        <CCol lg={12}>
          <CCard className="shadow mb-4">
            <CCardHeader>
              <h6 className="m-0 font-weight-bold text-primary">Lista de Serviços</h6>
            </CCardHeader>
            <CCardBody>
              {/* Alerta de erro */}
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}

              {/* Controles superiores */}
              <CRow className="mb-3 align-items-end">
                <CCol lg={3} md={4} sm={6} className="mb-2">
                  <CFormSelect
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10 resultados por página</option>
                    <option value={25}>25 resultados por página</option>
                    <option value={50}>50 resultados por página</option>
                    <option value={100}>100 resultados por página</option>
                  </CFormSelect>
                </CCol>

                <CCol lg={2} md={3} sm={6} className="mb-2">
                  <CButton
                    color="success"
                    onClick={handleDownload}
                    disabled={loading || filteredServicos.length === 0}
                    className="d-flex align-items-center justify-content-center gap-2 w-100"
                  >
                    {loading ? <CSpinner size="sm" /> : <CIcon icon={cilCloudDownload} />}
                    Download
                  </CButton>
                </CCol>

                <CCol lg={7} md={5} sm={12} className="mb-2">
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilMagnifyingGlass} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Filtrar conteúdo"
                      value={filtroConteudo}
                      onChange={(e) => setFiltroConteudo(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              {/* Tabela */}
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center py-4">
                    <CSpinner />
                    <div className="mt-2">Carregando serviços...</div>
                  </div>
                ) : (
                  <CTable hover bordered className="mb-0">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell className="text-nowrap">Número OS</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">UN. Consumidora</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">Data/Hora Início</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">Usuário Registro</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap text-center">Ações</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {paginatedServicos.length > 0 ? (
                        paginatedServicos.map((servico) => (
                          <CTableRow key={servico.id}>
                            <CTableDataCell className="text-nowrap">{servico.numeroOS}</CTableDataCell>
                            <CTableDataCell>{servico.unidadeConsumidora}</CTableDataCell>
                            <CTableDataCell className="text-nowrap">{servico.dataInicio}</CTableDataCell>
                            <CTableDataCell>{servico.usuarioRegistro}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              {podeEditar ? (
                                <CTooltip content="Editar serviço">
                                  <CButton
                                    color="secondary"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => editarServico(servico.id)}
                                    disabled={loadingDetalhes}
                                    aria-label="Editar serviço"
                                    className="me-2"
                                  >
                                    <CIcon icon={cilPencil} />
                                  </CButton>
                                </CTooltip>
                              ) : (
                                <CTooltip content="Visualizar detalhes">
                                  <CButton
                                    color="info"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => buscarDetalhesOcorrencia(servico.id)}
                                    disabled={loadingDetalhes}
                                    aria-label="Visualizar detalhes"
                                    className="me-2"
                                  >
                                    <CIcon icon={cilInfo} />
                                  </CButton>
                                </CTooltip>
                              )}
                              {podeDeletar && (
                                <CTooltip content="Excluir serviço">
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => confirmarExclusao(servico.id)}
                                    disabled={loadingDetalhes}
                                    aria-label="Excluir serviço"
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CTooltip>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan={5} className="text-center py-4">
                            <div className="text-muted">
                              <div>Nenhum serviço encontrado</div>
                              {filtroConteudo && (
                                <small>Tente ajustar os filtros de busca</small>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody >
                  </CTable >
                )}
              </div >

              {/* Informações de paginação e controles */}
              {
                filteredServicos.length > 0 && (
                  <CRow className="align-items-center mt-3 pt-3 border-top">
                    <CCol lg={6} md={6} sm={12} className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Mostrando de {((currentPage - 1) * itemsPerPage) + 1} até{' '}
                        {Math.min(currentPage * itemsPerPage, filteredServicos.length)} de{' '}
                        {filteredServicos.length} registros
                      </small>
                    </CCol>

                    <CCol lg={6} md={6} sm={12}>
                      {totalPages > 1 && (
                        <CPagination align="end" className="mb-0 justify-content-center justify-content-md-end">
                          <CPaginationItem
                            aria-label="Previous"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                          >
                            <span aria-hidden="true">&laquo;</span>
                          </CPaginationItem>

                          {Array.from({ length: totalPages }, (_, idx) => {
                            const pageNumber = idx + 1;
                            // Mostrar apenas algumas páginas para não sobrecarregar a interface
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                            ) {
                              return (
                                <CPaginationItem
                                  key={pageNumber}
                                  active={currentPage === pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </CPaginationItem>
                              );
                            } else if (
                              pageNumber === currentPage - 3 ||
                              pageNumber === currentPage + 3
                            ) {
                              return (
                                <CPaginationItem key={pageNumber} disabled>
                                  ...
                                </CPaginationItem>
                              );
                            }
                            return null;
                          })}

                          <CPaginationItem
                            aria-label="Next"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                          >
                            <span aria-hidden="true">&raquo;</span>
                          </CPaginationItem>
                        </CPagination>
                      )}
                    </CCol>
                  </CRow>
                )
              }
            </CCardBody >
          </CCard >
        </CCol >
      </CRow >

      {/* Modal de Visualização - Reutilizando o ServicosModal existente */}
      < ServicosModal
        visible={modalVisualizar}
        setVisible={setModalVisualizar}
        modoVisualizacao={true}
        dadosOcorrencia={dadosOcorrencia}
      />

      {/* Modal de Edição - Reutilizando o ServicosModal existente */}
      < ServicosModal
        visible={modalEditar}
        setVisible={setModalEditar}
        modoEdicao={true}
        dadosOcorrencia={dadosOcorrencia}
        onSuccess={() => {
          // Recarregar dados da tabela após edição bem-sucedida
          carregarServicos();
          if (showAlertParent) {
            showAlertParent('Ordem de serviço atualizada com sucesso!', 'success');
          }
        }}
        showAlertParent={showAlertParent}
      />


      <CModal visible={modalConfirmacao} onClose={() => setModalConfirmacao(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar exclusão</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Tem certeza que deseja excluir esta ocorrência (ID: {idParaExcluir})? Esta ação não pode ser desfeita.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalConfirmacao(false)} disabled={loadingDetalhes}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={excluirOcorrencia} disabled={loadingDetalhes}>
            {loadingDetalhes ? <CSpinner size="sm" /> : 'Excluir'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div >
  );
});

export default ServicosTabela;
