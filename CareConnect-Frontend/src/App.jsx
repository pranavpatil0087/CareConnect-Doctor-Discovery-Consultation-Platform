import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ChatWidget } from './components/chat/ChatWidget';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
        <ChatWidget />
        <Footer />
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "'Inter', sans-serif",
              borderRadius: '16px',
              background: '#ffffff',
              color: '#171d1c',
              border: '1px solid #eaefed',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            },
            success: {
              iconTheme: {
                primary: '#00835f',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ba1a1a',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
