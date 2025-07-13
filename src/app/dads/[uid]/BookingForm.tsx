'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BookingFormProps {
  dadUid: string;
  dadEmail: string;
}

export default function BookingForm({ dadUid, dadEmail }: BookingFormProps) {
  const { user, loading } = useAuth();
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || loading) {
      toast.error('You must be logged in to book.');
      return;
    }

    if (!date || !message) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'bookings'), {
        dadUid,
        dadEmail,
        parentUid: user.uid,
        parentEmail: user.email,
        date,
        message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success('Booking request sent!');
      setDate('');
      setMessage('');
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to send booking. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="mt-4 text-center text-gray-500">Loading booking form...</p>;
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600 mt-6">
        <p className="mb-2">
          Please{' '}
          <Link href="/login" className="underline text-blue-600">
            log in
          </Link>{' '}
          to request a booking.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mt-8 bg-white p-4 rounded shadow max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold mb-2">Book this Dad</h2>

      <div>
        <label className="block font-medium mb-1">Preferred Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={4}
          placeholder="Let them know what you're looking for..."
          disabled={submitting}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Sending...' : 'Send Booking Request'}
      </button>
    </form>
  );
}
