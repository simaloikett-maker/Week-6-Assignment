import { Link } from 'react-router-dom';
import useReadingList from '../hooks/useReadingList.js';

export default function BookCard({ book, children }) {
  const genreName = typeof book.genre === 'object' ? book.genre?.name : '';
  const { readingList, addBook, removeBook } = useReadingList();
  const bookId = book._id || book.id;
  const isSaved = readingList.some((savedBook) => (savedBook._id || savedBook.id) === bookId);

  return (
    <article className="book-card">
      <Link className="book-cover-link" to={`/books/${book._id}`} aria-label={`View ${book.title}`}>
        <div className="book-cover">
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = '/book-placeholder.svg';
            }}
          />
        </div>
      </Link>
      <div className="book-card-copy">
        {genreName && <span className="book-genre">{genreName}</span>}
        <h2><Link to={`/books/${book._id}`}>{book.title}</Link></h2>
        <p>by {book.author}</p>
        <button
          className={`saved-button${isSaved ? ' is-saved' : ''}`}
          type="button"
          onClick={() => (isSaved ? removeBook(bookId) : addBook(book))}
          aria-pressed={isSaved}
          aria-label={`${isSaved ? 'Remove' : 'Add'} ${book.title} ${isSaved ? 'from' : 'to'} reading list`}
        >{isSaved ? 'Saved' : '＋ Save'}</button>
        {children}
        <Link className="card-arrow" to={`/books/${book._id}`} aria-label={`Read about ${book.title}`}>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
