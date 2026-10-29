import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { LogisticsProvider } from './contexts/LogisticsContext.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <LogisticsProvider>
            <App />
          </LogisticsProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error("Fatal Error: Could not find root DOM element with id 'root'.");
}
