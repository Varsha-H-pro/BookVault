import './App.css';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import AuthPage from './components/AuthPage';

const AppContent = () => {
  const { user, logout, loading } = useAuth();
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshBooks, setRefreshBooks] = useState(false);

  const handleBookAdded = () => {
    setIsAddingBook(false);
    setRefreshBooks(prev => !prev);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div>
      <div className="header">
        <span className="header-icon">📚</span>
        <span className="header-title">BookVault</span>
        <span className="header-subtitle">Complete Book Management System</span>
        <div className="user-info">
          <div>
            <span className="user-welcome">Welcome back, </span>
            <span className="user-name">{user.username}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
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

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;