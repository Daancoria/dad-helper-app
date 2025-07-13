'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = 'hidden md:block' }: SidebarProps) {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const userData = snap.data();
          setRole(userData?.role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
        setRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  return (
    <aside className={`bg-gray-100 w-64 p-4 h-full border-r ${className}`}>
      <nav className="space-y-3">
        <Link href="/" className="block text-blue-700 font-medium" aria-label="Home">
          Home
        </Link>

        {role === 'parent' && (
          <>
            <Link href="/dads" className="block" aria-label="Browse Dads">
              Browse Dads
            </Link>
            <Link href="/profile/parent" className="block" aria-label="My Bookings">
              My Bookings
            </Link>
          </>
        )}

        {role === 'dad' && (
          <Link href="/profile/dad" className="block" aria-label="Edit Dad Profile">
            Edit Profile
          </Link>
        )}

        {role === 'admin' && (
          <Link href="/admin" className="block" aria-label="Admin Panel">
            Admin Panel
          </Link>
        )}
      </nav>
    </aside>
  );
}
