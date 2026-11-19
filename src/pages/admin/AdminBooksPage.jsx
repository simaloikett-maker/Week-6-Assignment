import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../api.js';
import useGenres from '../../hooks/useGenres.js';
import { getRecords } from './adminHelpers.js';

const emptyDraft = {
  title: '',
  author: '',
  isbn: '',
  description: '',
  coverImage: '',
  totalCopies: '1',
  availableCopies: '1',
  genre: '',
};

async function fetchAllBooks(signal) {
  const pageSize = 100;
  const firstPage = await fetchJson(`/books?page=1&limit=${pageSize}`, { signal });
  const books = getRecords(firstPage, 'books');
  const totalPages = Math.max(1, Number(firstPage.pagination?.totalPages) || 1);
  for (let page = 2; page <= totalPages; page += 1) {
    const result = await fetchJson(`/books?page=${page}&limit=${pageSize}`, { signal });
    books.push(...getRecords(result, 'books'));
  }
  return books;
}

function draftFromBook(book) {
  return {
    title: book.title || '',
    author: book.author || '',
    isbn: book.isbn || '',
    description: book.description || '',
    coverImage: book.coverImage || '',
    totalCopies: String(book.totalCopies ?? 0),
    availableCopies: String(book.availableCopies ?? 0),
    genre: typeof book.genre === 'object' ? book.genre?._id || '' : book.genre || '',
  };
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const genresState = useGenres();

  const loadBooks = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      setBooks(await fetchAllBooks(signal));
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadBooks(controller.signal);
    return () => controller.abort();
  }, [loadBooks]);

  function updateDraft(event) {
    setDraft((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function startEditing(book) {
    setEditingId(book._id);
    setDraft(draftFromBook(book));
    setError('');
    setNotice('');
  }

  function cancelEditing() {
    setEditingId('');
    setDraft(emptyDraft);
  }

  async function saveBook(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const body = {
      ...draft,
      totalCopies: Number(draft.totalCopies),
      availableCopies: Number(draft.availableCopies),
    };
    try {
      await fetchJson(editingId ? `/books/${encodeURIComponent(editingId)}` : '/books', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      setNotice(editingId ? 'Book updated.' : 'Book added.');
      cancelEditing();
      await loadBooks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}" from the catalog?`)) return;
    setError('');
    setNotice('');
    try {
      await fetchJson(`/books/${encodeURIComponent(book._id)}`, { method: 'DELETE' });
      setNotice('Book deleted.');
      await loadBooks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="catalog-section admin-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> LIBRARIAN WORKSPACE</p>
          <h1>Manage <em>books.</em></h1>
        </div>
        <span className="section-aside">Catalog inventory and details</span>
      </div>

      <form className="form-card admin-book-form" onSubmit={saveBook}>
        <h2>{editingId ? 'Edit book' : 'Add a book'}</h2>
        <div className="admin-form-grid">
          <label className="form-field"><span>Title</span><input name="title" value={draft.title} onChange={updateDraft} required /></label>
          <label className="form-field"><span>Author</span><input name="author" value={draft.author} onChange={updateDraft} required /></label>
          <label className="form-field"><span>ISBN</span><input name="isbn" value={draft.isbn} onChange={updateDraft} required /></label>
          <label className="form-field">
            <span>Genre</span>
            <select name="genre" value={draft.genre} onChange={updateDraft} required disabled={genresState.loading}>
              <option value="">{genresState.loading ? 'Loading genres…' : 'Choose a genre'}</option>
              {genresState.genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
            </select>
          </label>
          <label className="form-field"><span>Cover image URL</span><input name="coverImage" type="url" value={draft.coverImage} onChange={updateDraft} required /></label>
          <label className="form-field"><span>Total copies</span><input name="totalCopies" type="number" min="0" step="1" value={draft.totalCopies} onChange={updateDraft} required /></label>
          <label className="form-field"><span>Available copies</span><input name="availableCopies" type="number" min="0" step="1" max={draft.totalCopies} value={draft.availableCopies} onChange={updateDraft} required /></label>
          <label className="form-field admin-description"><span>Description</span><textarea name="description" rows="3" value={draft.description} onChange={updateDraft} required /></label>
        </div>
        {genresState.error && <p className="form-error" role="alert">Couldn’t load genres: {genresState.error}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        <div className="admin-form-actions">
          <button className="button-primary" type="submit" disabled={saving || genresState.loading || Boolean(genresState.error)}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add book'}
          </button>
          {editingId && <button className="button-secondary" type="button" onClick={cancelEditing}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table-heading"><h2>Catalog books</h2><span>{!loading && `${books.length} books`}</span></div>
      {loading && <div className="state-panel" role="status"><span className="loader" /><p>Loading books…</p></div>}
      {!loading && error && books.length === 0 && (
        <div className="state-panel state-error" role="alert"><h3>Couldn’t load books.</h3><p>{error}</p><button className="button-secondary" type="button" onClick={() => loadBooks()}>Try again</button></div>
      )}
      {!loading && !error && books.length === 0 && <div className="state-panel"><h3>No books in the catalog yet.</h3><p>Add the first book using the form above.</p></div>}
      {!loading && books.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Book</th><th>ISBN</th><th>Genre</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td><strong>{book.title}</strong><span>{book.author}</span></td>
                  <td>{book.isbn}</td>
                  <td>{book.genre?.name || '—'}</td>
                  <td>{book.availableCopies} / {book.totalCopies}</td>
                  <td className="admin-row-actions">
                    <button className="table-action" type="button" onClick={() => startEditing(book)}>Edit</button>
                    <button className="table-action table-action-danger" type="button" onClick={() => deleteBook(book)}>Delete</button>
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
