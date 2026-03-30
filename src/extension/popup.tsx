import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionPopupApp } from './ExtensionPopupApp';
import '../index.css';

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <ExtensionPopupApp />
  </React.StrictMode>,
);
