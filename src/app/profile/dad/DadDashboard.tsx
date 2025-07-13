'use client';

import { FC, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import DadBookingCard from '@/components/dads/DadBookingCard';

interface Booking {
  id: string;
  parentEmail: string;
  date: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Props {
  bookings: Booking[];
}

const DadDashboard: FC<Props> = ({ bookings: initialBookings }) => {
  const [bookings, setBookings] = useState(initialBookings);
  const [disabledIds, setDisabledIds] = useState<string[]>([]);

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setDisabledIds((prev) => [...prev, id]);
    const bookingRef = doc(db, 'bookings', id);

    try {
      await updateDoc(bookingRef, { status });
      toast.success(`Booking ${status}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error('Failed to update booking');
      setDisabledIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {bookings.map((booking) => (
        <DadBookingCard
          key={booking.id}
          booking={booking}
          disabled={disabledIds.includes(booking.id)}
          onAccept={() => updateStatus(booking.id, 'accepted')}
          onReject={() => updateStatus(booking.id, 'rejected')}
        />
      ))}
    </div>
  );
};

export default DadDashboard;
