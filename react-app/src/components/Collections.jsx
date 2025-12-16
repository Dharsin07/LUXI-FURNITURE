import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../utils/helpers';

const Collections = () => {
  const collections = [
    {
      category: 'living-room',
      title: 'Living Room',
      description: 'Sophisticated sofas and chairs that anchor your living space',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'dining',
      title: 'Dining Room',
      description: 'Elegant tables and chairs for memorable dining experiences',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'bedroom',
      title: 'Bedroom',
      description: 'Serene and sophisticated pieces for your private sanctuary',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
    
  ];

  return (
    <section className="section" id="collections">
      <div className="container">
        <div className="section-header fade-in">
          <h2 className="section-title">Featured Collections</h2>
          <p className="section-subtitle">
            Meticulously crafted pieces that define elegance and sophistication in every detail
          </p>
        </div>
        
        <div className="collections-grid">
          {collections.map((collection, index) => (
            <div 
              key={index}
              className="collection-card fade-in" 
              role="presentation"
            >
              <div className="collection-image">
                <img
                  src={collection.image}
                  alt={collection.title}
                  loading="eager"
                />
              </div>
              <div className="collection-content">
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link
                  to={`/collection/${collection.category}`}
                  className="btn btn-secondary"
                >
                  View Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;