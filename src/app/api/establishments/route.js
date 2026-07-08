import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request) {
  const body = await request.json()
  const { establishment_name, contact_name, address, email, phone } = body

  if (!establishment_name || !contact_name || !address || !email || !phone) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('establishment_requests')
    .insert({ establishment_name, contact_name, address, email, phone })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
