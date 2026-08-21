import React from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import DashboardPage from './DashboardPage';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <DashboardPage /> : <LandingPage />;
}

export default HomePage;
