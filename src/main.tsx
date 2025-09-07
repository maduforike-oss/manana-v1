import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider'
import './utils/setApiKey' // Auto-set API key

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="manana-theme">
    <App />
  </ThemeProvider>
);
