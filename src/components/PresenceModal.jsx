'use client'
import { useState } from 'react'

const PERIODS = [
  { value: 'morning',   label: 'Matin',          sub: 'Visible jusqu\'à 12h00' },
  { value: 'afternoon', label: 'Après-midi',      sub: 'Visible à partir de 12h00' },
  { value: 'full_day',  label: 'Journée entière', sub: 'Matin + Après-midi' },
]

export default function PresenceModal({ venue, currentPresence, onClose, onSaved }) {
  const [period, setPeriod] = useState(currentPresence?.period || 'full_day')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: venue.id, period }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSaved(venue.id, period)
      onClose()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    setLoading(true)
    try {
      await fetch('/api/presence', { method: 'DELETE' })
      onSaved(null, null)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center p-4">
      <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: 380, fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #ebebeb' }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>Je suis ici</h3>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{venue.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #e0e0e0', cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#888' }}>
            ×
          </button>
        </div>

        {/* Period selection */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', margin: '0 0 8px' }}>Choisir un créneau</p>

          {PERIODS.map(({ value, label, sub }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                border: period === value ? '2px solid #000' : '1px solid #e0e0e0',
                background: period === value ? '#f8f8f8' : '#fff',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 36, height: 36, border: '1px solid',
                borderColor: period === value ? '#000' : '#e0e0e0',
                background: period === value ? '#000' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: period === value ? '#fff' : '#888',
                letterSpacing: '0.04em',
              }}>
                {value === 'morning' ? 'M' : value === 'afternoon' ? 'A' : 'J'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#000' }}>{label}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>{sub}</div>
              </div>
              {period === value && (
                <div style={{ width: 18, height: 18, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}

          {error && <p style={{ fontSize: 11, color: '#cc0000', margin: '4px 0 0' }}>{error}</p>}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: 13, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.09em', textTransform: 'uppercase', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Enregistrement...' : 'Confirmer la présence'}
          </button>

          {currentPresence && (
            <button
              onClick={handleRemove}
              disabled={loading}
              style={{ width: '100%', background: 'none', border: 'none', color: '#aaa', fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', padding: 8 }}
            >
              Retirer ma présence
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
