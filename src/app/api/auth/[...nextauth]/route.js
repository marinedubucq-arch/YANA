import NextAuth from 'next-auth'
import { getServiceClient } from '@/lib/supabase'

const handler = NextAuth({
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
        params: { scope: 'openid profile email' },
      },
      token: 'https://www.linkedin.com/oauth/v2/accessToken',
      userinfo: 'https://api.linkedin.com/v2/userinfo',
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
        const supabase = getServiceClient()
        const linkedinId = profile?.sub ?? account?.providerAccountId
        const { data: existing } = await supabase
          .from('users').select('id').eq('linkedin_id', linkedinId).single()
        if (!existing) {
          await supabase.from('users').insert({
            linkedin_id: linkedinId,
            linkedin_url: `https://www.linkedin.com/in/${linkedinId}`,
            first_name: profile?.given_name ?? '',
            last_name: profile?.family_name ?? '',
            email: user.email,
            profile_complete: false,
          })
        }
      } catch (err) { console.error('[signIn]', err) }
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
        const supabase = getServiceClient()
        const { data } = await supabase
          .from('users').select('*').eq('linkedin_id', token.linkedinId).single()
        if (data) {
          session.user.dbUser = data
          session.user.profileComplete = data.profile_complete
        }
      } catch (err) { console.error('[session]', err) }
      return session
    },
  },
  pages: { signIn: '/', error: '/' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})

export { handler as GET, handler as POST }
