import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { bootstrapMeiDI } from './lib/di/bootstrap'

// Inicializa o container de DI
bootstrapMeiDI();

// Renderiza a aplicação principal
createRoot(document.getElementById("root")!).render(<App />);

// Stagewise Toolbar (somente em desenvolvimento)
if (import.meta.env.DEV) {
  // Método 1: Usando initToolbar (framework-agnostic)
  import('@stagewise/toolbar').then(({ initToolbar }) => {
    const stagewiseConfig = {
      plugins: []
    };
    
    initToolbar(stagewiseConfig);
    console.log('Stagewise toolbar inicializado com sucesso!');
  }).catch(() => {
    // Método 2: Fallback para StagewiseToolbar React component
    import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
      const stagewiseConfig = {
        plugins: []
      };

      // Cria um elemento separado para o toolbar
      const toolbarContainer = document.createElement('div');
      toolbarContainer.id = 'stagewise-toolbar-root';
      document.body.appendChild(toolbarContainer);

      // Renderiza o toolbar em uma raiz React separada
      createRoot(toolbarContainer).render(
        <StagewiseToolbar config={stagewiseConfig} />
      );
      console.log('Stagewise toolbar React inicializado com sucesso!');
    }).catch(error => {
      console.warn('Stagewise toolbar não pôde ser carregado:', error);
    });
  });
}