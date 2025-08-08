import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditBook from './EditBook'; // Import EditBook component

const BookList = ({ searchTerm, refresh = false, isAdmin = false }) => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/books');
      setBooks(res.data);
    } catch (err) {
      setBooks([]);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this book?`)) return;
    try {
      await axios.delete(`http://localhost:5001/api/books/id/${id}`);
      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      alert('Failed to delete book.');
    }
  };

  const handleBookUpdated = () => {
    setEditingBook(null);
    fetchBooks();
  };

  const filteredBooks = books.filter(book =>
    (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 800, margin: '32px auto' }}>
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📚</span>
          <div className="empty-state-title">No books found</div>
          <div className="empty-state-desc">Try adding a new book or searching with a different term.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredBooks.map(book => (
            <div
              key={book.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(16,30,54,0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Cover Image */}
              {book.cover_image && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={book.cover_image}
                    alt={`Cover of ${book.title}`}
                    style={{
                      width: '120px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Book Info */}
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {book.title}
                </h3>
                <p style={{
                  margin: '0 0 8px 0',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  by {book.author}
                </p>
                <p style={{
                  margin: '0 0 8px 0',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  ISBN: {book.isbn || 'N/A'} | Year: {book.publicationYear || 'N/A'} | Genre: {book.genre || 'N/A'}
                </p>
                <p style={{
                  margin: '0 0 16px 0',
                  color: '#2563eb',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Price: {book.price ? `₹${book.price}` : 'N/A'} | Stock: {book.stockQuantity || 0}
                </p>
                {isAdmin && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
                    </button>
                    <button
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '10px'
                      }}
                      onClick={() => setEditingBook(book)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EditBook Modal */}
      {editingBook && isAdmin && (
        <EditBook
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onBookUpdated={handleBookUpdated}
        />
      )}
    </div>
  );
};

export default BookList;
