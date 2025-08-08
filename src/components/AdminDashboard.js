import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BookList from './BookList';
import AddBook from './AddBook';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
        <span className="header-title">BookVault Admin</span>
        <span className="header-subtitle">Book Management System</span>
        <div className="user-info">
          <div>
            <span className="user-welcome">Welcome back, </span>
            <span className="user-name">{user.username}</span>
            <span style={{ 
              background: '#dc2626', 
              color: '#fff', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.8rem',
              marginLeft: '8px'
            }}>
              ADMIN
            </span>
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
      <BookList searchTerm={searchTerm} refresh={refreshBooks} isAdmin={true} />
      
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

export default AdminDashboard;