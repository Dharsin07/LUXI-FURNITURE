import React from 'react';

const ProductToast = ({ product }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '8px',
      minWidth: '250px'
    }}>
      <img 
        src={product?.image || '/placeholder.jpg'} 
        alt={product?.name || 'Product'}
        style={{ 
          width: '50px', 
          height: '50px', 
          objectFit: 'cover', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}
        onError={(e) => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjRmNGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
          e.target.onerror = null;
        }}
      />
      
      <div style={{ flex: 1, padding: '0' }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#333', 
          marginBottom: '4px', 
          fontSize: '14px' 
        }}>
          {product?.name || 'Product'}
        </div>
        <div style={{ color: '#666', fontSize: '12px' }}>
          Added to cart successfully!
        </div>
      </div>
    </div>
  );
};

export default ProductToast;
