import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

function checkToken(request) {
  return request.headers.get('x-admin-token') === process.env.ADMIN_SECRET
}

// GET – tous les signalements (admin)
export async function GET(request) {
  if (!checkToken(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('venue_reports')
    .select(`
      id, reason, reviewed, created_at,
      venues ( id, name, address ),
      users ( first_name, last_name, email )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH – marquer un signalement comme traité
export async function PATCH(request) {
  if (!checkToken(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await request.json()
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('venue_reports')
    .update({ reviewed: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
