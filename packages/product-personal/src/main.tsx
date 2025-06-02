import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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