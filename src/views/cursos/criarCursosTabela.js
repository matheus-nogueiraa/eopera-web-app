
import React from 'react';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge } from '@coreui/react';
import { CIcon } from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'

// Exemplo de dados mockados
const dados = [
  {
    id: 1,
    nome: 'Conteúdo Exemplo',
    url: 'https://youtube.com/exemplo',
    categoria: 'Categoria 1',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Outro Conteúdo',
    url: 'https://youtube.com/outro',
    categoria: 'Categoria 2',
    ativo: false,
  },
];

const CriarConteudoTabela = () => {
  return (
    <CTable hover responsive bordered align="middle" className="mt-4">
      <CTableHead color="light">
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>Nome</CTableHeaderCell>
        <CTableHeaderCell>Url do vídeo</CTableHeaderCell>
        <CTableHeaderCell>Categoria</CTableHeaderCell>
        <CTableHeaderCell>Status</CTableHeaderCell>
        <CTableHeaderCell>Ações</CTableHeaderCell>
      </CTableRow>
      </CTableHead>
      <CTableBody>
      {dados.map((item) => (
        <CTableRow key={item.id}>
        <CTableDataCell>{item.id}</CTableDataCell>
        <CTableDataCell>{item.nome}</CTableDataCell>
        <CTableDataCell>
          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
        </CTableDataCell>
        <CTableDataCell>{item.categoria}</CTableDataCell>
        <CTableDataCell>
          {item.ativo ? (
          <CBadge color="success">Ativo</CBadge>
          ) : (
          <CBadge color="secondary">Inativo</CBadge>
          )}
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <button className="btn btn-primary btn-sm">
          <CIcon icon={cilPencil} className="me-1" />
          Editar
          </button>
        </CTableDataCell>
        </CTableRow>
      ))}
      </CTableBody>
    </CTable>
  );
};

export default CriarConteudoTabela;
