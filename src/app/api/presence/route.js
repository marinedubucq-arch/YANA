import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServiceClient } from '@/lib/supabase'
import { getParisTodayDate } from '@/lib/paris-time'

// POST – déclarer sa présence dans un lieu
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { venueId, period } = await request.json()
  if (!venueId || !['morning', 'afternoon', 'full_day'].includes(period)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const today = getParisTodayDate()
  const userId = session.user.dbUser?.id

  if (!userId) return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 })

  // Upsert: un utilisateur = une présence par jour
  const { data, error } = await supabase
    .from('presence')
    .upsert(
      { user_id: userId, venue_id: venueId, period, date: today },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE – retirer sa présence
export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = getServiceClient()
  const today = getParisTodayDate()
  const userId = session.user.dbUser?.id

  await supabase.from('presence').delete().eq('user_id', userId).eq('date', today)
  return NextResponse.json({ ok: true })
}

// GET – présence de l'utilisateur courant aujourd'hui
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = getServiceClient()
  const today = getParisTodayDate()
  const userId = session.user.dbUser?.id

  const { data } = await supabase
    .from('presence')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return NextResponse.json(data || null)
}
