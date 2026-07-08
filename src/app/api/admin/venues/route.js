import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

function checkAdmin(request) {
  const token = request.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET
}

// GET – liste tous les lieux
export async function GET(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('venues').select('*').order('city').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST – ajouter un lieu
export async function POST(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const body = await request.json()
  const { name, address, city, lat, lng, comment, venue_type } = body
  if (!name || !address || !lat || !lng) {
    return NextResponse.json({ error: 'name, address, lat, lng sont obligatoires' }, { status: 400 })
  }
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('venues')
    .insert({ name, address, city: city || 'Paris', lat, lng, comment, venue_type, active: true })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH – modifier un lieu (toggle active ou modifier infos)
export async function PATCH(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id, ...updates } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('venues').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE – supprimer un lieu
export async function DELETE(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  const supabase = getServiceClient()
  await supabase.from('venues').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
