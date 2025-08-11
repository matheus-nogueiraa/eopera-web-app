import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass, cilCloudDownload } from '@coreui/icons';
import httpRequest from '../../utils/httpRequests';

const ServicosTabela = forwardRef((props, ref) => {
  // Estados para os dados da tabela
  const [servicos, setServicos] = useState([]);
  const [filteredServicos, setFilteredServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para filtros
  const [filtroConteudo, setFiltroConteudo] = useState('');

  // Função para carregar serviços da API
  const carregarServicos = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Configuração do fetch
      const response = await httpRequest('/consultarOcorrenciasEoperaX', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        // Formatar os dados para o formato esperado pela tabela
        const servicosFormatados = result.data.map(item => ({
          id: item.idOcorrencia,
          numeroOS: item.numOs.trim(),
          unidadeConsumidora: item.unidadeConsumidora.trim(),
          dataInicio: formatarDataHora(item.data, item.hora),
          usuarioRegistro: item.ZCC_NOME || ''
        }));
        
        setServicos(servicosFormatados);
        setFilteredServicos(servicosFormatados);
      } else {
        setServicos([]);
        setFilteredServicos([]);
        setError(result.messsage || 'Nenhum dado disponível');
      }
    } catch (err) {
      setError('Erro ao carregar os serviços. Tente novamente.');
      console.error('Erro ao carregar serviços:', err);
      setServicos([]);
      setFilteredServicos([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Expor a função de recarregamento para o componente pai
  useImperativeHandle(ref, () => ({
    recarregarDados: carregarServicos
  }));

  // Carregar dados na inicialização
  useEffect(() => {
    carregarServicos();
  }, []);

  // Efeito para filtrar os dados
  useEffect(() => {
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
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, [filtroConteudo, servicos]);

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
      // Para usar a API real, descomente a linha abaixo
      // const blob = await servicosService.exportarServicos('csv', { filtro: filtroConteudo });
      
      // Implementação do download quando houver dados
      if (filteredServicos.length === 0) {
        setError('Nenhum dado disponível para download.');
        return;
      }

      const csvContent = [
        ['Número OS', 'UN. Consumidora', 'Data/Hora Início', 'Usuário Registro'],
        ...filteredServicos.map(servico => [
          servico.numeroOS,
          servico.unidadeConsumidora,
          servico.dataInicio,
          servico.usuarioRegistro
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `servicos_${new Date().toISOString().split('T')[0]}.csv`);
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
                  <CTable hover className="mb-0">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell className="text-nowrap">Número OS</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">UN. Consumidora</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">Data/Hora Início</CTableHeaderCell>
                        <CTableHeaderCell className="text-nowrap">Usuário Registro</CTableHeaderCell>
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
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan={4} className="text-center py-4">
                            <div className="text-muted">
                              <div>Nenhum serviço encontrado</div>
                              {filtroConteudo && (
                                <small>Tente ajustar os filtros de busca</small>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </div>

              {/* Informações de paginação e controles */}
              {filteredServicos.length > 0 && (
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
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
});

export default ServicosTabela;
