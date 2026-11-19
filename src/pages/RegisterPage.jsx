import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register, error: authError } = useAuth();
  const [username, setUsername] = useState('');
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
      const user = await register({ username, email, password });
      navigate(location.state?.from?.pathname || (user.role === 'librarian' ? '/admin/books' : '/booking'), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="form-page">
      <p className="eyebrow"><span className="eyebrow-line" /> JOIN THE LIBRARY</p>
      <h1>Make room for <em>stories.</em></h1>
      <p className="form-intro">Create an account to save books and request a library space.</p>
      <form className="form-card" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Name</span>
          <input type="text" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} minLength={2} required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Password <small>(at least 8 characters)</small></span>
          <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        </label>
        {(error || authError) && <p className="form-error" role="alert">{error || authError}</p>}
        <button className="button-primary form-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span>
        </button>
        <p className="form-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
