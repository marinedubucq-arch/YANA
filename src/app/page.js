'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const INDUSTRIES = [
  'Tech / IT', 'Marketing', 'Design', 'Finance', 'RH / Recrutement',
  'Conseil / Stratégie', 'Éducation', 'Santé / Bien-être', 'Food & Beverage',
  'E-commerce', 'Immobilier', 'Juridique', 'Communication / RP',
  'Art / Créatif', 'Sport', 'Développement durable', 'Mode / Beauté', 'Autre',
]

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showEstabForm, setShowEstabForm] = useState(false)
  const [estabForm, setEstabForm] = useState({
    establishment_name: '', contact_name: '', address: '', email: '', phone: '',
  })
  const [estabLoading, setEstabLoading] = useState(false)
  const [estabSuccess, setEstabSuccess] = useState(false)
  const [estabError, setEstabError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard')
  }, [status, router])

  async function handleEstabSubmit(e) {
    e.preventDefault()
    setEstabLoading(true)
    setEstabError('')
    try {
      const res = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estabForm),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEstabSuccess(true)
      setEstabForm({ establishment_name: '', contact_name: '', address: '', email: '', phone: '' })
    } catch (err) {
      setEstabError(err.message || 'Une erreur est survenue')
    } finally {
      setEstabLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const inputCls = 'w-full border border-white/10 bg-black text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white transition'

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center border-b border-white/5">
        <h1 style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 'clamp(80px, 20vw, 160px)', lineHeight: 0.88, letterSpacing: '0.02em', color: '#fff', margin: '0 0 12px' }}>
          YANA
        </h1>
        <p style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', fontSize: 16, color: '#555', marginBottom: 28 }}>
          You Are Not Alone
        </p>
        <p style={{ fontSize: 14, color: '#555', maxWidth: 360, lineHeight: 1.7, marginBottom: 36 }}>
          La plateforme des entrepreneurs solo qui veulent bosser, brainstormer
          et se connecter dans les meilleurs cafés workers-friendly de la ville.
        </p>

        <button
          onClick={() => signIn('linkedin', { callbackUrl: '/dashboard' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fff', color: '#000', border: 'none', padding: '14px 32px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Rejoindre avec LinkedIn
        </button>

        <p style={{ marginTop: 12, fontSize: 10, color: '#2a2a2a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          1 compte · 1 profil LinkedIn · identité vérifiée
        </p>
      </section>

      {/* ── 3 PROBLÈMES ───────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/5">
        {[
          { n: '01', title: 'Trouver les bons endroits', desc: 'Des lieux vérifiés, gratuits hors consommation, qui acceptent les laptops. Fini la frustration de chercher où poser son ordi.' },
          { n: '02', title: 'Brainstormer avec des pairs', desc: 'Une pause café improvisée avec des entrepreneurs dans les mêmes galères. Sans agenda ni inscription compliquée.' },
          { n: '03', title: 'Networker sans soirées', desc: 'Des rencontres naturelles dans la journée. Sans cotisation premium ni soirée networking à l\'autre bout de Paris.' },
        ].map((item, i) => (
          <div key={item.n} className={`p-10 ${i < 2 ? 'sm:border-r border-white/5' : ''} border-b sm:border-b-0 border-white/5`}>
            <div style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 48, color: '#111', lineHeight: 1, marginBottom: 10 }}>{item.n}</div>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: 10 }}>{item.title}</h3>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65 }}>{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA SECONDAIRE ────────────────────────────────── */}
      <section className="flex flex-col items-center py-24 px-6 text-center border-b border-white/5">
        <p style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Gratuit · Sans abonnement · Ouvert à tous les entrepreneurs
        </p>
        <button
          onClick={() => signIn('linkedin', { callbackUrl: '/dashboard' })}
          style={{ border: '1px solid #fff', color: '#fff', background: 'transparent', padding: '13px 32px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          onMouseEnter={e => { e.target.style.background = '#fff'; e.target.style.color = '#000' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#fff' }}
        >
          Commencer maintenant
        </button>
      </section>

      {/* ── FORMULAIRE ÉTABLISSEMENTS ─────────────────────── */}
      <section className="py-20 px-6" id="etablissements">
        <div className="max-w-md mx-auto">
          <p style={{ fontSize: 10, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
            Vous gérez un café, restaurant ou hôtel ?
          </p>
          <h2 style={{ fontFamily: 'Impact, Arial Narrow, Arial, sans-serif', fontSize: 36, letterSpacing: '0.02em', textAlign: 'center', marginBottom: 20 }}>
            Référencer votre lieu
          </h2>

          {!showEstabForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowEstabForm(true)}
                style={{ border: '1px solid #1f1f1f', color: '#555', background: 'transparent', padding: '11px 24px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase' }}
              >
                Remplir le formulaire de référencement
              </button>
            </div>
          ) : estabSuccess ? (
            <div style={{ border: '1px solid #1f1f1f', padding: 32, textAlign: 'center' }}>
              <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 12 }}>Demande envoyée</p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 6 }}>Nous la traitons dès que possible.</p>
            </div>
          ) : (
            <form onSubmit={handleEstabSubmit} style={{ border: '1px solid #1a1a1a', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'establishment_name', label: "Nom de l'établissement", placeholder: 'Le Café du Coin' },
                { key: 'contact_name', label: 'Nom du contact', placeholder: 'Marie Dupont' },
                { key: 'address', label: 'Adresse complète', placeholder: '12 Rue de la Paix, 75001 Paris' },
                { key: 'email', label: 'Email', placeholder: 'contact@monlieu.fr', type: 'email' },
                { key: 'phone', label: 'Téléphone', placeholder: '+33 6 00 00 00 00', type: 'tel' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{field.label}</label>
                  <input type={field.type || 'text'} placeholder={field.placeholder} value={estabForm[field.key]} onChange={e => setEstabForm({ ...estabForm, [field.key]: e.target.value })} required className={inputCls} />
                </div>
              ))}
              {estabError && <p style={{ fontSize: 12, color: '#e44' }}>{estabError}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowEstabForm(false)} style={{ flex: 1, border: '1px solid #1f1f1f', color: '#555', background: 'transparent', padding: 11, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Annuler
                </button>
                <button type="submit" disabled={estabLoading} style={{ flex: 1, background: '#fff', color: '#000', border: 'none', padding: 11, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: estabLoading ? 0.5 : 1 }}>
                  {estabLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #111', padding: '20px 24px', textAlign: 'center', fontSize: 10, color: '#222', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        © {new Date().getFullYear()} YANA — You Are Not Alone
      </footer>
    </div>
  )
}
