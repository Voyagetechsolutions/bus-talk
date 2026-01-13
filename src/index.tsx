import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { convex } from './utils/convex';
import './index.css';
import App from './App';
import { notificationService } from './utils/notifications';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);

// Initialize PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    notificationService.initialize();
  });
}