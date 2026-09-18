import './platform/config/env';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app/App';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import { ToastProvider } from './components/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
);
