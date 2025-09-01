import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'
import './utils/setApiKey' // Auto-set API key

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="studio-theme">
    <App />
  </ThemeProvider>
);
