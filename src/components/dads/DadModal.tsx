'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

type Dad = {
  uid: string;
  displayName: string;
  email: string;
};

export function DadModal({ dad, onClose }: { dad: Dad; onClose: () => void }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    if (!date || !message) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        dadUid: dad.uid,
        dadEmail: dad.email,
        parentUid: user.uid,
        parentEmail: user.email,
        message,
        date,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success('Booking request sent!');
      setMessage('');
      setDate('');
      onClose();
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to send booking.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
          <p className="text-gray-800">Please log in to request a booking.</p>
          <button
            className="mt-4 text-sm text-gray-600 underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Book {dad.displayName}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Booking'}
          </button>
        </form>
        <button
          className="mt-4 text-sm text-gray-600 underline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
