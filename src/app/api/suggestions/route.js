import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { name, address, comment } = await request.json()
  if (!name) return NextResponse.json({ error: 'Nom du lieu requis' }, { status: 400 })

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('venue_suggestions')
    .insert({
      name,
      address: address || null,
      comment: comment || null,
      submitted_by: session.user.dbUser?.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
