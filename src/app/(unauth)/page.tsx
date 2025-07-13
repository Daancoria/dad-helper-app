'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user || loading) {
        setChecking(false);
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        const role = snap.exists() ? snap.data().role : null;

        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'dad') {
          router.push('/dads/profile');
        } else {
          router.push('/parent');
        }
      } catch (err) {
        console.error('Redirect check failed:', err);
        setChecking(false); // show welcome screen even if fetch fails
      }
    };

    checkAndRedirect();
  }, [user, loading, router]);

  if (loading || (user && checking)) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
        Welcome to Dads 4 Hire!
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
        A safe place for parents to book help from trustworthy, approved dads.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-green-600 text-white px-6 py-3 rounded text-lg hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>

      <footer className="mt-16 text-sm text-gray-500">
        Built with ❤️ using Next.js & Firebase
      </footer>
    </main>
  );
}

