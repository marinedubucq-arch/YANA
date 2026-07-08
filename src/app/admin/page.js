'use client'
import { useState, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff, CheckCircle, RefreshCw, Users, MapPin, MessageSquare, Building } from 'lucide-react'

const TABS = ['Lieux', 'Utilisateurs', 'Demandes établissements', 'Suggestions lieux']

function useAdminFetch(token) {
  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token }
  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers || {}) } })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
    return res.json()
  }
  return apiFetch
}

const inputCls = {
  width: '100%',
  border: '1px solid #e0e0e0',
  padding: '8px 10px',
  fontSize: 12,
  color: '#000',
  background: '#fff',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  borderRadius: 0,
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  const [venues, setVenues] = useState([])
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const [newVenue, setNewVenue] = useState({ name: '', address: '', city: 'Paris', lat: '', lng: '', comment: '', venue_type: 'Café' })
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [addVenueLoading, setAddVenueLoading] = useState(false)
  const [addVenueError, setAddVenueError] = useState('')

  const apiFetch = useAdminFetch(token)

  async function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    setLoading(true)
    try {
      await apiFetch('/api/admin/venues')
      setAuthed(true)
      loadAll()
    } catch {
      setAuthError('Token invalide')
    } finally {
      setLoading(false)
    }
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [v, u, r] = await Promise.all([
        apiFetch('/api/admin/venues'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/requests'),
      ])
      setVenues(v)
      setUsers(u)
      setRequests(r.requests || [])
      setSuggestions(r.suggestions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  async function toggleVenueActive(venue) {
    await apiFetch('/api/admin/venues', { method: 'PATCH', body: JSON.stringify({ id: venue.id, active: !venue.active }) })
    setVenues(vs => vs.map(v => v.id === venue.id ? { ...v, active: !v.active } : v))
  }

  async function deleteVenue(id) {
    if (!confirm('Supprimer ce lieu définitivement ?')) return
    await apiFetch('/api/admin/venues', { method: 'DELETE', body: JSON.stringify({ id }) })
    setVenues(vs => vs.filter(v => v.id !== id))
  }

  async function handleAddVenue(e) {
    e.preventDefault()
    setAddVenueLoading(true)
    setAddVenueError('')
    try {
      const venue = await apiFetch('/api/admin/venues', {
        method: 'POST',
        body: JSON.stringify({ ...newVenue, lat: parseFloat(newVenue.lat), lng: parseFloat(newVenue.lng) }),
      })
      setVenues(vs => [...vs, venue])
      setNewVenue({ name: '', address: '', city: 'Paris', lat: '', lng: '', comment: '', venue_type: 'Café' })
      setShowAddVenue(false)
    } catch (err) {
      setAddVenueError(err.message)
    } finally {
      setAddVenueLoading(false)
    }
  }

  async function toggleUserActive(user) {
    await apiFetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ id: user.id, active: !user.active }) })
    setUsers(us => us.map(u => u.id === user.id ? { ...u, active: !u.active } : u))
  }

  async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await apiFetch('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ id }) })
    setUsers(us => us.filter(u => u.id !== id))
  }

  async function markReviewed(type, id) {
    await apiFetch('/api/admin/requests', { method: 'PATCH', body: JSON.stringify({ type, id }) })
    if (type === 'suggestion') setSuggestions(ss => ss.map(s => s.id === id ? { ...s, reviewed: true } : s))
    else setRequests(rs => rs.map(r => r.id === id ? { ...r, reviewed: true } : r))
  }

  const font = { fontFamily: 'Inter, sans-serif' }

  // ── Auth gate ──────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, ...font }}>
        <div style={{ background: '#fff', width: '100%', maxWidth: 340, padding: 32 }}>
          <div style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 32, letterSpacing: '0.04em', marginBottom: 6 }}>YANA</div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 24 }}>Admin Backoffice</p>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 5 }}>Token admin</label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                placeholder="••••••••••••"
                style={inputCls}
              />
            </div>
            {authError && <p style={{ fontSize: 11, color: '#cc0000', margin: 0 }}>{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#000', color: '#fff', border: 'none', padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Connexion…' : 'Accéder au backoffice'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Lieux actifs', value: venues.filter(v => v.active).length, Icon: MapPin },
    { label: 'Utilisateurs', value: users.length, Icon: Users },
    { label: 'Demandes établissements', value: requests.filter(r => !r.reviewed).length, Icon: Building },
    { label: 'Suggestions lieux', value: suggestions.filter(s => !s.reviewed).length, Icon: MessageSquare },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', ...font }}>

      {/* Header */}
      <header style={{ background: '#000', color: '#fff', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 22, letterSpacing: '0.04em' }}>YANA <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.12em', color: '#555', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Admin</span></div>
        <button
          onClick={loadAll}
          disabled={loading}
          style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '6px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {stats.map(({ label, value, Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8e8e8', padding: 16 }}>
              <Icon size={16} style={{ color: '#aaa', marginBottom: 10 }} />
              <div style={{ fontSize: 28, fontWeight: 700, color: '#000', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e0e0e0', marginBottom: 16 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                background: 'none', border: 'none', borderBottom: activeTab === i ? '2px solid #000' : '2px solid transparent',
                color: activeTab === i ? '#000' : '#aaa', cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB: LIEUX */}
        {activeTab === 0 && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Lieux ({venues.length})</h2>
              <button
                onClick={() => setShowAddVenue(!showAddVenue)}
                style={{ background: '#000', color: '#fff', border: 'none', padding: '7px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>

            {showAddVenue && (
              <form onSubmit={handleAddVenue} style={{ padding: 16, borderBottom: '1px solid #e8e8e8', background: '#f8f8f8' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000', margin: '0 0 12px' }}>Nouveau lieu</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { key: 'name', label: 'Nom *', placeholder: 'Café du Coin' },
                    { key: 'address', label: 'Adresse *', placeholder: '1 Rue des Fleurs, 75001 Paris' },
                    { key: 'city', label: 'Ville', placeholder: 'Paris' },
                    { key: 'lat', label: 'Latitude *', placeholder: '48.8566', type: 'number', step: 'any' },
                    { key: 'lng', label: 'Longitude *', placeholder: '2.3522', type: 'number', step: 'any' },
                    { key: 'venue_type', label: 'Type', placeholder: 'Café' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</label>
                      <input type={f.type || 'text'} step={f.step} value={newVenue[f.key]} onChange={e => setNewVenue(n => ({ ...n, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputCls} />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Commentaire</label>
                    <input type="text" value={newVenue.comment} onChange={e => setNewVenue(n => ({ ...n, comment: e.target.value }))} placeholder="Description pour les utilisateurs…" style={inputCls} />
                  </div>
                </div>
                {addVenueError && <p style={{ fontSize: 11, color: '#cc0000', margin: '8px 0 0' }}>{addVenueError}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="button" onClick={() => setShowAddVenue(false)} style={{ fontSize: 10, color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annuler</button>
                  <button type="submit" disabled={addVenueLoading} style={{ background: '#000', color: '#fff', border: 'none', padding: '7px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', opacity: addVenueLoading ? 0.5 : 1 }}>
                    {addVenueLoading ? 'Ajout…' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}

            <div>
              {venues.map((venue, i) => (
                <div key={venue.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0', opacity: venue.active ? 1 : 0.4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue.name}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{venue.address} · {venue.lat?.toFixed(4)}, {venue.lng?.toFixed(4)} · {venue.venue_type}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '2px 8px', border: `1px solid ${venue.active ? '#22c55e' : '#ddd'}`, color: venue.active ? '#22c55e' : '#aaa' }}>
                      {venue.active ? 'Actif' : 'Inactif'}
                    </span>
                    <button onClick={() => toggleVenueActive(venue)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }} title={venue.active ? 'Désactiver' : 'Activer'}>
                      {venue.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => deleteVenue(venue.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }} title="Supprimer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: UTILISATEURS */}
        {activeTab === 1 && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Utilisateurs ({users.length})</h2>
            </div>
            <div>
              {users.map((user, i) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0', opacity: user.active ? 1 : 0.4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>{user.first_name} {user.last_name}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{user.email} · {user.industry}</div>
                    {user.project_name && <div style={{ fontSize: 10, color: '#aaa' }}>{user.project_name}</div>}
                    <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '2px 8px', border: `1px solid ${user.profile_complete ? '#22c55e' : '#f0c040'}`, color: user.profile_complete ? '#22c55e' : '#d4a000' }}>
                      {user.profile_complete ? 'Complet' : 'Incomplet'}
                    </span>
                    <button onClick={() => toggleUserActive(user)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
                      {user.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => deleteUser(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: DEMANDES ÉTABLISSEMENTS */}
        {activeTab === 2 && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Demandes ({requests.filter(r => !r.reviewed).length} non traitées)</h2>
            </div>
            {requests.length === 0 && <p style={{ fontSize: 11, color: '#bbb', padding: '24px 16px', textAlign: 'center', margin: 0 }}>Aucune demande pour l'instant</p>}
            {requests.map((req, i) => (
              <div key={req.id} style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0', opacity: req.reviewed ? 0.4 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 4 }}>{req.establishment_name}</div>
                    <div style={{ fontSize: 11, color: '#888', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>Contact : {req.contact_name}</span>
                      <span>Adresse : {req.address}</span>
                      <span>Email : <a href={`mailto:${req.email}`} style={{ color: '#000' }}>{req.email}</a></span>
                      <span>Tél : {req.phone}</span>
                      <span style={{ color: '#ccc' }}>Reçu le {new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  {!req.reviewed ? (
                    <button onClick={() => markReviewed('request', req.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #22c55e', color: '#22c55e', padding: '5px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                      <CheckCircle size={11} /> Traité
                    </button>
                  ) : (
                    <span style={{ fontSize: 10, color: '#ccc', flexShrink: 0 }}>Traité</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: SUGGESTIONS LIEUX */}
        {activeTab === 3 && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Suggestions ({suggestions.filter(s => !s.reviewed).length} non traitées)</h2>
            </div>
            {suggestions.length === 0 && <p style={{ fontSize: 11, color: '#bbb', padding: '24px 16px', textAlign: 'center', margin: 0 }}>Aucune suggestion pour l'instant</p>}
            {suggestions.map((s, i) => (
              <div key={s.id} style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0', opacity: s.reviewed ? 0.4 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#888', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {s.address && <span>Adresse : {s.address}</span>}
                      {s.comment && <span>Note : {s.comment}</span>}
                      {s.users && <span>Par : {s.users.first_name} {s.users.last_name} ({s.users.email})</span>}
                      <span style={{ color: '#ccc' }}>Reçu le {new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  {!s.reviewed ? (
                    <button onClick={() => markReviewed('suggestion', s.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #22c55e', color: '#22c55e', padding: '5px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                      <CheckCircle size={11} /> Traité
                    </button>
                  ) : (
                    <span style={{ fontSize: 10, color: '#ccc', flexShrink: 0 }}>Traité</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
