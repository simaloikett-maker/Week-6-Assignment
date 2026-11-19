import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import BorrowRequestButton from '../components/BorrowRequestButton.jsx';
import useReadingList from '../hooks/useReadingList.js';

export default function ReadingListPage() {
  const { readingList, clearList } = useReadingList();

  return (
    <main className="catalog-section reading-list-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> YOUR BOOKSHELF</p>
          <h1>My reading <em>list.</em></h1>
        </div>
        {readingList.length > 0 && (
          <button className="button-secondary clear-list" type="button" onClick={clearList}>Clear list</button>
        )}
      </div>
      {readingList.length ? (
        <div className="book-grid">
          {readingList.map((book) => (
            <BookCard key={book._id || book.id} book={book}>
              <BorrowRequestButton book={book} />
            </BookCard>
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <span className="state-symbol" aria-hidden="true">♡</span>
          <h2>Your list is waiting for a story.</h2>
          <p>Save a book from the catalog and it will be here, even after you refresh.</p>
          <Link className="button-primary" to="/">Explore the catalog <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </main>
  );
}
