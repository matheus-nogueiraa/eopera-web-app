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
          <CTableRow key={index}>
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
                  color="secondary"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  disabled={loading}
                >
                  <CIcon icon={cilPencil} />
                </CButton>

                {/*Permissões do Usuario */}
                <CButton
                  className="flex-fill"
                  variant="outline"
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
            <CTableDataCell colSpan="5" className="text-center">
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
