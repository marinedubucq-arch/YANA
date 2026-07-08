'use client'

const PERIOD_LABELS = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  full_day: 'Journée',
}

export default function VenueCard({ venue, onClick, isSelected, myPresence }) {
  const count = venue.presence?.length || 0
  const isHere = myPresence?.venue_id === venue.id

  return (
    <button
      onClick={() => onClick(venue)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        border: isSelected ? '2px solid #000' : '1px solid #e8e8e8',
        background: isSelected ? '#f8f8f8' : '#fff',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'border-color 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Name + "Je suis ici" badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#000', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {venue.name}
            </h3>
            {isHere && (
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#22c55e', border: '1px solid #22c55e', padding: '1px 6px', flexShrink: 0 }}>
                Je suis ici
              </span>
            )}
          </div>

          {/* Address */}
          <p style={{ fontSize: 10, color: '#aaa', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {venue.address}
          </p>

          {/* Comment */}
          {venue.comment && (
            <p style={{ fontSize: 11, color: '#666', margin: '6px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {venue.comment}
            </p>
          )}

          {/* Presence people */}
          {count > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22c55e' }}>
                {count} ici maintenant
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {venue.presence.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    title={`${p.firstName} · ${p.industry} · ${PERIOD_LABELS[p.period] || ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #d4f7e0', padding: '2px 8px' }}
                  >
                    <div className="presence-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#000' }}>{p.firstName}</span>
                    <span style={{ fontSize: 10, color: '#aaa' }}>· {p.industry?.split(' ')[0]}</span>
                  </div>
                ))}
                {count > 5 && <span style={{ fontSize: 10, color: '#aaa' }}>+{count - 5}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right: presence count badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {count > 0 && (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>{count}</span>
            </div>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isSelected ? '#000' : '#ccc'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  )
}
