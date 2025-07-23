
import React from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CPagination,
  CPaginationItem,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilInfo } from '@coreui/icons';

// Exemplo de dados mockados
const questionarios = [
  {
    id: 1,
    descricao: 'Questionário de React',
    curso: 'React Básico',
    perguntas: [
      {
        texto: 'O que é React?',
        tipo: 'unica',
        respostas: [
          { texto: 'Biblioteca JS', correta: true },
          { texto: 'Framework CSS', correta: false }
        ]
      }
    ],
    ativo: true,
  },
  {
    id: 2,
    descricao: 'Questionário de Vue',
    curso: 'Vue Intermediário',
    perguntas: [
      {
        texto: 'O que é Vue?',
        tipo: 'multipla',
        respostas: [
          { texto: 'Framework JS', correta: true },
          { texto: 'Biblioteca CSS', correta: false }
        ]
      }
    ],
    ativo: false,
  },
];

const CriarQuestionarioTabela = () => {
  return (
    <>
      <CTable hover responsive bordered align="middle" className="mt-4">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Descrição</CTableHeaderCell>
            <CTableHeaderCell>Curso</CTableHeaderCell>
            <CTableHeaderCell>Perguntas</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {questionarios.map((q) => (
            <CTableRow key={q.id}>
              <CTableDataCell>{q.id}</CTableDataCell>
              <CTableDataCell>{q.descricao}</CTableDataCell>
              <CTableDataCell>{q.curso}</CTableDataCell>
              <CTableDataCell>{q.perguntas.length}</CTableDataCell>
              <CTableDataCell>
                {q.ativo ? (
                  <CBadge color="success">Ativo</CBadge>
                ) : (
                  <CBadge color="secondary">Inativo</CBadge>
                )}
              </CTableDataCell>
              <CTableDataCell className="text-center">
                <button className="btn btn-warning btn-sm me-2">
                  <CIcon icon={cilInfo} className="me-1" />
                  Ver Detalhes
                </button>
                <button className="btn btn-primary btn-sm">
                  <CIcon icon={cilPencil} className="me-1" />
                  Editar
                </button>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <div className="d-flex justify-content-end mt-3">
        <CPagination aria-label="Page navigation example">
          <CPaginationItem aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </CPaginationItem>
          <CPaginationItem>1</CPaginationItem>
          <CPaginationItem aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </CPaginationItem>
        </CPagination>
      </div>
    </>
  )
};

export default CriarQuestionarioTabela;
