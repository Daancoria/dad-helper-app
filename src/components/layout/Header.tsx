'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function Header() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState<boolean>(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        return;
      }

      setCheckingRole(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data?.role || 'parent');
        } else {
          console.warn('No user document found.');
          setRole(null);
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err);
        setRole(null);
      } finally {
        setCheckingRole(false);
      }
    };

    fetchRole();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-lg" aria-label="Go to homepage">
        Dad Helper
      </Link>

      <div className="flex items-center gap-4">
        {user && role && !checkingRole && (
          <span className="text-sm">Logged in as: {role}</span>
        )}

        {user ? (
          <button
            className="bg-red-500 px-3 py-1 rounded"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" className="text-sm underline" aria-label="Login page">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
