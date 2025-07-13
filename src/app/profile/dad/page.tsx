import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/firebase';
import { getDocs, collection, query, where } from 'firebase/firestore';
import DadDashboard from './DadDashboard';
import type { Booking } from '@/types';
import { redirect } from 'next/navigation';

export default async function DadDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, 'bookings'), where('dadUid', '==', user.uid))
    );

    const bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];

    return <DadDashboard bookings={bookings} />;
  } catch (err) {
    console.error('Error loading dad bookings:', err);
    // Optional: You can return a fallback UI or redirect to an error page
    redirect('/profile'); // fallback if something breaks
  }
}

