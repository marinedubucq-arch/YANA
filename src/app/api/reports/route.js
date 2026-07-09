import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServiceClient } from '@/lib/supabase'

// POST – signaler un lieu comme non laptop-friendly
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { venue_id, reason } = await request.json()

  if (!venue_id || !reason?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { error } = await supabase.from('venue_reports').insert({
    venue_id,
    user_id: session.user.dbUser?.id ?? null,
    reason: reason.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
