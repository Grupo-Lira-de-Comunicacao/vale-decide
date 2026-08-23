import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'
import './App.css'
import './Admin.css'

const Root = window.location.pathname.startsWith('/admin') ? AdminApp : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
