import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import RTIDraftingPage from './pages/RTIDraftingPage';
import RightsNavigatorPage from './pages/RightsNavigatorPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoginModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rti" element={<RTIDraftingPage />} />
          <Route path="/rights" element={<RightsNavigatorPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
