import React, { useState } from 'react';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';

const ServicosModal = ({ visible, setVisible }) => {
  const [ usuarios, setUsuarios ] = useState([]);
  const [ servicos, setServicos ] = useState([]);
  const [ novoUsuario, setNovoUsuario ] = useState('');
  const [ isLider, setIsLider ] = useState(false);

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
    setServicos([ ...servicos, { servico: '', observacao: '', valorGrupo: '', valorServico: '', quantidade: '' } ]);
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

  return (
    <CModal
      visible={visible}
      onClose={() => setVisible(false)}
      size="xl"
    >
      <CModalHeader>
        <CModalTitle>Ordem de Serviço</CModalTitle>
      </CModalHeader>
      <CModalBody className="pb-0">
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
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
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
            <CFormInput id="endereco" />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="bairro" className="mb-1">Bairro:</CFormLabel>
            <CFormInput id="bairro" />
          </CCol>
          <CCol md={3}>
            <CFormLabel htmlFor="municipio" className="mb-1">Município:</CFormLabel>
            <CFormInput id="municipio" />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="cep" className="mb-1">CEP:</CFormLabel>
            <CFormInput id="cep" />
          </CCol>
        </CRow>

        {/* Terceira linha */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CFormCheck
              id="ocorrenciaSemEndereco"
              label="Ocorrência sem endereço"
            />
          </CCol>
        </CRow>

        {/* Quarta linha */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CFormLabel htmlFor="latitude" className="mb-1">Latitude:</CFormLabel>
            <CFormInput id="latitude" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="longitude" className="mb-1">Longitude:</CFormLabel>
            <CFormInput id="longitude" />
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
            <CFormSelect id="centroDeCustos">
              <option value="">Selecione um Centro de Custo</option>
            </CFormSelect>
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
            <CCardHeader className="bg-light py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span>Usuário</span>
                <span>Líder</span>
                <span>Ação</span>
              </div>
            </CCardHeader>
            <CCardBody className="p-3">
              <CRow className="mb-3 align-items-center">
                <CCol md={10}>
                  <CFormInput
                    value={novoUsuario}
                    onChange={(e) => setNovoUsuario(e.target.value)}
                    placeholder="Nome do usuário"
                  />
                </CCol>
                <CCol md={2}>
                  <CFormCheck
                    id="checkLider"
                    label="Líder"
                    checked={isLider}
                    onChange={(e) => setIsLider(e.target.checked)}
                  />
                </CCol>
              </CRow>

              <CTable hover className="mb-0" responsive>
                <CTableHead className="d-none">
                  <CTableRow>
                    <CTableHeaderCell>Usuário</CTableHeaderCell>
                    <CTableHeaderCell>Líder</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Ação</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {usuarios.map((usuario, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{usuario.nome}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {usuario.lider ? (
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '24px', height: '24px' }}>
                            ✓
                          </div>
                        ) : null}
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

        {/* Seção de Serviços */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Serviços</h6>
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
              <div className="d-flex justify-content-between align-items-center">
                <span>Serviço</span>
                <span>Observação</span>
                <span>Valor Grupo</span>
                <span>Valor Serviço</span>
                <span>Quantidade</span>
                <span>Ação</span>
              </div>
            </CCardHeader>
            <CCardBody className="p-3">
              <CTable hover responsive className="mb-0">
                <CTableHead className="d-none">
                  <CTableRow>
                    <CTableHeaderCell>Serviço</CTableHeaderCell>
                    <CTableHeaderCell>Observação</CTableHeaderCell>
                    <CTableHeaderCell>Valor Grupo</CTableHeaderCell>
                    <CTableHeaderCell>Valor Serviço</CTableHeaderCell>
                    <CTableHeaderCell>Quantidade</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Ação</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {servicos.map((servico, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <CFormInput
                          value={servico.servico}
                          onChange={(e) => atualizarServico(index, 'servico', e.target.value)}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={servico.observacao}
                          onChange={(e) => atualizarServico(index, 'observacao', e.target.value)}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={servico.valorGrupo}
                          onChange={(e) => atualizarServico(index, 'valorGrupo', e.target.value)}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={servico.valorServico}
                          onChange={(e) => atualizarServico(index, 'valorServico', e.target.value)}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={servico.quantidade}
                          onChange={(e) => atualizarServico(index, 'quantidade', e.target.value)}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="light"
                          size="sm"
                          onClick={() => removerServico(index)}
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
      </CModalBody>
      <CModalFooter className="bg-light border-top">
        <CButton
          color="secondary"
          onClick={() => setVisible(false)}
          className="me-2"
        >
          Cancelar
        </CButton>
        <CButton
          color="primary"
        >
          Registrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ServicosModal;
