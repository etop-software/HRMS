import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  // Import TanStack Query
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from '@material-tailwind/react';  
import { Provider } from 'react-redux';  
import store from './redux/store.js'; 
import { CompanyProvider } from "./contexts/CompanyContext.jsx";

// Create a new QueryClient instance
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}> {/* Wrap everything in QueryClientProvider */}
    <StrictMode>
      <Provider store={store}> {/* Redux Provider */}
        <CompanyProvider> {/* Custom Company context */}
          <ThemeProvider> {/* Material Tailwind Theme Provider */}
            <App /> {/* Your main App component */}
          </ThemeProvider>
        </CompanyProvider>
      </Provider>
    </StrictMode>
  </QueryClientProvider> 
);
