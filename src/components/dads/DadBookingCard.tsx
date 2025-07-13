'use client';

interface Booking {
  id: string;
  parentEmail: string;
  date: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface DadBookingCardProps {
  booking: Booking;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export default function DadBookingCard({ booking, onAccept, onReject, disabled }: DadBookingCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow bg-white">
      <p><strong>Parent Email:</strong> {booking.parentEmail}</p>
      <p><strong>Date:</strong> {booking.date}</p>
      <p><strong>Message:</strong> {booking.message}</p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onAccept}
          disabled={disabled}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          disabled={disabled}
          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
