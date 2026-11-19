import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../api.js';
import { formatDate, getDisplayName, getRecords } from './adminHelpers.js';

const statuses = ['pending', 'approved', 'returned', 'late'];

export default function AdminBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadRequests = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchJson('/api/borrow-requests', { signal });
      setRequests(getRecords(result, 'borrow requests'));
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRequests(controller.signal);
    return () => controller.abort();
  }, [loadRequests]);

  async function updateStatus(request, status) {
    setUpdatingId(request._id);
    setError('');
    try {
      await fetchJson(`/api/borrow-requests/${encodeURIComponent(request._id)}`, {
        method: 'PATCH',
        body: { status },
      });
      await loadRequests();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <main className="catalog-section admin-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> LIBRARIAN WORKSPACE</p>
          <h1>Borrow <em>requests.</em></h1>
        </div>
        <span className="section-aside">Track loans and returns</span>
      </div>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      {loading && <div className="state-panel" role="status"><span className="loader" /><p>Loading borrow requests…</p></div>}
      {!loading && error && requests.length === 0 && <div className="state-panel state-error"><h3>Couldn’t load borrow requests.</h3><button className="button-secondary" type="button" onClick={() => loadRequests()}>Try again</button></div>}
      {!loading && !error && requests.length === 0 && <div className="state-panel"><h3>No borrow requests yet.</h3><p>New patron requests will appear here.</p></div>}
      {!loading && requests.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Book</th><th>Patron</th><th>Requested</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{getDisplayName(request.book?.title || request.book)}</strong></td>
                  <td>{getDisplayName(request.user)}</td>
                  <td>{formatDate(request.requestedAt)}</td>
                  <td>{formatDate(request.dueAt)}</td>
                  <td>{formatDate(request.returnedAt)}</td>
                  <td>{`$${Number(request.fine || 0).toFixed(2)}`}</td>
                  <td>
                    <select
                      className="status-select"
                      aria-label={`Status for ${getDisplayName(request.book?.title || request.book)}`}
                      value={request.status}
                      disabled={updatingId === request._id}
                      onChange={(event) => updateStatus(request, event.target.value)}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
