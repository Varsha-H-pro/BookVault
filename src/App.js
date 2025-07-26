import './App.css';
import React, { useState } from 'react';
import BookList from './components/BookList';
import AddBook from './components/AddBook';

const App = () => {
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshBooks, setRefreshBooks] = useState(false);

  const handleBookAdded = () => {
    setIsAddingBook(false);
    setRefreshBooks(prev => !prev);
  };

  return (
    <div>
      <div className="header">
     <span className="header-icon">📚</span>
     <span className="header-title">BookVault</span>
     <span className="header-subtitle">Complete Book Management System</span>
   </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 40px 0 40px' }}>
        <button
          className="add-book-btn"
          onClick={() => setIsAddingBook(true)}
        >
          + Add Book
        </button>
      </div>
      {/* Search bar */}
      <div className="search-bar-container">
        <input
          className="search-bar"
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Book list */}
      <BookList searchTerm={searchTerm} refresh={refreshBooks} />
      {/* AddBook modal */}
      {isAddingBook && (
        <AddBook
          onClose={() => setIsAddingBook(false)}
          onBookAdded={handleBookAdded}
        />
      )}
    </div>
  );
};

export default App;