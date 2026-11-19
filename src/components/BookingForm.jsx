import { useState } from 'react';
import { postJson } from '../api.js';

const spaces = ['Study Room A', 'Study Room B', 'Community Hall', 'Quiet Study Area'];

export default function BookingForm() {
  const [booking, setBooking] = useState({
    space: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    setBooking((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await postJson('/api/bookings', booking);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-card booking-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Space</span>
        <select name="space" value={booking.space} onChange={updateField} required>
          <option value="">Choose a space</option>
          {spaces.map((space) => <option key={space} value={space}>{space}</option>)}
        </select>
      </label>
      <label className="form-field">
        <span>Date</span>
        <input name="date" type="date" value={booking.date} onChange={updateField} required />
      </label>
      <div className="form-row">
        <label className="form-field">
          <span>Start time</span>
          <input name="startTime" type="time" value={booking.startTime} onChange={updateField} required />
        </label>
        <label className="form-field">
          <span>End time</span>
          <input
            name="endTime"
            type="time"
            value={booking.endTime}
            onChange={updateField}
            min={booking.startTime || undefined}
            required
          />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button-primary form-submit" type="submit" disabled={submitting}>
        {submitting ? 'Requesting…' : 'Request booking'} <span aria-hidden="true">→</span>
      </button>
      {saved && <p className="form-success" role="status">Your space booking is confirmed.</p>}
    </form>
  );
}
