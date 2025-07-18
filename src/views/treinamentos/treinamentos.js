
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CButton,
  CRow,
  CCol,
  CBadge,
  CCardHeader,
  CAvatar
} from '@coreui/react';
import { cilTerminal, cilGlobeAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const treinamentos = [
  {
    categoria: 'Desenvolvimento',
    titulo: 'Style Guide - Filter',
    descricao: 'Neste treinamento, você irá aprender tudo o que é necessário para desenvolver e personalizar filtros na plataforma Fluig, desde a criação do seu primeiro filtro até a integração com APIs!',
    icone: cilTerminal,
    cor: 'primary',
    gratuito: true,
    link: '#'
  },
  {
    categoria: 'Desenvolvimento',
    titulo: 'Style Guide - Datatable',
    descricao: 'Neste treinamento, você irá aprender a criar e manipular DataTables no Fluig, desde a configuração inicial até a implementação de funcionalidades avançadas como edição e busca.',
    icone: cilTerminal,
    cor: 'primary',
    gratuito: true,
    link: '#'
  },
  {
    categoria: 'Desenvolvimento',
    titulo: 'Como fazer - TOTVS Fluig - Modal de seleção de documentos',
    descricao: 'Neste curso, você aprenderá a configurar e utilizar o componente de Busca de Documentos.',
    icone: cilTerminal,
    cor: 'primary',
    gratuito: true,
    link: '#'
  },
  {
    categoria: 'Negócio',
    titulo: 'Como fazer - Gestão de Papéis no TOTVS Fluig',
    descricao: 'Aprenda sobre a gestão de papéis no TOTVS Fluig.',
    icone: cilGlobeAlt,
    cor: 'warning',
    gratuito: true,
    link: '#'
  }
];



const Treinamentos = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 32, fontWeight: 800, letterSpacing: 0.5, color: '#222' }}>Treinamentos</h2>
      <style>{`
        .treinamento-card {
          border-radius: 18px !important;
          box-shadow: 0 8px 32px 0 rgba(34, 34, 34, 0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10);
          border: 1.5px solid transparent !important;
          transition: border-color 0.2s;
          position: relative;
          z-index: 1;
        }
        .treinamento-card:hover {
          border-color: #c2001a !important;
          z-index: 2;
        }
      `}</style>
      <CRow className="g-3">
      {treinamentos.map((treinamento, idx) => (
        <CCol key={idx} xs={12} sm={6} lg={4} xl={3}>
        <CCard className="h-100 treinamento-card">
          <CCardBody className="d-flex flex-column justify-content-between p-4" style={{ minHeight: 340 }}>
          <div className="d-flex align-items-center mb-3">
            <CAvatar size="lg" color={treinamento.cor} className="me-3">
            <CIcon icon={treinamento.icone} size="xl" style={{ color: treinamento.cor === 'primary' ? '#fff' : undefined }} />
            </CAvatar>
            <div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#888' }}>{treinamento.categoria}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <CCardTitle style={{ fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 10 }}>{treinamento.titulo}</CCardTitle>
            <CCardText style={{ color: '#555', fontSize: 15, minHeight: 70 }}>{treinamento.descricao}</CCardText>
          </div>
          <div className="d-flex justify-content-end align-items-end mt-4">
            <CButton color="primary" onClick={() => navigate(`/treinamentos/${idx}`)} className="w-100">Acessar</CButton>
          </div>
          </CCardBody>
        </CCard>
        </CCol>
      ))}
      </CRow>
    </div>
    );
};


// Exporta o array para uso no detalhe
export { treinamentos };

export default Treinamentos;
