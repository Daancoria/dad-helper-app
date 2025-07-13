import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          const userDoc = await getDoc(doc(db, 'users', token.sub))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            session.user.role = userData.role || null
          }
          session.user.uid = token.sub
        } catch (err) {
          console.error('Error fetching role in session callback:', err)
        }
      }
      return session
    },
  },
}
