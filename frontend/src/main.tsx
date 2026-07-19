import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Set axios auth header from stored token (if present)
const token = (typeof window !== 'undefined') ? localStorage.getItem('aura_token') : null;
if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
