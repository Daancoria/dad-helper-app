'use client'
import { PageLayout } from '@/components/layout/PageLayout'
import { collection, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type StatusFilter = 'pending' | 'approved' | 'rejected'

type Dad = {
  uid: string
  displayName: string
  bio: string
  email: string
  status: StatusFilter
}

type Booking = {
  id: string
  dadEmail: string
  parentEmail: string
  date: string
  message: string
  status: StatusFilter
}

export default function AdminPage() {
  return (
    <PageLayout>
      <AdminContent />
    </PageLayout>
  )
}

function AdminContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [allDads, setAllDads] = useState<Dad[]>([])
  const [dadFilter, setDadFilter] = useState<StatusFilter>('pending')

  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [bookingFilter, setBookingFilter] = useState<StatusFilter>('pending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      const role = snap.data()?.role
      if (role !== 'admin') {
        router.replace('/')
      }
    }

    if (!loading && user) {
      checkAdmin()
    }
  }, [user, loading, router])

  useEffect(() => {
    const unsubDads = onSnapshot(collection(db, 'dads'), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Dad)
      setAllDads(data)
    })

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Booking, 'id'>),
        id: doc.id,
      }))
      setAllBookings(data)
    })

    return () => {
      unsubDads()
      unsubBookings()
    }
  }, [])

  const updateDad = async (uid: string, status: StatusFilter) => {
    await updateDoc(doc(db, 'dads', uid), { status })
    toast.success(`Dad ${status}`)
  }

  const updateBooking = async (id: string, status: StatusFilter) => {
    await updateDoc(doc(db, 'bookings', id), { status })
    toast.success(`Booking ${status}`)
  }

  const filteredDads = allDads.filter((d) => d.status === dadFilter)
  const filteredBookings = allBookings
    .filter((b) => b.status === bookingFilter)
    .filter((b) =>
      b.dadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (loading || !user) return <p>Loading...</p>

  return (
    <div className="space-y-12">
      {/* Dad Filter Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Dad Profiles</h2>
        <div className="flex gap-2 mb-4">
          {(['pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setDadFilter(f)}
              className={`px-3 py-1 rounded ${dadFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {filteredDads.length === 0 ? (
          <p>No {dadFilter} dads.</p>
        ) : (
          <ul className="space-y-4">
            {filteredDads.map((dad) => (
              <li key={dad.uid} className="border p-4 rounded shadow">
                <h3 className="font-bold">{dad.displayName || 'Unnamed Dad'}</h3>
                <p>{dad.email}</p>
                <p className="mt-2">{dad.bio}</p>
                {dad.status === 'pending' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => updateDad(dad.uid, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateDad(dad.uid, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Booking Filter Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Bookings</h2>
        <div className="flex gap-2 mb-4">
          {(['pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setBookingFilter(f)}
              className={`px-3 py-1 rounded ${bookingFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by parent or dad email..."
          className="w-full border p-2 mb-4 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredBookings.length === 0 ? (
          <p>No {bookingFilter} bookings.</p>
        ) : (
          <ul className="space-y-4">
            {filteredBookings.map((b) => (
              <li key={b.id} className="border p-4 rounded shadow">
                <p><strong>Parent:</strong> {b.parentEmail}</p>
                <p><strong>Dad:</strong> {b.dadEmail}</p>
                <p><strong>Date:</strong> {b.date}</p>
                <p><strong>Message:</strong> {b.message}</p>
                {b.status === 'pending' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => updateBooking(b.id, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateBooking(b.id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
