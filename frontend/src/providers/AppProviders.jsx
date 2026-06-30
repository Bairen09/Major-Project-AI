import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
// Import other providers here (e.g., ThemeProvider, QueryClientProvider)

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  );
}
