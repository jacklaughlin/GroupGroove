import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{
      background: 'var(--red)',
      color: 'white',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
    }}>
      <div
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '22px' }}>🎵</span>
        <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '0.5px' }}>GroupGroove</span>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Hi, {user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'white',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
