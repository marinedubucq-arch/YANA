'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const INDUSTRIES = [
  'Tech / IT', 'Marketing', 'Design', 'Finance', 'RH / Recrutement',
  'Conseil / Stratégie', 'Éducation', 'Santé / Bien-être', 'Food & Beverage',
  'E-commerce', 'Immobilier', 'Juridique', 'Communication / RP',
  'Art / Créatif', 'Sport', 'Développement durable', 'Mode / Beauté', 'Autre',
]

const inputCls = {
  width: '100%',
  border: '1px solid #ddd',
  padding: '9px 12px',
  fontSize: 13,
  color: '#000',
  background: '#fff',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  borderRadius: 0,
}

export default function ProfileModal({ onComplete }) {
  const { data: session, update } = useSession()
  const dbUser = session?.user?.dbUser

  const [form, setForm] = useState({
    first_name:   dbUser?.first_name   || session?.user?.name?.split(' ')[0] || '',
    last_name:    dbUser?.last_name    || session?.user?.name?.split(' ').slice(1).join(' ') || '',
    industry:     dbUser?.industry     || '',
    project_name: dbUser?.project_name || '',
    linkedin_url: dbUser?.linkedin_url || session?.user?.linkedinUrl || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.linkedin_url.includes('linkedin.com')) {
      setError('Veuillez entrer une URL LinkedIn valide (ex: https://www.linkedin.com/in/votre-nom)')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      await update()
      onComplete()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: 400, fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#000', color: '#fff', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 28, letterSpacing: '0.04em', marginBottom: 8 }}>YANA</div>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>Compléter le profil</h2>
          <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Requis pour accéder à la carte des lieux workers-friendly</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: 'first_name', label: 'Prénom *', ph: 'Marie' },
              { k: 'last_name',  label: 'Nom *',    ph: 'Dupont' },
            ].map(f => (
              <div key={f.k}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{f.label}</label>
                <input style={inputCls} placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} required />
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Secteur *</label>
            <select style={{ ...inputCls, appearance: 'none' }} value={form.industry} onChange={e => set('industry', e.target.value)} required>
              <option value="">Choisir votre secteur…</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Profil LinkedIn *</label>
            <input style={inputCls} type="url" placeholder="https://www.linkedin.com/in/votre-nom" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              Projet / Entreprise <span style={{ fontWeight: 400, color: '#bbb' }}>(optionnel)</span>
            </label>
            <input style={inputCls} placeholder="Mon Super Projet" value={form.project_name} onChange={e => set('project_name', e.target.value)} />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#cc0000', border: '1px solid #ffcccc', padding: '10px 12px', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: 13, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.09em', textTransform: 'uppercase', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Enregistrement...' : 'Accéder à la carte →'}
          </button>
        </form>
      </div>
    </div>
  )
}
