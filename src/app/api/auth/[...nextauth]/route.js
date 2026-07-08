import NextAuth from 'next-auth'
import { createClient } from '@supabase/supabase-js'

const handler = NextAuth({
  debug: true,
  providers: [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'oauth',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      client: { token_endpoint_auth_method: 'client_secret_post' },
      authorization: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: { scope: 'openid profile email', response_type: 'code' },
      },
      token: {
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
        async request(context) {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: context.params.code,
            redirect_uri: context.provider.callbackUrl,
            client_id: context.provider.clientId,
            client_secret: context.provider.clientSecret,
          })
          const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          })
          const tokens = await res.json()
          if (!res.ok) throw new Error(`LinkedIn token error: ${JSON.stringify(tokens)}`)
          return { tokens }
        },
      },
      userinfo: {
        url: 'https://api.linkedin.com/v2/userinfo',
        async request(context) {
          const res = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${context.tokens.access_token}` },
          })
          if (!res.ok) throw new Error(`LinkedIn userinfo error: ${res.status}`)
          return res.json()
        },
      },
      checks: ['state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        const linkedinId = profile?.sub ?? account?.providerAccountId
        const { data: existing } = await supabase
          .from('users').select('id').eq('linkedin_id', linkedinId).single()
        if (!existing) {
          const { error } = await supabase.from('users').insert({
            linkedin_id: linkedinId,
            linkedin_url: `https://www.linkedin.com/in/${linkedinId}`,
            first_name: profile?.given_name ?? '',
            last_name: profile?.family_name ?? '',
            email: user.email,
            profile_complete: false,
          })
          if (error) console.error('[signIn] insert error:', error)
        }
      } catch (err) {
        console.error('[signIn] error:', err)
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.linkedinId = profile.sub ?? account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      session.user.linkedinId = token.linkedinId
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        const { data } = await supabase
          .from('users').select('*').eq('linkedin_id', token.linkedinId).single()
        if (data) {
          session.user.dbUser = data
          session.user.profileComplete = data.profile_complete
        } else {
          session.user.profileComplete = false
        }
      } catch (err) {
        console.error('[session] error:', err)
        session.user.profileComplete = false
      }
      return session
    },
  },
  pages: { signIn: '/', error: '/' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})

export { handler as GET, handler as POST }
