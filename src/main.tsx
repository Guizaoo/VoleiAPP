import './styles/global.css'; // antes dos componentes, para que os CSS Modules possam sobrescrever
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LoginGate } from './components/LoginGate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginGate><App /></LoginGate>
  </StrictMode>,
);
