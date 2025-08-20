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
  CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilLockLocked, cilLockLocked, cilPencil from '@coreui/icons'

const UsuariosTabela = ({
  paginatedUsuarios,
  formatarCPF,
  getTipoUsuarioBadge,
  handleEdit,
  gerenciar-usuarios-atualizado
  handleEditPermissao,
  handleDelete,
  loading,
  termoPesquisa,
  podeEditar,
  podeDeletar,
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

  // Função para formatar e exibir a matrícula/projeto
  const formatarMatriculaProjeto = (user) => {
    const temMatricula = user.matricula && user.matricula.trim()
    const temProjetoPj = user.projetoPj && user.projetoPj.trim()

    // Se tem ambos, mostrar os dois
    if (temMatricula && temProjetoPj) {
      const codigoProjeto = user.projetoPj.split(' - ')[0] || user.projetoPj
      return (
        <div className="d-flex flex-column align-items-center">
          <strong className="text-primary" title={`Matrícula CLT: ${user.matricula}`}>
            {user.matricula}
          </strong>
          <small className="text-success" title={`Projeto PJ: ${user.projetoPj}`}>
            {codigoProjeto}
          </small>
        </div>
      )
    }

    // Se é PJ e tem projeto PJ, mostrar o código do projeto
    if (user.tipoUsuario === 'PJ' && temProjetoPj) {
      const codigoProjeto = user.projetoPj.split(' - ')[0] || user.projetoPj
      return (
        <strong className="text-success" title={`Projeto PJ: ${user.projetoPj}`}>
          {codigoProjeto}
        </strong>
      )
    }

    // Se é CLT ou tem matrícula, mostrar a matrícula
    if (temMatricula) {
      return (
        <strong className="text-primary" title={`Matrícula CLT: ${user.matricula}`}>
          {user.matricula}
        </strong>
      )
    }

    // Caso não tenha nem matrícula nem projeto
    return (
      <span className="text-muted" title="Não informado">
        -
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
          <CTableHeaderCell className="text-center">Contrato</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {paginatedUsuarios.map((user, index) => (
          <CTableRow key={user.id || index}>
            <CTableDataCell className="text-center">
              {formatarMatriculaProjeto(user)}
            </CTableDataCell>
            <CTableDataCell>{user.nome}</CTableDataCell>
            <CTableDataCell className="text-center">{formatarCPF(user.cpf)}</CTableDataCell>
            <CTableDataCell className="text-center">
              {getTipoUsuarioBadge(user.tipoUsuario)}
            </CTableDataCell>
            <CTableDataCell>
              {/*Grupo de botões da tabela */}
             <CButtonGroup className="w-100">
                {/* {podeEditar && (
                  <CTooltip
                    content="Editar usuário"
                    placement="top"
                  >
                    <CButton
                      className="flex-fill"
                      color="warning"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      disabled={loading}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                  </CTooltip>
                )} */}
                <CTooltip
                  content="Alterar permissões"
                  placement="top"
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
