import NextAuth from 'next-auth'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { getServiceClient } from '@/lib/supabase'

export const authOptions = {
  providers: [
    {
      ...LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        authorization: {
          params: { scope: 'openid profile email' },
        },
      }),
      checks: ['state'],
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const supabase = getServiceClient()
        const linkedinId = profile?.sub ?? account?.providerAccountId
        const linkedinUrl = `https://www.linkedin.com/in/${linkedinId}`
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('linkedin_id', linkedinId)
          .single()
        if (!existing) {
          await supabase.from('users').insert({
            linkedin_id: linkedinId,
            linkedin_url: linkedinUrl,
            first_name: profile?.given_name ?? '',
            last_name: profile?.family_name ?? '',
            email: user.email,
            profile_complete: false,
          })
        }
      } catch (err) {
        console.error('[NextAuth] signIn error:', err)
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.linkedinId = profile.sub ?? account.providerAccountId
        token.linkedinUrl = `https://www.linkedin.com/in/${profile.sub}`
      }
      return token
    },
    async session({ session, token }) {
      session.user.linkedinId = token.linkedinId
      session.user.linkedinUrl = token.linkedinUrl
      try {
        const supabase = getServiceClient()
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('linkedin_id', token.linkedinId)
          .single()
        if (data) {
          session.user.dbUser = data
          session.user.profileComplete = data.profile_complete
        }
      } catch (err) {
        console.error('[NextAuth] session error:', err)
      }
      return session
    },
  },
  pages: { signIn: '/', error: '/' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
