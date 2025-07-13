'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Image from 'next/image';

type DadProfile = {
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
};

const fallbackPhoto = '/default-avatar.svg';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dads, setDads] = useState<DadProfile[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<Record<string, Partial<DadProfile>>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDads = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'dads'));
        const list: DadProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DadProfile;
          list.push({ ...data, uid: docSnap.id });
        });
        setDads(list);
      } catch (err) {
        console.error('Failed to fetch dads:', err);
      }
    };

    if (user) fetchDads();
  }, [user]);

  const updateStatus = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'dads', uid), { status });
      toast.success(`Status updated to ${status}`);
      setDads((prev) =>
        prev.map((d) => (d.uid === uid ? { ...d, status } : d))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  const startEditing = (uid: string) => {
    setEditing((prev) => ({ ...prev, [uid]: true }));
    const current = dads.find((d) => d.uid === uid);
    setFormState((prev) => ({
      ...prev,
      [uid]: {
        displayName: current?.displayName || '',
        bio: current?.bio || '',
      },
    }));
  };

  const cancelEditing = (uid: string) => {
    setEditing((prev) => ({ ...prev, [uid]: false }));
    setFormState((prev) => ({ ...prev, [uid]: {} }));
  };

  const saveChanges = async (uid: string) => {
    const updates = formState[uid];
    try {
      await updateDoc(doc(db, 'dads', uid), {
        displayName: updates.displayName,
        bio: updates.bio,
      });
      toast.success('Profile updated');
      setDads((prev) =>
        prev.map((d) =>
          d.uid === uid ? { ...d, ...updates } : d
        )
      );
      cancelEditing(uid);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const filteredDads = dads.filter((d) => d.status === filter);

  if (loading || !user) return <p className="p-4">Loading...</p>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-4 mb-4">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filteredDads.length === 0 ? (
        <p>No {filter} profiles.</p>
      ) : (
        <ul className="space-y-4">
          {filteredDads.map((dad) => (
            <li
              key={dad.uid}
              className="border p-4 rounded shadow flex gap-4 items-start"
            >
              <Image
                src={dad.photoURL || fallbackPhoto}
                alt={dad.displayName || 'Dad'}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />

              <div className="flex-1">
                {editing[dad.uid] ? (
                  <>
                    <input
                      type="text"
                      className="w-full border p-1 rounded mb-2"
                      value={formState[dad.uid]?.displayName || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [dad.uid]: {
                            ...prev[dad.uid],
                            displayName: e.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      className="w-full border p-1 rounded mb-2"
                      rows={3}
                      value={formState[dad.uid]?.bio || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [dad.uid]: {
                            ...prev[dad.uid],
                            bio: e.target.value,
                          },
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveChanges(dad.uid)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEditing(dad.uid)}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-lg">
                      {dad.displayName || '(No Name)'}{' '}
                      <span className="text-sm text-gray-500 ml-2">
                        ({dad.status})
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{dad.email}</p>
                    {dad.bio && <p className="text-sm mt-1">{dad.bio}</p>}

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => updateStatus(dad.uid, 'approved')}
                        disabled={dad.status === 'approved'}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(dad.uid, 'rejected')}
                        disabled={dad.status === 'rejected'}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => startEditing(dad.uid)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
