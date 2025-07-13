'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { FirebaseError } from 'firebase/app'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'parent' | 'dad'>('parent')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)

      // Create user document
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        email,
        role,
        createdAt: serverTimestamp(),
      })

      // If registering as a dad, create a pending dad profile
      if (role === 'dad') {
        await setDoc(doc(db, 'dads', userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          displayName: '',
          bio: '',
          photoURL: '',
          status: 'pending',
          createdAt: serverTimestamp(),
        })
        toast.success('Registered as dad. Awaiting approval.')
      } else {
        toast.success('Registration successful!')
      }

      // Reset form (optional)
      setEmail('')
      setPassword('')

      // Redirect to role-aware page
      router.push('/profile')
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message)
      } else {
        setError('Something went wrong.')
      }
    }
  }

  return (
    <main className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as 'parent' | 'dad')}
        >
          <option value="parent">I&apos;m a Parent</option>
          <option value="dad">I&apos;m a Dad (register as provider)</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </main>
  )
}
