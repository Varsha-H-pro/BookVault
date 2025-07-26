import React, { useState } from 'react';
import axios from 'axios';

const EditBook = ({ book, onClose, onBookUpdated }) => {
  const [formData, setFormData] = useState({ ...book });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Ensure this matches your backend route (which it does)
      await axios.put(`http://localhost:5001/api/books/${book.id}`, formData);
      if (onBookUpdated) onBookUpdated();
      onClose();
    } catch (error) {
      alert('Failed to update book: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal" style={modalStyle}>
        <h2>Edit Book</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
          <input name="author" placeholder="Author" value={formData.author} onChange={handleChange} required />
          <input name="isbn" placeholder="ISBN" value={formData.isbn || ''} onChange={handleChange} />
          <input name="publicationYear" placeholder="Publication Year" value={formData.publicationYear || ''} onChange={handleChange} />
          <input name="genre" placeholder="Genre" value={formData.genre || ''} onChange={handleChange} />
          <input name="price" type="number" placeholder="Price" value={formData.price || ''} onChange={handleChange} required />
          <input name="stockQuantity" type="number" placeholder="Stock Quantity" value={formData.stockQuantity || ''} onChange={handleChange} required />
          <input name="cover_image" type="url" placeholder="Cover Image URL" value={formData.cover_image || ''} onChange={handleChange} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="submit" style={buttonPrimaryStyle}>Update</button>
            <button type="button" onClick={onClose} style={buttonSecondaryStyle}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple inline styling for modal (you can replace with CSS classes)
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff',
  padding: '30px',
  borderRadius: '10px',
  width: '400px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
};

const buttonPrimaryStyle = {
  padding: '8px 16px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const buttonSecondaryStyle = {
  padding: '8px 16px',
  backgroundColor: '#e5e7eb',
  color: '#111',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default EditBook;
