
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PDVProductList } from '@/components/pdv/PDVProductList';
import { PDVCart } from '@/components/pdv/PDVCart';
import { Product, ProductAddon } from '@/types';

export default function PDV() {
  const [cartItems, setCartItems] = useState<{
    product: Product;
    quantity: number;
    selectedAddons?: ProductAddon[];
    notes?: string;
  }[]>([]);

  const handleAddToCart = (
    product: Product, 
    quantity = 1, 
    selectedAddons?: ProductAddon[], 
    notes?: string
  ) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => {
        if (item.product.id !== product.id) return false;
        if (item.notes !== notes) return false;
        if ((!item.selectedAddons && selectedAddons) || 
            (item.selectedAddons && !selectedAddons)) return false;
        if (!item.selectedAddons && !selectedAddons) return true;
        if (item.selectedAddons && selectedAddons) {
          if (item.selectedAddons.length !== selectedAddons.length) return false;
          return item.selectedAddons.every(itemAddon => {
            const matchingAddon = selectedAddons.find(a => a.id === itemAddon.id);
            return matchingAddon && matchingAddon.quantity === itemAddon.quantity;
          });
        }
        return false;
      });

      if (existingItemIndex >= 0) {
        return prev.map((item, index) => 
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity, selectedAddons, notes }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="PDV - Ponto de Venda" />
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <PDVProductList onAddToCart={handleAddToCart} />
        </div>
        <div className="w-[500px] overflow-auto">
          <PDVCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
          />
        </div>
      </div>
    </div>
  );
}
