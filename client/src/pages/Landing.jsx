import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid var(--gray-200)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🎵</span>
          <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--red)' }}>GroupGroove</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px', background: 'white', border: '1px solid var(--red)',
              color: 'var(--red)', borderRadius: '8px', fontWeight: '500', fontSize: '14px', cursor: 'pointer'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 20px', background: 'var(--red)', border: 'none',
              color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '14px', cursor: 'pointer'
            }}
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', marginBottom: '24px' }}>🎵</span>
        <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#111', marginBottom: '16px', lineHeight: '1.2' }}>
          Stay connected through<br />
          <span style={{ color: 'var(--red)' }}>music</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', maxWidth: '480px', lineHeight: '1.7', marginBottom: '40px' }}>
          GroupGroove brings families together — no matter the distance. Share your song of the day, discover what your loved ones are listening to, and rate each other's picks.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '14px 36px', background: 'var(--red)', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(230,57,70,0.35)', marginBottom: '12px'
          }}
        >
          Get Started — It's Free
        </button>
        <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
          Already have an account? <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: '500' }} onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>

      <div style={{ padding: '48px 24px', background: 'var(--gray-100)', borderTop: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</div>
            <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>Private Groups</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.6' }}>Create a group for 3–8 family members and join with a simple invite code.</p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎶</div>
            <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>Song of the Day</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.6' }}>Each member shares one song every day — a small moment that keeps you connected.</p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
            <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>Rate & React</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.6' }}>Score each other's picks from 1 to 10 and see how your taste compares.</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--gray-500)' }}>
        © {new Date().getFullYear()} GroupGroove
      </div>
    </div>
  );
}
