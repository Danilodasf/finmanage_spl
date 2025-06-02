import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { bootstrapPersonalDI } from './lib/di/bootstrap.ts'
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di'

// Inicializar o container de DI
console.log('Inicializando container de DI...');
bootstrapPersonalDI();

// Verificar se o container foi inicializado corretamente
console.log('Verificando se o serviço de transações está registrado...');
if (DIContainer.has(TRANSACTION_SERVICE)) {
  console.log(`Serviço ${TRANSACTION_SERVICE} registrado com sucesso!`);
  
  try {
    const service = DIContainer.get(TRANSACTION_SERVICE);
    console.log('Serviço de transações obtido:', service);
    console.log('Métodos disponíveis:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
  } catch (error) {
    console.error('Erro ao obter serviço de transações:', error);
  }
} else {
  console.error(`ERRO: Serviço ${TRANSACTION_SERVICE} não está registrado!`);
}

// Stagewise Toolbar (somente em desenvolvimento)
if (import.meta.env.DEV) {
  import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
    const toolbarContainer = document.createElement('div')
    toolbarContainer.id = 'stagewise-toolbar-root'
    document.body.appendChild(toolbarContainer)
    
    const stagewiseConfig = {
      plugins: []
    }
    
    ReactDOM.createRoot(toolbarContainer).render(
      <StagewiseToolbar config={stagewiseConfig} />
    )
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 