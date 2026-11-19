import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <main className="message-page" role="status"><span className="loader" /><p>Checking your account…</p></main>;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return (
      <main className="message-page" role="alert">
        <p className="eyebrow">ACCESS RESTRICTED</p>
        <h1>Librarian access is required.</h1>
      </main>
    );
  }

  return children;
}
