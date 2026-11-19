import BookingForm from '../components/BookingForm.jsx';

export default function BookingPage() {
  return (
    <main className="form-page booking-page">
      <p className="eyebrow"><span className="eyebrow-line" /> PLAN YOUR VISIT</p>
      <h1>Book a library <em>space.</em></h1>
      <p className="form-intro">Choose a space and time that works for you. The library checks for schedule conflicts before confirming.</p>
      <BookingForm />
    </main>
  );
}
