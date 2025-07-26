import React, { useState } from 'react';
import axios from 'axios';

const AddBook = ({ onClose, onBookAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationYear: '',
    genre: '',
    price: '',
    stockQuantity: '',
    cover_image: ''
  });

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
      console.log('Submitting book data:', formData); // For debugging
      const response = await axios.post('http://localhost:5001/api/books', formData);
      console.log('Book added successfully:', response.data);
      if (onBookAdded) onBookAdded();
      onClose();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Book</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="author"
            placeholder="Author"
            value={formData.author}
            onChange={handleChange}
            required
          />
          <input
            name="isbn"
            placeholder="ISBN"
            value={formData.isbn}
            onChange={handleChange}
          />
          <input
            name="publicationYear"
            placeholder="Publication Year"
            value={formData.publicationYear}
            onChange={handleChange}
          />
          <input
            name="genre"
            placeholder="Genre"
            value={formData.genre}
            onChange={handleChange}
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <input
            name="stockQuantity"
            type="number"
            placeholder="Stock Quantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
          />
          <input
            name="cover_image"
            type="url"
            placeholder="Cover Image URL (optional)"
            value={formData.cover_image}
            onChange={handleChange}
          />
          <button type="submit">Add Book</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;