import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { BusinessProvider } from '../context/BusinessContext';
// Import other providers here (e.g., ThemeProvider, QueryClientProvider)

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <BusinessProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </BusinessProvider>
    </AuthProvider>
  );
}
