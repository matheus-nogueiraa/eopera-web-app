// FormularioAcoes component - Users and Services management

import React from 'react';
import PropTypes from 'prop-types';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormTextarea,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckAlt, cilX, cilCamera, cilTrash } from '@coreui/icons';
import FieldError from './common/FieldError';
import Autocomplete from './common/Autocomplete';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { formatUserInfo } from '../utils/formatters';
import { filtrarUsuarios } from '../../../services/usuariosService';

/**
 * FormularioAcoes Component - Manages users and services
 * @param {Object} props - Component props
 */
const FormularioAcoes = ({ 
  camposComErro,
  usuarios,
  servicos,
  isLider,
  todosUsuarios,
  todosServicos,
  onAdicionarUsuario,
  onRemoverUsuario,
  onAdicionarServico,
  onRemoverServico,
  onAtualizarServico,
  onImageUpload,
  onRemoverFoto,
  onLiderChange,
  setUsuarioSelecionado,
  setUsuarioInfo
}) => {
  // Autocomplete for usuarios
  const usuarioAutocomplete = useAutocomplete(
    async (termo) => {
      return filtrarUsuarios(todosUsuarios, termo);
    },
    null,
    formatUserInfo
  );

  const handleUsuarioSelect = (usuario) => {
    usuarioAutocomplete.selecionarItem(usuario);
    setUsuarioSelecionado(usuario.nome);
    setUsuarioInfo({
      matricula: usuario.matricula,
      nome: usuario.nome,
      cpf: usuario.cpf
    });
  };

  const handleAdicionarUsuario = () => {
    const success = onAdicionarUsuario(usuarioAutocomplete.itemInfo, isLider);
    if (success) {
      usuarioAutocomplete.limpar();
      setUsuarioSelecionado('');
      setUsuarioInfo({ matricula: '', nome: '', cpf: '' });
      onLiderChange(false);
    }
  };

  // Service autocomplete (using filter locally)
  const filtrarServicos = (termo) => {
    if (!todosServicos || todosServicos.length === 0) return [];
    const termoLower = termo.toLowerCase().trim();
    return todosServicos.filter(servico =>
      servico.idServico?.toLowerCase().includes(termoLower) ||
      servico.descricao?.toLowerCase().includes(termoLower)
    ).slice(0, 20);
  };

  return (
    <>
      {/* Seção de Usuários */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Usuários</h6>
          <CButton
            color="dark"
            size="sm"
            onClick={handleAdicionarUsuario}
            disabled={!usuarioAutocomplete.itemInfo.nome}
          >
            Adicionar Usuário
          </CButton>
        </div>
        
        <FieldError error={camposComErro.usuarios} />
        <FieldError error={camposComErro.lider} />

        <CCard className="border">
          <CCardBody className="p-3">
            <CRow className="mb-3 align-items-center">
              <CCol md={7}>
                <Autocomplete
                  inputRef={usuarioAutocomplete.inputRef}
                  value={usuarioAutocomplete.valorSelecionado}
                  onChange={usuarioAutocomplete.handleInputChange}
                  onKeyDown={usuarioAutocomplete.handleKeyDown}
                  placeholder="Digite nome, matrícula ou CPF do usuário"
                  loading={usuarioAutocomplete.loading}
                  options={usuarioAutocomplete.opcoes}
                  dropdownVisible={usuarioAutocomplete.dropdownVisivel}
                  selectedIndex={usuarioAutocomplete.selectedIndex}
                  onSelectItem={handleUsuarioSelect}
                  renderOption={(usuario) => (
                    <div>
                      <strong>{usuario.nome?.trim()}</strong>
                      <div className="text-muted small">
                        Mat: {usuario.matricula} | CPF: {usuario.cpf} | Tipo: {usuario.tipoUsuario}
                      </div>
                    </div>
                  )}
                  renderNoResults={() => 'Nenhum usuário encontrado'}
                />
              </CCol>
              <CCol md={3} className="text-center">
                <CFormCheck
                  id="checkLider"
                  label="Líder"
                  checked={isLider}
                  onChange={(e) => onLiderChange(e.target.checked)}
                  style={{
                    fontSize: '1.5rem',
                    '--cui-form-check-input-width': '1.7em',
                    '--cui-form-check-input-height': '1.7em',
                    marginLeft: '0.5rem'
                  }}
                />
              </CCol>
            </CRow>

            {usuarios.length > 0 && (
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
                          <CBadge color="success">
                            <CIcon icon={cilCheckAlt} size="sm" />
                          </CBadge>
                        ) : (
                          <CBadge color="secondary">
                            <CIcon icon={cilX} size="sm" />
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoverUsuario(index)}
                        >
                          <CIcon icon={cilX} size="sm" />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </div>

      {/* Seção de Serviços */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Serviços</h6>
          <CButton
            color="primary"
            size="sm"
            onClick={onAdicionarServico}
          >
            Adicionar Serviço
          </CButton>
        </div>
        
        <FieldError error={camposComErro.servicos} />

        {servicos.map((servico, index) => (
          <CCard key={index} className="border mb-3">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Serviço {index + 1}</span>
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                onClick={() => onRemoverServico(index)}
              >
                <CIcon icon={cilTrash} size="sm" />
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    value={servico.servico}
                    onChange={(e) => {
                      const valor = e.target.value;
                      onAtualizarServico(index, 'servico', valor);
                      
                      // Simple filtering logic
                      if (valor.length >= 2) {
                        const filtrados = filtrarServicos(valor);
                        // Would need to implement dropdown state management here
                        // For simplicity, using basic input for now
                      }
                    }}
                    placeholder="Digite o nome do serviço"
                  />
                </CCol>
              </CRow>

                <CRow className="mb-3">
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      placeholder="Quantidade"
                      value={servico.quantidade}
                      onChange={(e) => onAtualizarServico(index, 'quantidade', e.target.value)}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      placeholder="Valor Grupo"
                      value={servico.valorGrupo}
                      onChange={(e) => onAtualizarServico(index, 'valorGrupo', e.target.value)}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      placeholder="Valor Serviço"
                      value={servico.valorServico}
                      onChange={(e) => onAtualizarServico(index, 'valorServico', e.target.value)}
                    />
                  </CCol>
                  <CCol md={3}>
                    <div className="position-relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onImageUpload(e, index)}
                        style={{ display: 'none' }}
                        id={`fileInput-${index}`}
                      />
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`fileInput-${index}`).click()}
                        className="w-100"
                      >
                        <CIcon icon={cilCamera} size="sm" className="me-1" />
                        Fotos ({servico.fotos?.length || 0})
                      </CButton>
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormTextarea
                      placeholder="Observações"
                      value={servico.observacao}
                      onChange={(e) => onAtualizarServico(index, 'observacao', e.target.value)}
                      rows={2}
                    />
                  </CCol>
                </CRow>

                {servico.fotos && servico.fotos.length > 0 && (
                  <CRow>
                    <CCol md={12}>
                      <div className="d-flex flex-wrap gap-2">
                        {servico.fotos.map((foto, fotoIndex) => (
                          <div key={fotoIndex} className="position-relative">
                            <img
                              src={`data:image/jpeg;base64,${foto.base64}`}
                              alt={`Foto ${fotoIndex + 1}`}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                            <CButton
                              color="danger"
                              size="sm"
                              className="position-absolute top-0 end-0"
                              style={{
                                width: '20px',
                                height: '20px',
                                padding: '0',
                                fontSize: '10px',
                                transform: 'translate(50%, -50%)'
                              }}
                              onClick={() => onRemoverFoto(index, fotoIndex)}
                            >
                              <CIcon icon={cilX} size="sm" />
                            </CButton>
                          </div>
                        ))}
                      </div>
                    </CCol>
                  </CRow>
                )}
              </CCardBody>
            </CCard>
          )
        )}
      </div>
    </>
  );
};

FormularioAcoes.propTypes = {
  camposComErro: PropTypes.object.isRequired,
  usuarios: PropTypes.array.isRequired,
  servicos: PropTypes.array.isRequired,
  isLider: PropTypes.bool.isRequired,
  todosUsuarios: PropTypes.array,
  todosServicos: PropTypes.array,
  onAdicionarUsuario: PropTypes.func.isRequired,
  onRemoverUsuario: PropTypes.func.isRequired,
  onAdicionarServico: PropTypes.func.isRequired,
  onRemoverServico: PropTypes.func.isRequired,
  onAtualizarServico: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  onRemoverFoto: PropTypes.func.isRequired,
  onLiderChange: PropTypes.func.isRequired,
  setUsuarioSelecionado: PropTypes.func.isRequired,
  setUsuarioInfo: PropTypes.func.isRequired
};

FormularioAcoes.defaultProps = {
  todosUsuarios: [],
  todosServicos: []
};

export default FormularioAcoes;