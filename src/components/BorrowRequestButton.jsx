import { useState } from 'react';
import { postJson } from '../api.js';

export default function BorrowRequestButton({ book }) {
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestBorrow() {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await postJson('/api/borrow-requests', { bookId: book._id || book.id });
      setRequested(true);
      setMessage('Borrow request sent.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="borrow-request-button" type="button" onClick={requestBorrow} disabled={submitting || requested}>
        {submitting ? 'Requesting…' : requested ? 'Request sent' : 'Request to borrow'}
      </button>
      {message && <span className="borrow-request-message" role="status">{message}</span>}
      {error && <span className="borrow-request-error" role="alert">{error}</span>}
    </>
  );
}
