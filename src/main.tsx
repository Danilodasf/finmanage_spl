import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StagewiseToolbar } from '@stagewise/toolbar-react'

createRoot(document.getElementById("root")!).render(<App />);

if (process.env.NODE_ENV === 'development') {
  const toolbarRoot = document.createElement('div');
  toolbarRoot.id = 'stagewise-toolbar-root';
  document.body.appendChild(toolbarRoot);
  const stagewiseConfig = { plugins: [] };
  createRoot(toolbarRoot).render(<StagewiseToolbar config={stagewiseConfig} />);
}
