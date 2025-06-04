import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Renderiza a aplicação principal
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Stagewise Toolbar (somente em desenvolvimento)
if (import.meta.env.DEV) {
  import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
    const stagewiseConfig = {
      plugins: []
    };

    // Cria um elemento separado para o toolbar
    const toolbarContainer = document.createElement('div');
    toolbarContainer.id = 'stagewise-toolbar-root';
    document.body.appendChild(toolbarContainer);

    // Renderiza o toolbar em uma raiz React separada
    ReactDOM.createRoot(toolbarContainer).render(
      <StagewiseToolbar config={stagewiseConfig} />
    );
  });
} 