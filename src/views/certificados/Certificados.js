import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import CertificadoModal from './CertificadoModal'
import certificadosData from './certificados.json'

const Certificados = () => {
  const [ showModal, setShowModal ] = useState(false);
  const [ certificadoSelecionado, setCertificadoSelecionado ] = useState(null);

  const cert = certificadosData.find(c => c.tipo === 'conclusao');
  return (
    <>
      <div className="container-fluid">
        <h1 className="h3 mb-4 text-gray-800">Certificados</h1>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div
            style={{ background: '#fff', border: '2px solid #c2001a', borderRadius: 8, padding: 12, minWidth: 180, maxWidth: 220, cursor: 'pointer', boxShadow: '0 2px 8px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => { setCertificadoSelecionado(cert); setShowModal(true); }}
          >
            <h5 style={{ fontWeight: 700, color: '#c2001a', marginBottom: 8, fontSize: 18 }}>{cert.titulo}</h5>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Certificamos que</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{'{nome}'}</div>
            <div style={{ fontSize: 12, margin: '6px 0' }}>
              concluiu o curso <b>{'{curso}'}</b><br/>em {'{data}'}
            </div>
            <div style={{ fontSize: 10, marginTop: 10 }}>Cert. {'{token}'}</div>
            <img src={cert.logo} alt="logo" style={{ width: 48, margin: '12px auto 0' }} />
          </div>
        </div>
      </div>
      {showModal && (
        <CertificadoModal onClose={() => setShowModal(false)} certificado={certificadoSelecionado} />
      )}
    </>
  )
}

export default Certificados