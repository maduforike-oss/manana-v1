import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { AuthProvider } from './lib/auth-context'
import './utils/setApiKey' // Auto-set API key
import { devAutoSignIn } from './lib/devAuth' // Dev auto sign-in
import { initializeViewport } from './utils/viewport' // Viewport height fix

// Auto sign-in for development
devAutoSignIn();

// Initialize dynamic viewport height
initializeViewport();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="manana-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
