import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure mail transporter with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

// Firestore trigger: when a new booking is created
export const sendBookingEmail = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot) => {
    const booking = snap.data();

    if (!booking || !booking.dadEmail) {
      console.error('❌ Booking data missing or no dadEmail.');
      return;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `Dad Helper <${functions.config().gmail.user}>`,
      to: booking.dadEmail,
      subject: '📬 New Booking Request!',
      text: `Hi! You've received a new booking from ${
        booking.parentName || 'a user'
      }.\n\nMessage:\n${booking.message || 'No message provided.'}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent to:', booking.dadEmail);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  });
