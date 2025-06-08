import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importa e inicializa a injeção de dependências
import { bootstrapDiaristaDI, defaultDiaristaConfig, validateDiaristaDI } from './lib/di/bootstrap'

// Função para inicializar a aplicação
async function initializeApp() {
  try {
    console.log('[Diarista] Inicializando aplicação...');
    
    // Configura a injeção de dependências
    await bootstrapDiaristaDI(defaultDiaristaConfig);
    
    // Valida se tudo foi configurado corretamente
    const isValid = validateDiaristaDI();
    if (!isValid) {
      throw new Error('Falha na validação da injeção de dependências');
    }
    
    console.log('[Diarista] Aplicação inicializada com sucesso!');
    
    // Renderiza a aplicação
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    
  } catch (error) {
    console.error('[Diarista] Erro ao inicializar aplicação:', error);
    
    // Renderiza uma tela de erro
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>Erro na Inicialização</h1>
          <p style={{ color: '#666', marginBottom: '16px' }}>Ocorreu um erro ao inicializar a aplicação.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>Verifique o console para mais detalhes.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </StrictMode>,
    );
  }
}

// Inicializa a aplicação
initializeApp();

// Stagewise Toolbar (somente em desenvolvimento) - DESATIVADO
// if (import.meta.env.DEV) {
//   import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
//     const stagewiseConfig = {
//       plugins: []
//     };
//
//     // Cria um elemento separado para o toolbar
//     const toolbarContainer = document.createElement('div');
//     toolbarContainer.id = 'stagewise-toolbar-root';
//     document.body.appendChild(toolbarContainer);
//
//     // Renderiza o toolbar em uma raiz React separada
//     ReactDOM.createRoot(toolbarContainer).render(
//       <StagewiseToolbar config={stagewiseConfig} />
//     );
//   });
// }