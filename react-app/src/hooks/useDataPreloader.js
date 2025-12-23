import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';

export const useDataPreloader = (user, products = []) => {
  const [preloadedData, setPreloadedData] = useState({
    cart: [],
    wishlist: [],
    reviewsByProduct: {},
    isLoading: false,
    error: null
  });

  const preloadData = useCallback(async (userId) => {
    if (!userId) return;

    setPreloadedData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const productIds = Array.isArray(products) ? products.map(p => p?.id).filter(Boolean) : [];

      // Load cart data using backend API
      const cartResponse = await cartAPI.getCartItems();
      const cartData = cartResponse?.data?.items || [];

      // Process cart data with product image fallback
      const formattedCart = cartData.map(item => {
        return {
          id: item.id,
          productId: item.product_id,
          name: item.products?.name || 'Unknown Product',
          price: item.products?.price || 0,
          image: item.products?.images?.[0] || '/placeholder.jpg',
          quantity: item.quantity
        };
      });

      // For now, keep wishlist empty since we don't have backend API for it yet
      const formattedWishlist = [];

      // For now, keep reviews empty since we don't have backend API for it yet
      const reviewsMap = {};

      setPreloadedData({
        cart: formattedCart,
        wishlist: formattedWishlist,
        reviewsByProduct: reviewsMap,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Data preloading failed:', error);
      setPreloadedData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [products]);

  // Clear data when user logs out
  const clearData = useCallback(() => {
    setPreloadedData({
      cart: [],
      wishlist: [],
      reviewsByProduct: {},
      isLoading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    if (user && (user.uid || user.id)) {
      const userId = user.uid || user.id;
      preloadData(userId);
    } else {
      clearData();
    }
  }, [user, preloadData, clearData]);

  return {
    ...preloadedData,
    preloadData,
    clearData
  };
};
