import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StarRating({ value, onChange, disabled }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button
          key={n}
          disabled={disabled}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(null)}
          style={{
            width: '28px', height: '28px', border: 'none',
            borderRadius: '4px', fontSize: '12px', fontWeight: '700',
            cursor: disabled ? 'default' : 'pointer',
            background: (hover !== null ? n <= hover : n <= (value || 0))
              ? 'var(--red)' : 'var(--gray-200)',
            color: (hover !== null ? n <= hover : n <= (value || 0))
              ? 'white' : 'var(--gray-500)',
            transition: 'background 0.1s'
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function SongCard({ song, currentUserId, onRate }) {
  const [rating, setRating] = useState(song.my_rating ? parseInt(song.my_rating) : null);
  const [avgRating, setAvgRating] = useState(parseFloat(song.avg_rating));
  const [ratingCount, setRatingCount] = useState(parseInt(song.rating_count));
  const [submitting, setSubmitting] = useState(false);
  const { apiFetch } = useAuth();
  const isOwn = song.user_id === currentUserId;

  async function handleRate(score) {
    if (isOwn || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/songs/${song.id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ score })
      });
      const data = await res.json();
      if (res.ok) {
        setRating(score);
        setAvgRating(parseFloat(data.avg_rating));
        setRatingCount(parseInt(data.rating_count));
        onRate && onRate();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius)', padding: '20px',
      boxShadow: 'var(--shadow)', border: isOwn ? '2px solid var(--red-light)' : '1px solid var(--gray-200)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎵</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>{song.title}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>{song.artist}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>by <strong>{song.username}</strong></div>
          {isOwn && (
            <span style={{ fontSize: '11px', background: 'var(--red-light)', color: 'var(--red)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
              Your pick
            </span>
          )}
        </div>
      </div>

      {song.note && (
        <p style={{ fontSize: '14px', color: 'var(--gray-700)', background: 'var(--gray-100)', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontStyle: 'italic' }}>
          "{song.note}"
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        {song.spotify_url && (
          <a href={song.spotify_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', background: '#1DB954', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>
            Spotify
          </a>
        )}
        {song.youtube_url && (
          <a href={song.youtube_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', background: '#FF0000', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>
            YouTube
          </a>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            {ratingCount > 0
              ? `Avg: ${avgRating.toFixed(1)}/10 (${ratingCount} rating${ratingCount !== 1 ? 's' : ''})`
              : 'No ratings yet'}
          </span>
          {rating && <span style={{ fontSize: '13px', color: 'var(--red)', fontWeight: '600' }}>Your rating: {rating}/10</span>}
        </div>
        {isOwn ? (
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontStyle: 'italic' }}>You can't rate your own song</p>
        ) : (
          <StarRating value={rating} onChange={handleRate} disabled={submitting} />
        )}
      </div>
    </div>
  );
}

export default function Group() {
  const { id } = useParams();
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', spotify_url: '', youtube_url: '', note: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [groupRes, songsRes] = await Promise.all([
        apiFetch(`/api/groups/${id}`),
        apiFetch(`/api/songs/group/${id}`)
      ]);
      if (groupRes.ok) setGroup(await groupRes.json());
      if (songsRes.ok) setSongs(await songsRes.json());
    } finally {
      setLoading(false);
    }
  }

  const hasSubmittedToday = songs.some(s => s.user_id === user?.id);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/songs/group/${id}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setSongs(prev => [...prev, data]);
      setForm({ title: '', artist: '', spotify_url: '', youtube_url: '', note: '' });
      setShowSubmit(false);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-500)' }}>Loading...</div>;
  if (!group) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-500)' }}>Group not found.</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 16px' }}>
      <button
        onClick={() => navigate('/home')}
        style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' }}
      >
        ← Back to groups
      </button>

      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{group.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
              {group.members?.length} member{group.members?.length !== 1 ? 's' : ''}
              {group.members && ': ' + group.members.map(m => m.username).join(', ')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Invite code</div>
            <button
              onClick={copyCode}
              style={{
                background: 'var(--red-light)', border: 'none', borderRadius: '6px',
                padding: '6px 14px', color: 'var(--red)', fontWeight: '700', fontSize: '16px',
                letterSpacing: '2px', cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied!' : group.invite_code}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontWeight: '700', fontSize: '18px' }}>Today's Songs</h3>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{today}</p>
        </div>
        {!hasSubmittedToday && (
          <button
            onClick={() => { setShowSubmit(true); setError(''); }}
            style={{ padding: '9px 18px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}
          >
            + Share a Song
          </button>
        )}
      </div>

      {showSubmit && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Share Your Song of the Day</h3>
          {error && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red-dark)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Song Title *</label>
                <input
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required placeholder="Song title"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: '7px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Artist *</label>
                <input
                  value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                  required placeholder="Artist name"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: '7px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Spotify URL</label>
                <input
                  value={form.spotify_url} onChange={e => setForm(f => ({ ...f, spotify_url: e.target.value }))}
                  placeholder="https://open.spotify.com/..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: '7px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>YouTube URL</label>
                <input
                  value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://youtube.com/..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: '7px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Why this song? (optional)</label>
              <textarea
                value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Tell the group why you picked this song..."
                rows={2}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: '7px', fontSize: '14px', resize: 'vertical', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowSubmit(false); setError(''); }}
                style={{ padding: '9px 18px', background: 'var(--gray-200)', border: 'none', borderRadius: '8px', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '9px 18px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Sharing...' : 'Share Song'}
              </button>
            </div>
          </form>
        </div>
      )}

      {songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--gray-500)' }}>
          <span style={{ fontSize: '40px' }}>🎶</span>
          <p style={{ marginTop: '12px' }}>No songs shared today yet. Be the first!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {songs.map(song => (
            <SongCard key={song.id} song={song} currentUserId={user?.id} onRate={loadData} />
          ))}
        </div>
      )}
    </div>
  );
}
