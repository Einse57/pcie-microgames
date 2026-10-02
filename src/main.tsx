import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles-games.css';
import './styles-visual.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
