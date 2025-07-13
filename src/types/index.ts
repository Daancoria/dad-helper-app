export interface Booking {
  id: string;
  parentEmail: string;
  date: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}
