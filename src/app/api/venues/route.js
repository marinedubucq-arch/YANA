import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { getParisTodayDate, getParisHour } from '@/lib/paris-time'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') || null

  const supabase = getServiceClient()
  const today = getParisTodayDate()
  const hour = getParisHour()

  // Fetch active venues
  let query = supabase.from('venues').select('*').eq('active', true).order('name')
  if (city) query = query.eq('city', city)
  const { data: venues, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch today's presence with visible filter based on Paris time
  const { data: presenceRows } = await supabase
    .from('presence')
    .select('venue_id, period, users(first_name, industry)')
    .eq('date', today)

  // Filter by time slot visibility
  const visiblePresence = (presenceRows || []).filter(p => {
    if (p.period === 'morning') return hour < 12
    if (p.period === 'afternoon') return hour >= 12
    return true // full_day always visible
  })

  // Group presence by venue
  const presenceByVenue = {}
  for (const p of visiblePresence) {
    if (!presenceByVenue[p.venue_id]) presenceByVenue[p.venue_id] = []
    presenceByVenue[p.venue_id].push({
      firstName: p.users?.first_name,
      industry: p.users?.industry,
      period: p.period,
    })
  }

  // Attach presence dots to each venue
  const venuesWithPresence = (venues || []).map(v => ({
    ...v,
    presence: presenceByVenue[v.id] || [],
  }))

  return NextResponse.json(venuesWithPresence)
}
