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
  CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilLockLocked } from '@coreui/icons'

const UsuariosTabela = ({
  paginatedUsuarios,
  formatarCPF,
  getTipoUsuarioBadge,
  handleEdit,
  handleEditPermissao,
  handleDelete,
  loading,
  termoPesquisa,
}) => {
  return (
    <CTable hover bordered align="middle" responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell className='text-center'>Matrícula</CTableHeaderCell>
          <CTableHeaderCell >Nome</CTableHeaderCell>
          <CTableHeaderCell className='text-center'>CPF</CTableHeaderCell>
          <CTableHeaderCell className='text-center'>Tipo de Usuário</CTableHeaderCell>
          <CTableHeaderCell>Ações</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {paginatedUsuarios.map((user) => (
          <CTableRow key={user.matricula}>
            <CTableDataCell className='text-center'>
              <strong className="text-primary">{user.matricula}</strong>
            </CTableDataCell>
            <CTableDataCell>{user.nome}</CTableDataCell>
            <CTableDataCell className='text-center'>{formatarCPF(user.cpf)}</CTableDataCell>
            <CTableDataCell className='text-center'>{getTipoUsuarioBadge(user.tipoUsuario)}</CTableDataCell>

            <CTableDataCell>
              <CButtonGroup className="w-100">
                {/* <CButton
                  className="flex-fill"
                  color="warning"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  disabled={loading}
                >
                  <CIcon icon={cilPencil} />
                </CButton> */}
                <CTooltip
                  content="Alterar permissões"
                  placement="right"
                >
                  <CButton
                    className="flex-fill"
                    color="info"
                    size="sm"
                    onClick={() => handleEditPermissao(user)}
                    disabled={loading}
                  >
                    <CIcon icon={cilLockLocked} />
                  </CButton>
                </CTooltip>
                {/* <CButton
                  color="primary"
                  size="sm"
                  onClick={() => handleDelete(user.matricula)}
                  disabled={loading}
                >
                  <CIcon icon={cilTrash} />
                </CButton> */}
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
