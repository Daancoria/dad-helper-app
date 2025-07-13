'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user || loading) return;

    const routeByRole = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          toast.error('User document not found. Redirecting...');
          router.replace('/login');
          return;
        }

        const role = userSnap.data()?.role;

        if (role === 'dad') {
          const dadRef = doc(db, 'dads', user.uid);
          const dadSnap = await getDoc(dadRef);

          if (!dadSnap.exists()) {
            toast.error('Dad profile missing. Contact support.');
            router.replace('/login');
            return;
          }

          const status = dadSnap.data()?.status;

          if (status === 'approved') {
            toast.success('Welcome, dad!');
            router.replace('/profile/dad');
          } else {
            setPending(true);
          }
        } else if (role === 'parent') {
          toast.success('Welcome, parent!');
          router.replace('/profile/parent');
        } else if (role === 'admin') {
          toast.success('Welcome, admin!');
          router.replace('/admin');
        } else {
          toast.error('Unknown role. Redirecting...');
          router.replace('/login');
        }
      } catch (err) {
        console.error('Redirect error:', err);
        toast.error('An error occurred. Redirecting...');
        router.replace('/login');
      }
    };

    routeByRole();
  }, [user, loading, router]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (pending) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Your dad profile is pending approval.</h2>
        <p className="text-gray-600 mt-2">
          Please wait for an admin to approve your account.
        </p>
      </div>
    );
  }

  return <p className="p-4">Redirecting...</p>;
}
