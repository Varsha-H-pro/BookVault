import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookCatalog = ({ searchTerm, onCartUpdate }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddToCart = async (bookId) => {
    try {
      await axios.post('http://localhost:5001/api/cart', {
        book_id: bookId,
        quantity: 1
      });
      alert('Book added to cart successfully!');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      alert('Failed to add book to cart: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredBooks = books.filter(book =>
    (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📚</span>
          <div className="empty-state-title">No books found</div>
          <div className="empty-state-desc">Try searching with a different term.</div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px',
          padding: '20px 0'
        }}>
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
                gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,30,54,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(16,30,54,0.08)';
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
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#1e293b'
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
                  {book.genre && `${book.genre} • `}
                  {book.publicationYear && `${book.publicationYear}`}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '16px 0'
                }}>
                  <span style={{
                    color: '#2563eb',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    ₹{book.price}
                  </span>
                  <span style={{
                    color: book.stockQuantity > 0 ? '#059669' : '#dc2626',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(book.id)}
                disabled={book.stockQuantity === 0}
                style={{
                  background: book.stockQuantity > 0 ? '#2563eb' : '#94a3b8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  cursor: book.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  if (book.stockQuantity > 0) {
                    e.target.style.background = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (book.stockQuantity > 0) {
                    e.target.style.background = '#2563eb';
                  }
                }}
              >
                {book.stockQuantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookCatalog;