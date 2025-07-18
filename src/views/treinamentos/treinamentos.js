
import React from 'react';
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
  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 32, fontWeight: 800, letterSpacing: 0.5, color: '#222' }}>Treinamentos</h2>
      <CRow className="g-3">
        {treinamentos.map((treinamento, idx) => (
          <CCol key={idx} xs={12} sm={6} lg={4} xl={3}>
            <CCard className="h-100 border-0" style={{ borderRadius: 18, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07)' }}>
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
                  <CButton color="primary" href={treinamento.link} style={{ fontWeight: 700, borderRadius: 8, minWidth: 100 }}>Acessar</CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  );
};

export default Treinamentos;
