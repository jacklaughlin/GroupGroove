import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name: groupName })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setGroups(prev => [data, ...prev]);
      setGroupName('');
      setShowCreate(false);
    } catch {
      setError('Network error');
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/api/groups/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setGroups(prev => [...prev, data]);
      setInviteCode('');
      setShowJoin(false);
    } catch {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Your Groups</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }}
            style={{
              padding: '8px 16px', background: 'white', border: '1px solid var(--red)',
              color: 'var(--red)', borderRadius: '8px', fontWeight: '500', fontSize: '14px'
            }}
          >
            Join Group
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError(''); }}
            style={{
              padding: '8px 16px', background: 'var(--red)', border: 'none',
              color: 'white', borderRadius: '8px', fontWeight: '500', fontSize: '14px'
            }}
          >
            + Create Group
          </button>
        </div>
      </div>

      {(showCreate || showJoin) && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>{showCreate ? 'Create a New Group' : 'Join a Group'}</h3>
          {error && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red-dark)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{error}</div>
          )}
          <form onSubmit={showCreate ? handleCreate : handleJoin}>
            <input
              type="text"
              value={showCreate ? groupName : inviteCode}
              onChange={e => showCreate ? setGroupName(e.target.value) : setInviteCode(e.target.value.toUpperCase())}
              placeholder={showCreate ? 'Group name (e.g. The Smith Family)' : 'Enter invite code'}
              required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '15px', marginBottom: '12px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setShowJoin(false); setError(''); }}
                style={{ padding: '9px 18px', background: 'var(--gray-200)', border: 'none', borderRadius: '8px', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '9px 18px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500' }}
              >
                {showCreate ? 'Create' : 'Join'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginTop: '40px' }}>Loading your groups...</p>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--gray-500)' }}>
          <span style={{ fontSize: '48px' }}>🎶</span>
          <p style={{ marginTop: '12px', fontSize: '16px' }}>No groups yet! Create one or join with an invite code.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => navigate(`/group/${group.id}`)}
              style={{
                background: 'white', borderRadius: 'var(--radius)', padding: '20px 24px',
                boxShadow: 'var(--shadow)', cursor: 'pointer', border: '1px solid var(--gray-200)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🎵</span>
                  <span style={{ fontWeight: '600', fontSize: '17px' }}>{group.name}</span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--gray-500)' }}>
                  {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                  <span style={{ margin: '0 8px' }}>·</span>
                  Code: <strong style={{ color: 'var(--red)' }}>{group.invite_code}</strong>
                </div>
              </div>
              <span style={{ color: 'var(--gray-500)', fontSize: '20px' }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
