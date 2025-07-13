'use client';
import { useState } from 'react';
import { DadModal } from './DadModal';

type Dad = {
  uid: string;
  displayName: string;
  bio: string;
  photoURL?: string;
  email: string;
};

export function DadCard({ dad }: { dad: Dad }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded p-4 shadow">
      <h2 className="text-lg font-bold">{dad.displayName}</h2>
      <p className="text-sm text-gray-600">{dad.email}</p>
      <p className="mt-2">{dad.bio}</p>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Book
      </button>
      {open && <DadModal dad={dad} onClose={() => setOpen(false)} />}
    </div>
  );
}
