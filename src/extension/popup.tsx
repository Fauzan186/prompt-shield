import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionPopupApp } from './PopupApp';
import '../index.css';

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <ExtensionPopupApp />
  </React.StrictMode>,
);
