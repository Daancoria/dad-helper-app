'use client';
import { PageLayout } from '@/components/layout/PageLayout';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DadCard } from '@/components/dads/DadCard';

type Dad = {
  uid: string;
  displayName: string;
  bio: string;
  photoURL?: string;
  email: string;
  status: string;
};

export default function DadsPage() {
  return (
    <PageLayout>
      <DadsContent />
    </PageLayout>
  );
}

function DadsContent() {
  const [dads, setDads] = useState<Dad[]>([]);

  useEffect(() => {
    const fetchDads = async () => {
      const snapshot = await getDocs(collection(db, 'dads'));
      const approved = snapshot.docs
        .map(doc => doc.data() as Dad)
        .filter(dad => dad.status === 'approved');
      setDads(approved);
    };
    fetchDads();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Dads</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {dads.map((dad) => (
          <DadCard key={dad.uid} dad={dad} />
        ))}
      </div>
    </div>
  );
}
