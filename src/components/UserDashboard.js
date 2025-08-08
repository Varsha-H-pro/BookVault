import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BookCatalog from './BookCatalog';
import Cart from './Cart';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartRefresh, setCartRefresh] = useState(false);

  const handleCartUpdate = () => {
    setCartRefresh(prev => !prev);
  };

  return (
    <div>
      <div className="header">
        <span className="header-icon">📚</span>
        <span className="header-title">BookVault</span>
        <span className="header-subtitle">Discover & Shop Books</span>
        <div className="user-info">
          <div>
            <span className="user-welcome">Welcome, </span>
            <span className="user-name">{user.username}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '20px 40px 0 40px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              background: activeTab === 'books' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'books' ? '#fff' : '#64748b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px 0 0 8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📚 Browse Books
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            style={{
              background: activeTab === 'cart' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'cart' ? '#fff' : '#64748b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '0 8px 8px 0',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🛒 My Cart
          </button>
        </div>
      </div>
      
      {activeTab === 'books' && (
        <>
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
          
          <BookCatalog searchTerm={searchTerm} onCartUpdate={handleCartUpdate} />
        </>
      )}
      
      {activeTab === 'cart' && (
        <Cart refresh={cartRefresh} onCartUpdate={handleCartUpdate} />
      )}
    </div>
  );
};

export default UserDashboard;