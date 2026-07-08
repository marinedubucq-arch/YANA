'use client'
import { useState } from 'react'

export default function SuggestVenue({ onClose }) {
  const [form, setForm] = useState({ name: '', address: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = {
    width: '100%',
    border: '1px solid #e0e0e0',
    padding: '9px 12px',
    fontSize: 12,
    color: '#000',
    background: '#fff',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 0,
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center p-4">
      <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: 360, fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #ebebeb' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Suggérer un lieu</h3>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #e0e0e0', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#888' }}>
            ×
          </button>
        </div>

        {success ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 11, marginBottom: 6 }}>Suggestion envoyée</p>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 20px' }}>Nous l'examinerons rapidement.</p>
            <button onClick={onClose} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'name', label: 'Nom du lieu *', placeholder: 'Café des Artistes', required: true },
              { key: 'address', label: 'Adresse', placeholder: '42 Rue des Fleurs, 75001 Paris', required: false },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{f.label}</label>
                <input
                  type="text"
                  required={f.required}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(fr => ({ ...fr, [f.key]: e.target.value }))}
                  style={inputCls}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Commentaire</label>
              <textarea
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Wifi rapide, prises électriques, ambiance calme…"
                rows={3}
                style={{ ...inputCls, resize: 'none' }}
              />
            </div>

            {error && <p style={{ fontSize: 11, color: '#cc0000', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button
                type="button" onClick={onClose}
                style={{ flex: 1, border: '1px solid #e0e0e0', color: '#888', background: 'transparent', padding: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase' }}
              >
                Annuler
              </button>
              <button
                type="submit" disabled={loading}
                style={{ flex: 1, background: '#000', color: '#fff', border: 'none', padding: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
