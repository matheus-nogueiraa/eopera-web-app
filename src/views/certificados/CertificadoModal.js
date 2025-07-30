
import { useState } from 'react';
import certificadosData from './certificados.json';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react';

function CertificadoModal({ onClose, certificado }) {
  if (!certificado) return null;

  // Dados do certificado (placeholders se não houver)
  const nome = certificado.nome || '{nome}';
  const curso = certificado.curso || '{curso}';
  const data = certificado.data || '{data}';
  const token = certificado.token || '{token}';
  const texto = certificado.texto
    ? certificado.texto.replace('{curso}', curso).replace('{data}', data)
    : `concluiu o conteúdo do curso de ${curso},\nno dia ${data}`;
  // Rodapé padrão igual ao modelo da imagem 1;

  return (
    <CModal visible size="xl" backdrop="static">
      <CModalHeader>
        <CModalTitle>Visualização de Certificado</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            margin: '0 auto',
            maxWidth: 800,
            minWidth: 350,
            padding: 0,
            boxShadow: '0 2px 16px #0002',
            border: 'none',
            position: 'relative',
          }}
        >
          {/* Borda superior */}
          <div style={{
            height: certificado.layout?.borda_espessura || 8,
            background: certificado.layout?.borda_cor || '#7a131a',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            width: '100%',
          }} />
          <div style={{ padding: '48px 32px 24px 32px', textAlign: 'center', position: 'relative', minHeight: 420 }}>
            <div style={{ borderBottom: '3px solid #7a131a', width: 80, margin: '0 auto 16px auto' }} />
            <h1 style={{
              fontWeight: 800,
              color: certificado.titulo_cor || '#222',
              fontSize: 32,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>{certificado.titulo || 'CERTIFICADO DE CONCLUSÃO'}</h1>
            <div style={{ fontSize: 20, marginBottom: 16, color: '#222' }}>{certificado.subtitulo || 'Certificamos que'}</div>
            <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 18, color: certificado.nome_cor || '#222', letterSpacing: 1 }}>
              {nome}
            </div>
            <div style={{ fontSize: 19, marginBottom: 32, color: certificado.texto_cor || '#222', whiteSpace: 'pre-line' }}>
              {texto}
            </div>
            {/* Rodapé com token e instrução de validação */}
            <div style={{
              fontSize: 13,
              color: certificado.rodape_texto_cor || '#222',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              margin: '0 auto',
              textAlign: 'center',
              paddingBottom: 12,
            }}></div>
            {/* Selo/logo no canto inferior direito */}
            {certificado.logo_selo && (
              <img src={certificado.logo_selo} alt="selo" style={{ width: 100, position: 'absolute', right: 32, bottom: 8 }} />
            )}
          </div>
          {/* Borda inferior */}
          <div style={{
            height: certificado.layout?.borda_espessura || 8,
            background: certificado.layout?.borda_cor || '#7a131a',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            width: '100%',
          }} />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Fechar</CButton>
      </CModalFooter>
    </CModal>
  );
}

export default CertificadoModal;