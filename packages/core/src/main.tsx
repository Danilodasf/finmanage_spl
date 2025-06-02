import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StagewiseToolbar } from '@stagewise/toolbar-react'

// Renderiza a aplicação principal
createRoot(document.getElementById("root")!).render(<App />);

// Configuração e renderização do Stagewise Toolbar apenas em desenvolvimento
if (import.meta.env.DEV) {
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
}
