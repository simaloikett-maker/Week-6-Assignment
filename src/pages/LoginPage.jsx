import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      navigate(location.state?.from?.pathname || (user.role === 'librarian' ? '/admin/books' : '/booking'), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="form-page">
      <p className="eyebrow"><span className="eyebrow-line" /> WELCOME BACK</p>
      <h1>Sign in to <em>Open Shelf.</em></h1>
      <p className="form-intro">Sign in to keep your reading list close and book a library space.</p>
      <form className="form-card" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {(error || authError) && <p className="form-error" role="alert">{error || authError}</p>}
        <button className="button-primary form-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
        </button>
        <p className="form-switch">New to Open Shelf? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
