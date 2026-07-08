import NextAuth from 'next-auth'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { getServiceClient } from '@/lib/supabase'

export const authOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: { scope: 'openid profile email' },
      },
      issuer: 'https://www.linkedin.com',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name ?? '',
          lastName: profile.family_name ?? '',
          vanityName: profile.vanityName,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const supabase = getServiceClient()
        const linkedinId = profile?.sub ?? account?.providerAccountId
        const linkedinUrl = profile?.vanityName
          ? `https://www.linkedin.com/in/${profile.vanityName}`
          : `https://www.linkedin.com/in/${linkedinId}`

        // Check if user already exists
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
        token.linkedinUrl = profile.vanityName
          ? `https://www.linkedin.com/in/${profile.vanityName}`
          : `https://www.linkedin.com/in/${profile.sub}`
      }
      return token
    },

    async session({ session, token }) {
      session.user.linkedinId = token.linkedinId
      session.user.linkedinUrl = token.linkedinUrl

      // Fetch up-to-date user data from DB
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
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
