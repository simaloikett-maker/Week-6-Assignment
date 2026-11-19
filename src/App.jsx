import { Link, Navigate, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminBooksPage from './pages/admin/AdminBooksPage.jsx';
import AdminBorrowRequestsPage from './pages/admin/AdminBorrowRequestsPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';

function NotFoundPage() {
  return (
    <main className="message-page">
      <p className="eyebrow">404 · Page not found</p>
      <h1>This page isn’t on our shelves.</h1>
      <Link className="text-link" to="/">Return to the catalog</Link>
    </main>
  );
}

function AppContent() {
  const { user, status, error, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // The context keeps the user signed in and exposes the request error.
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Open Shelf home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>open shelf<span className="brand-period">.</span></span>
        </Link>
        <span className="header-note">Your next favorite is waiting.</span>
        <nav className="site-navigation" aria-label="Main navigation">
          <Link to="/reading-list">Reading list</Link>
          {status === 'authenticated' ? (
            <>
              <Link to="/booking">Book a space</Link>
              {user?.role === 'librarian' && (
                <>
                  <Link to="/admin/books">Admin: books</Link>
                  <Link to="/admin/borrow-requests">Borrow requests</Link>
                  <Link to="/admin/bookings">Bookings</Link>
                </>
              )}
              <span className="account-name">{user?.username || user?.email}</span>
              <button type="button" className="nav-button" onClick={handleLogout}>Sign out</button>
            </>
          ) : status === 'loading' ? (
            <span className="account-name">Checking session…</span>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      {error && <p className="auth-notice" role="alert">{error}</p>}
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
        <Route path="/login" element={status === 'authenticated' ? <Navigate to={user?.role === 'librarian' ? '/admin/books' : '/booking'} replace /> : <LoginPage />} />
        <Route path="/register" element={status === 'authenticated' ? <Navigate to={user?.role === 'librarian' ? '/admin/books' : '/booking'} replace /> : <RegisterPage />} />
        <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/admin/books" element={<ProtectedRoute role="librarian"><AdminBooksPage /></ProtectedRoute>} />
        <Route path="/admin/borrow-requests" element={<ProtectedRoute role="librarian"><AdminBorrowRequestsPage /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute role="librarian"><AdminBookingsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer">
        <Link to="/" className="footer-brand">open shelf</Link>
        <span>A little more room for a good story.</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ReadingListProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ReadingListProvider>
  );
}
