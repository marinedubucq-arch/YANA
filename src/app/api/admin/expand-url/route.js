import { NextResponse } from 'next/server'

export async function POST(request) {
  const adminToken = request.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YANA-Admin/1.0)' },
    })
    return NextResponse.json({ url: res.url })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
