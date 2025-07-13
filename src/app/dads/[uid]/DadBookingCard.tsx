'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface DadBookingCardProps {
  id: string;
  parentEmail: string;
  date: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function DadBookingCard({
  id,
  parentEmail,
  date,
  message,
  status,
}: DadBookingCardProps) {
  const handleAction = async (newStatus: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
      toast.success(`Booking ${newStatus}`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="border p-4 rounded shadow-md bg-white space-y-2">
      <div><strong>From:</strong> {parentEmail}</div>
      <div><strong>Date:</strong> {date}</div>
      <div><strong>Message:</strong> {message}</div>
      <div><strong>Status:</strong> <span className="capitalize">{status}</span></div>

      {status === 'pending' && (
        <div className="flex gap-2 mt-2">
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => handleAction('accepted')}
          >
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => handleAction('rejected')}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
