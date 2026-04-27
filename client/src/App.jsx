import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Group from './pages/Group';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
  return user ? <Navigate to="/home" replace /> : children;
}

function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/group/:id" element={<PrivateRoute><Group /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
