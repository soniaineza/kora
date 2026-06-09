import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LanguageProvider } from './i18n';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LanguageProvider>
);

