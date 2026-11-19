import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../api.js';
import { formatDate, getDisplayName, getRecords } from './adminHelpers.js';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchJson('/api/bookings', { signal });
      setBookings(getRecords(result, 'bookings'));
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadBookings(controller.signal);
    return () => controller.abort();
  }, [loadBookings]);

  return (
    <main className="catalog-section admin-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> LIBRARIAN WORKSPACE</p>
          <h1>Space <em>bookings.</em></h1>
        </div>
        <span className="section-aside">All patron reservations</span>
      </div>
      {error && bookings.length > 0 && <p className="admin-alert" role="alert">{error}</p>}
      {loading && <div className="state-panel" role="status"><span className="loader" /><p>Loading bookings…</p></div>}
      {!loading && error && bookings.length === 0 && <div className="state-panel state-error" role="alert"><h3>Couldn’t load bookings.</h3><p>{error}</p><button className="button-secondary" type="button" onClick={() => loadBookings()}>Try again</button></div>}
      {!loading && !error && bookings.length === 0 && <div className="state-panel"><h3>No space bookings yet.</h3><p>New reservations will appear here.</p></div>}
      {!loading && bookings.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Space</th><th>Patron</th><th>Date</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td><strong>{getDisplayName(booking.space)}</strong></td>
                  <td>{getDisplayName(booking.user)}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>{booking.startTime}</td>
                  <td>{booking.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
