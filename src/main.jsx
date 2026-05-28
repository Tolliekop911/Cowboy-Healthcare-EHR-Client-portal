import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PatientPortal from './PatientPortal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PatientPortal />
  </StrictMode>,
)
