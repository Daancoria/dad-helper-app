import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      uid: string
      role: 'admin' | 'dad' | 'parent' | null
    } & DefaultSession['user']
  }
}
