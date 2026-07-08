import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

function checkAdmin(request) {
  const token = request.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET
}

// GET – toutes les demandes d'établissements + suggestions de lieux
export async function GET(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const supabase = getServiceClient()

  const [{ data: requests }, { data: suggestions }] = await Promise.all([
    supabase.from('establishment_requests').select('*').order('created_at', { ascending: false }),
    supabase
      .from('venue_suggestions')
      .select('*, users(first_name, last_name, email)')
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({ requests: requests || [], suggestions: suggestions || [] })
}

// PATCH – marquer comme traité
export async function PATCH(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { type, id } = await request.json()
  const supabase = getServiceClient()
  const table = type === 'suggestion' ? 'venue_suggestions' : 'establishment_requests'
  await supabase.from(table).update({ reviewed: true }).eq('id', id)
  return NextResponse.json({ ok: true })
}
