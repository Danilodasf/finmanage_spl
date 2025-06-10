import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { bootstrapMeiDI } from './lib/di/bootstrap'

// Inicializa o container de DI
bootstrapMeiDI();

// Renderiza a aplicação principal
createRoot(document.getElementById("root")!).render(<App />);