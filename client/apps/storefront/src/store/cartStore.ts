import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    cartItemId?: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    vendorId: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
    getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.productId === item.productId && i.variantId === item.variantId
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += item.quantity;
                        return { items: newItems, isOpen: true }; // Open cart drawer on add
                    }

                    return { items: [...state.items, item], isOpen: true };
                });
            },
            removeItem: (productId, variantId) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && i.variantId === variantId)
                    ),
                }));
            },
            updateQuantity: (productId, quantity, variantId) => {
                if (quantity < 1) return;
                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId && i.variantId === variantId
                            ? { ...i, quantity }
                            : i
                    ),
                }));
            },
            clearCart: () => set({ items: [] }),
            setIsOpen: (isOpen) => set({ isOpen }),
            getCartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'spider-nits-cart',
        }
    )
);
