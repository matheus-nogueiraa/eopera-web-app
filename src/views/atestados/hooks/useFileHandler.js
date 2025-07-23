import { useState } from 'react'
import { convertToBase64, validateFileType, validateFileSize } from '../utils/atestadosUtils'

export const useFileHandler = (setForm) => {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')

  const handleFileChange = async (selectedFile) => {
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!validateFileType(selectedFile)) {
        setFileError('Tipo de arquivo não permitido. Use apenas PDF, JPG, JPEG ou PNG.')
        setFile(null)
        return
      }

      // Validar tamanho do arquivo
      if (!validateFileSize(selectedFile)) {
        setFileError('Arquivo excede 10MB.')
        setFile(null)
        return
      }

      try {
        const base64 = await convertToBase64(selectedFile)
        setFile(selectedFile)
        if (setForm) {
          setForm((prev) => ({ ...prev, anexoBase64: base64 }))
        }
        setFileError('')
      } catch (error) {
        setFileError('Erro ao processar arquivo.')
        setFile(null)
      }
    } else {
      setFile(null)
      if (setForm) {
        setForm((prev) => ({ ...prev, anexoBase64: '' }))
      }
      setFileError('')
    }
  }

  const handleRemoveFile = (fileInputRef) => {
    setFile(null)
    if (setForm) {
      setForm((prev) => ({ ...prev, anexoBase64: '' }))
    }
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleViewFile = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }

  return {
    file,
    fileError,
    setFileError,
    handleFileChange,
    handleRemoveFile,
    handleViewFile,
  }
}
