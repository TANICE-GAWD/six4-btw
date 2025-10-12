import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { performanceMonitor, measureWebVitals } from './utils/performanceMonitor.js'


if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
  measureWebVitals();
  
  
  setTimeout(() => {
    performanceMonitor.checkPerformance();
  }, 3000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
