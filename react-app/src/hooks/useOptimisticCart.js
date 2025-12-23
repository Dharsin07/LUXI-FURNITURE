import { useState, useCallback } from 'react';
import { cartAPI } from '../services/api';

export const useOptimisticCart = (user, products, setCart, cart) => {
  const [cartLoading, setCartLoading] = useState({});
  const [pendingOperations, setPendingOperations] = useState(new Set());

  // Optimistic add to cart
  const addToCartOptimistic = useCallback(async (productId, quantity = 1) => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    const operationId = `add-${productId}-${Date.now()}`;
    
    // Set loading state for this specific operation
    setCartLoading(prev => ({ ...prev, [productId]: 'adding' }));
    setPendingOperations(prev => new Set(prev).add(operationId));

    try {
      // Optimistic UI update - add immediately
      const originalProduct = products.find(p => p.id === productId);
      const optimisticItem = {
        id: `temp-${operationId}`, // temporary ID
        productId: productId,
        name: originalProduct?.name || 'Unknown Product',
        price: originalProduct?.price || 0,
        image: originalProduct?.images?.[0] || '/placeholder.jpg',
        quantity: quantity,
        isOptimistic: true,
        operationId: operationId
      };

      // Update UI immediately
      setCart(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, optimisticItem];
      });

      // Perform backend operation asynchronously
      const result = await cartAPI.addToCart(productId, quantity);

      // Replace optimistic item with real data
      setCart(prev => prev.map(item => 
        item.operationId === operationId && result?.data
          ? {
              id: result.data.id || item.id,
              productId: result.data.product_id || item.productId,
              name: originalProduct?.name || 'Unknown Product',
              price: originalProduct?.price || 0,
              image: originalProduct?.images?.[0] || '/placeholder.jpg',
              quantity: result.data.quantity || item.quantity
            }
          : item
      ));

      return { success: true, data: result };
    } catch (error) {
      console.error('Error in addToCartOptimistic:', error);
      
      // Revert optimistic update on error
      setCart(prev => prev.filter(item => item.operationId !== operationId));
      
      return { success: false, error };
    } finally {
      // Clear loading state
      setCartLoading(prev => ({ ...prev, [productId]: null }));
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [user, products, setCart]);

  // Optimistic remove from cart
  const removeFromCartOptimistic = useCallback(async (productId) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    const operationId = `remove-${productId}-${Date.now()}`;
    const cartItem = cart.find(item => item.productId === productId);
    
    if (!cartItem) return { success: false, error: 'Item not found in cart' };

    // Set loading state
    setCartLoading(prev => ({ ...prev, [productId]: 'removing' }));
    setPendingOperations(prev => new Set(prev).add(operationId));

    // Store original item for potential rollback
    const originalItem = { ...cartItem };

    try {
      // Optimistic UI update - remove immediately
      setCart(prev => prev.filter(item => item.productId !== productId));

      // Perform backend operation asynchronously
      await cartAPI.removeFromCart(productId);

      return { success: true };
    } catch (error) {
      console.error('Error in removeFromCartOptimistic:', error);
      
      // Revert optimistic update on error
      setCart(prev => [...prev, originalItem]);
      
      return { success: false, error };
    } finally {
      // Clear loading state
      setCartLoading(prev => ({ ...prev, [productId]: null }));
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [user, cart, setCart]);

  // Optimistic update quantity
  const updateQuantityOptimistic = useCallback(async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return await removeFromCartOptimistic(productId);
    }

    if (!user) return { success: false, error: 'User not authenticated' };

    const operationId = `update-${productId}-${Date.now()}`;
    const cartItem = cart.find(item => item.productId === productId || item.id === productId);
    
    if (!cartItem) return { success: false, error: 'Item not found in cart' };

    // Set loading state
    setCartLoading(prev => ({ ...prev, [productId]: 'updating' }));
    setPendingOperations(prev => new Set(prev).add(operationId));

    // Store original quantity for potential rollback
    const originalQuantity = cartItem.quantity;

    try {
      // Optimistic UI update - update immediately
      setCart(prev => prev.map(item => 
        (item.productId === productId || item.id === productId)
          ? { ...item, quantity: newQuantity }
          : item
      ));

      // Perform backend operation asynchronously
      await cartAPI.updateCartItemQuantity(productId, newQuantity);

      return { success: true };
    } catch (error) {
      console.error('Error in updateQuantityOptimistic:', error);
      
      // Revert optimistic update on error
      setCart(prev => prev.map(item => 
        (item.productId === productId || item.id === productId)
          ? { ...item, quantity: originalQuantity }
          : item
      ));
      
      return { success: false, error };
    } finally {
      // Clear loading state
      setCartLoading(prev => ({ ...prev, [productId]: null }));
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [user, cart, setCart, removeFromCartOptimistic]);

  // Clear cart optimistically
  const clearCartOptimistic = useCallback(async () => {
    if (!user) return { success: false, error: 'User not authenticated' };

    const operationId = `clear-${Date.now()}`;
    
    // Set loading state
    setCartLoading(prev => ({ ...prev, clear: 'clearing' }));
    setPendingOperations(prev => new Set(prev).add(operationId));

    // Store original cart for potential rollback
    const originalCart = [...cart];

    try {
      // Optimistic UI update - clear immediately
      setCart([]);

      // Perform backend operation asynchronously
      await cartAPI.clearCart();

      return { success: true };
    } catch (error) {
      console.error('Error in clearCartOptimistic:', error);
      
      // Revert optimistic update on error
      setCart(originalCart);
      
      return { success: false, error };
    } finally {
      // Clear loading state
      setCartLoading(prev => ({ ...prev, clear: null }));
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [user, cart, setCart]);

  return {
    cartLoading,
    pendingOperations,
    addToCartOptimistic,
    removeFromCartOptimistic,
    updateQuantityOptimistic,
    clearCartOptimistic,
    isCartLoading: Object.values(cartLoading).some(state => state !== null),
    hasPendingOperations: pendingOperations.size > 0
  };
};
