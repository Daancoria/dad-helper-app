'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Booking = {
  dadEmail: string;
  date: string;
  message: string;
  status: string;
  createdAt: number;
};

export default function ParentPage() {
  return (
    <PageLayout>
      <ParentContent />
    </PageLayout>
  );
}

function ParentContent() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'bookings'), where('parentUid', '==', user.uid));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => doc.data() as Booking);
        setBookings(results);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        toast.error('Failed to load bookings.');
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading || !user || loadingBookings) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Booking History</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b, i) => (
            <li key={i} className="border p-4 rounded shadow">
              <p><strong>Dad:</strong> {b.dadEmail}</p>
              <p><strong>Date:</strong> {b.date}</p>
              <p><strong>Message:</strong> {b.message}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={
                    b.status === 'approved'
                      ? 'text-green-600'
                      : b.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }
                >
                  {b.status}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
