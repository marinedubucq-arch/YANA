import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServiceClient } from '@/lib/supabase'

// PATCH – mettre à jour le profil de l'utilisateur
export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json()
  const { first_name, last_name, industry, project_name, linkedin_url } = body

  // Validation des champs obligatoires
  if (!first_name || !last_name || !industry || !linkedin_url) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const linkedinId = session.user.linkedinId

  const { data, error } = await supabase
    .from('users')
    .update({
      first_name,
      last_name,
      industry,
      project_name: project_name || null,
      linkedin_url,
      profile_complete: true,
    })
    .eq('linkedin_id', linkedinId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
