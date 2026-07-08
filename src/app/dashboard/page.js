'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ProfileModal from '@/components/ProfileModal'
import PresenceModal from '@/components/PresenceModal'
import SuggestVenue from '@/components/SuggestVenue'
import VenueCard from '@/components/VenueCard'

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false })

const PERIOD_LABELS = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  full_day: 'Journée entière',
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)  
  const [view, setView] = useState('map')
  const [cityFilter, setCityFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [presenceVenue, setPresenceVenue] = useState(null)
  const [showSuggest, setShowSuggest] = useState(false)
  const [myPresence, setMyPresence] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (session && session.user?.profileComplete === false) setShowProfile(true)
  }, [session])

  const fetchVenues = useCallback(async () => {
    setLoading(true)
    try {
      const params = cityFilter ? `?city=${encodeURIComponent(cityFilter)}` : ''
      const res = await fetch(`/api/venues${params}`)
      const data = await res.json()
      setVenues(Array.isArray(data) ? data : [])
      setLastRefresh(new Date())
    } catch (err) {
      console.error('fetchVenues error:', err)
    } finally {
      setLoading(false)
    }
  }, [cityFilter])

  const fetchMyPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      const data = await res.json()
      setMyPresence(data)
    } catch {}
  }, [])

  useEffect(() => {
    if (session?.user?.profileComplete) {
      fetchVenues()
      fetchMyPresence()
    }
  }, [session, fetchVenues, fetchMyPresence])

  useEffect(() => {
    if (!session?.user?.profileComplete) return
    const interval = setInterval(() => fetchVenues(), 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [session, fetchVenues])

  const cities = [...new Set(venues.map(v => v.city))].sort()
  const filteredVenues = venues.filter(v => {
    const matchCity = !cityFilter || v.city === cityFilter
    const matchSearch = !searchFilter ||
      v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.address.toLowerCase().includes(searchFilter.toLowerCase())
    return matchCity && matchSearch
  })

  function handlePresenceSaved(venueId, period) {
    setMyPresence(venueId ? { venue_id: venueId, period } : null)
    fetchVenues()
  }

  function handleVenueClick(venue) {
    setSelectedVenue(venue)
    setView('list')
  }

  const totalPresent = venues.reduce((sum, v) => sum + (v.presence?.length || 0), 0)
  const profileComplete = session?.user?.profileComplete
  const user = session?.user?.dbUser

  if (status === 'loading' || (status === 'authenticated' && loading && !venues.length)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  const btnBase = { border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 14px', transition: 'background 0.1s, color 0.1s' }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Modals */}
      {showProfile && <ProfileModal onComplete={() => { setShowProfile(false); fetchVenues(); fetchMyPresence() }} />}
      {presenceVenue && (
        <PresenceModal
          venue={presenceVenue}
          currentPresence={myPresence?.venue_id === presenceVenue.id ? myPresence : null}
          onClose={() => setPresenceVenue(null)}
          onSaved={handlePresenceSaved}
        />
      )}
      {showSuggest && <SuggestVenue onClose={() => setShowSuggest(false)} />}

      {/* Header */}
      <header style={{ background: '#000', borderBottom: '1px solid #1a1a1a', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, zIndex: 10 }}>

        {/* Wordmark */}
        <div style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 22, letterSpacing: '0.04em', color: '#fff', marginRight: 8, flexShrink: 0 }}>
          YANA
        </div>

        {/* Search */}
        {profileComplete && (
          <div style={{ flex: 1, maxWidth: 280, position: 'relative' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un lieu…"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{ width: '100%', background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 10px 6px 28px', fontSize: 11, outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        )}

        {/* City filter */}
        {profileComplete && cities.length > 1 && (
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 10px', fontSize: 11, outline: 'none', fontFamily: 'Inter, sans-serif', display: 'none' }}
            className="sm:block"
          >
            <option value="">Toutes les villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* View toggle */}
        {profileComplete && (
          <div style={{ display: 'flex', border: '1px solid #222', overflow: 'hidden', flexShrink: 0 }}>
            {[
              { id: 'map', label: 'Carte' },
              { id: 'list', label: 'Liste' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{ ...btnBase, background: view === id ? '#fff' : 'transparent', color: view === id ? '#000' : '#555', padding: '7px 14px' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Refresh */}
        {profileComplete && (
          <button
            onClick={fetchVenues}
            disabled={loading}
            title="Actualiser"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', padding: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }}>
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        )}

        {/* User + sign out */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && (
            <div style={{ textAlign: 'right', display: 'none' }} className="sm:block">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{user.first_name}</div>
              <div style={{ fontSize: 10, color: '#444' }}>{user.industry}</div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title="Se déconnecter"
            style={{ background: 'none', border: '1px solid #222', cursor: 'pointer', color: '#555', padding: '6px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}
          >
            Sortir
          </button>
        </div>
      </header>

      {/* Main */}
      {!profileComplete ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: 8 }}>Profil incomplet</p>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 20 }}>Renseignez vos informations pour accéder à la carte.</p>
            <button
              onClick={() => setShowProfile(true)}
              style={{ background: '#fff', color: '#000', border: 'none', padding: '11px 24px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Compléter mon profil
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Map */}
          <div style={{ flex: view === 'list' ? 0 : 1, display: view === 'list' ? 'none' : 'block' }} className={view === 'list' ? 'lg:flex lg:flex-1' : 'flex-1'}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <MapComponent
                venues={filteredVenues}
                onVenueClick={handleVenueClick}
                selectedVenueId={selectedVenue?.id}
              />

              {/* My presence badge */}
              {myPresence && (
                <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: '#fff', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e8e8e8', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
                  <div className="presence-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#000', fontWeight: 600 }}>
                    Présent(e) — {PERIOD_LABELS[myPresence.period]}
                  </span>
                  <button
                    onClick={() => {
                      const v = venues.find(v => v.id === myPresence.venue_id)
                      if (v) setPresenceVenue(v)
                    }}
                    style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
                  >
                    Modifier
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List panel */}
          <div style={{ width: view === 'map' ? 0 : '100%', display: view === 'map' ? 'none' : 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #e8e8e8', overflow: 'hidden' }}
               className={view === 'map' ? 'lg:flex lg:w-96' : 'flex-1 lg:w-96'}>

            {/* Panel header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 11, fontWeight: 700, color: '#000', margin: 0 }}>
                  {filteredVenues.length} lieu{filteredVenues.length !== 1 ? 'x' : ''}
                </h2>
                {lastRefresh && (
                  <p style={{ fontSize: 10, color: '#bbb', margin: '2px 0 0' }}>
                    {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              {totalPresent > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <div className="presence-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  {totalPresent} en ligne
                </div>
              )}
            </div>

            {/* Venue list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid #eee', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
              ) : filteredVenues.length === 0 ? (
                <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', paddingTop: 32 }}>Aucun lieu trouvé</p>
              ) : (
                filteredVenues.map(venue => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onClick={() => {
                      setSelectedVenue(venue)
                      if (view !== 'map') setView('map')
                    }}
                    isSelected={selectedVenue?.id === venue.id}
                    myPresence={myPresence}
                  />
                ))
              )}
            </div>

            {/* Selected venue detail */}
            {selectedVenue && (
              <div style={{ borderTop: '1px solid #e8e8e8', padding: 14, background: '#f8f8f8', flexShrink: 0 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#000', margin: '0 0 3px' }}>{selectedVenue.name}</h3>
                <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 6px' }}>{selectedVenue.address}</p>
                {selectedVenue.comment && <p style={{ fontSize: 11, color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>{selectedVenue.comment}</p>}

                {selectedVenue.presence?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', margin: '0 0 6px' }}>Qui est là ?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedVenue.presence.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="presence-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#000' }}>{p.firstName}</span>
                          <span style={{ fontSize: 11, color: '#aaa' }}>· {p.industry}</span>
                          <span style={{ fontSize: 10, color: '#ccc' }}>· {PERIOD_LABELS[p.period]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setPresenceVenue(selectedVenue)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  {myPresence?.venue_id === selectedVenue.id ? 'Modifier ma présence' : 'Je suis ici'}
                </button>
              </div>
            )}

            {/* Suggest venue */}
            <div style={{ padding: 10, borderTop: '1px solid #e8e8e8', flexShrink: 0 }}>
              <button
                onClick={() => setShowSuggest(true)}
                style={{ width: '100%', background: 'none', border: '1px dashed #ddd', color: '#aaa', padding: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase' }}
              >
                + Suggérer un lieu manquant
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          [data-view-panel] { display: flex !important; width: 384px !important; }
          [data-view-map] { display: block !important; flex: 1 !important; }
        }
      `}</style>
    </div>
  )
}
