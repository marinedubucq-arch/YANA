import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

function checkAdmin(request) {
  const token = request.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET
}

// GET – liste tous les utilisateurs
export async function GET(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, industry, project_name, profile_complete, active, created_at, linkedin_url')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH – activer/désactiver un utilisateur
export async function PATCH(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id, active } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('users').update({ active }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE – supprimer un utilisateur
export async function DELETE(request) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  const supabase = getServiceClient()
  await supabase.from('users').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
