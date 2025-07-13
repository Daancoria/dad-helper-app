'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UnauthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      if (!user || loading) return; 

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.warn('No user doc found');
          return;
        }

        const role = snap.data().role || 'parent';

        if (role === 'admin') {
          router.replace('/admin');
        } else if (role === 'dad') {
          router.replace('/profile/dad');
        } else {
          router.replace('/profile/parent');
        }
      } catch (err) {
        console.error('Redirect failed:', err);
      }
    };

    const isUnauthPath =
      pathname === '/unauth' ||
      pathname === '/unauth/login' ||
      pathname === '/unauth/register';

    if (!loading && user && isUnauthPath) {
      redirectBasedOnRole();
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
