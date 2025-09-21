import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { AuthProvider } from './lib/auth-context'
import { RealUserProvider } from './components/studio/RealUserProvider'
import './utils/setApiKey' // Auto-set API key
import { devAutoSignIn } from './lib/devAuth' // Dev auto sign-in

// Auto sign-in for development
devAutoSignIn();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="manana-theme">
    <AuthProvider>
      <RealUserProvider>
        <App />
      </RealUserProvider>
    </AuthProvider>
  </ThemeProvider>
);
