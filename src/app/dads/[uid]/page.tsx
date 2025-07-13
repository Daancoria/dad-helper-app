import type { Metadata } from 'next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import BookingForm from './BookingForm'

type DadProfile = {
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  status: 'pending' | 'approved' | 'rejected'
}

type PageProps = {
  params: { uid: string } | Promise<{ uid: string }>
  searchParams?: Record<string, string | string[] | undefined>
}

const fallbackAvatar = '/default-avatar.svg'

export async function generateMetadata({
  params,
}: {
  params: { uid: string }
}): Promise<Metadata> {
  try {
    const ref = doc(db, 'dads', params.uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) return {}
    const dad = snap.data() as DadProfile

    if (dad.status !== 'approved') return {}

    return {
      title: `${dad.displayName} - Dad for Hire`,
      description: dad.bio || 'Trusted and verified dad available to help.',
      openGraph: {
        title: `${dad.displayName} - Dad for Hire`,
        description: dad.bio || '',
        images: [
          {
            url: dad.photoURL || fallbackAvatar,
            width: 600,
            height: 600,
            alt: dad.displayName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${dad.displayName} - Dad for Hire`,
        description: dad.bio || '',
        images: [dad.photoURL || fallbackAvatar],
      },
    }
  } catch (err) {
    console.error('Metadata fetch failed:', err)
    return {}
  }
}

export default async function DadPublicPage(props: PageProps) {
  try {
    // Handle both direct object and Promise cases
    const params = props.params instanceof Promise ? await props.params : props.params
    const { uid } = params
    
    const ref = doc(db, 'dads', uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) return notFound()
    const dad = snap.data() as DadProfile

    if (dad.status !== 'approved') return notFound()

    return (
      <main className="max-w-2xl mx-auto p-6 text-center">
        <div className="space-y-4">
          <div className="w-32 h-32 rounded-full mx-auto overflow-hidden shadow">
            <Image
              src={dad.photoURL || fallbackAvatar}
              alt={dad.displayName}
              width={128}
              height={128}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold">{dad.displayName}</h1>
          <p className="text-gray-600">{dad.email}</p>
          {dad.bio && (
            <p className="text-gray-800 mt-4 whitespace-pre-line">{dad.bio}</p>
          )}
        </div>

        <Suspense fallback={<div>Loading booking form...</div>}>
          <BookingForm dadUid={uid} dadEmail={dad.email} />
        </Suspense>
      </main>
    )
  } catch (err) {
    console.error('Dad profile fetch error:', err)
    return notFound()
  }
}