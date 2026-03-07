import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Product } from './mockData';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

// Cart store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity, size, color) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor === color
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id &&
                item.selectedSize === size &&
                item.selectedColor === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity,
                selectedSize: size,
                selectedColor: color,
              },
            ],
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Wishlist store with persistence
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        set((state) => ({
          items: state.items.some((item) => item.id === product.id)
            ? state.items
            : [...state.items, product],
        }));
      },
      removeFromWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
