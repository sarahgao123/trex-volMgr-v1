import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

// Import components directly to avoid dynamic import issues
import Hero from './components/Hero';
import EventManager from './components/events/EventManager';
import PositionsPage from './pages/PositionsPage';
import CheckInPage from './pages/CheckInPage';
import EventReportPage from './pages/EventReportPage';
import DocsPage from './pages/DocsPage';
import { AuthForm } from './components/auth/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <AuthForm />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <>
                    <Hero />
                    <EventManager />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/:eventId/positions" 
              element={
                <ProtectedRoute>
                  <PositionsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/checkin/:positionId" element={<CheckInPage />} />
            <Route 
              path="/events/:eventId/report" 
              element={
                <ProtectedRoute>
                  <EventReportPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}