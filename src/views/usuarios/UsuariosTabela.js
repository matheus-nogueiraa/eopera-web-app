import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CButtonGroup,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilPencil } from '@coreui/icons'

const UsuariosTabela = ({
  paginatedUsuarios,
  formatarCPF,
  getTipoUsuarioBadge,
  handleEdit,
  loading,
  termoPesquisa,
}) => {
  // Função para formatar e exibir o grupo
  const formatarGrupo = (grupo) => {
    if (!grupo || grupo === 'Não definido') {
      return (
        <CBadge color="secondary" className="text-wrap">
          Não definido
        </CBadge>
      )
    }

    // Se o grupo é muito longo, truncar para melhor visualização
    if (grupo.length > 30) {
      return (
        <span className="text-wrap" title={grupo}>
          {grupo.substring(0, 27)}...
        </span>
      )
    }

    return (
      <span className="text-wrap" title={grupo}>
        {grupo}
      </span>
    )
  }

  return (
    <CTable hover bordered align="middle" responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell className="text-center">Matrícula</CTableHeaderCell>
          <CTableHeaderCell>Nome</CTableHeaderCell>
          <CTableHeaderCell className="text-center">CPF</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Tipo de Usuário</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {paginatedUsuarios.map((user, index) => (
          <CTableRow key={user.id || index}>
            <CTableDataCell className="text-center">
              <strong className="text-primary">{user.matricula}</strong>
            </CTableDataCell>
            <CTableDataCell>{user.nome}</CTableDataCell>
            <CTableDataCell className="text-center">{formatarCPF(user.cpf)}</CTableDataCell>
            <CTableDataCell className="text-center">
              {getTipoUsuarioBadge(user.tipoUsuario)}
            </CTableDataCell>
            <CTableDataCell>
              {/*Grupo de botões da tabela */}
              <CButtonGroup className="w-100">
                {/*Editar usuário*/}
                <CButton
                  className="flex-fill"
                  color="info"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  disabled={loading}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                {/*Permissões do Usuario */}
                <CButton
                  className="flex-fill"
                  color="warning"
                  size="sm"
                  disabled={loading}
                >
                  <CIcon icon={cilLockLocked} />
                </CButton>
              </CButtonGroup>
            </CTableDataCell>
          </CTableRow>
        ))}
        {paginatedUsuarios.length === 0 && !loading && (
          <CTableRow>
            <CTableDataCell colSpan="6" className="text-center">
              {termoPesquisa
                ? 'Nenhum usuário encontrado para esta pesquisa'
                : 'Nenhum usuário encontrado na API'}
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )
}

export default UsuariosTabela
